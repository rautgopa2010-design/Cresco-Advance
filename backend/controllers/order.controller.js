const { validationResult } = require("express-validator");
const db = require("../models");
const { getParentRoles } = require("../utility/roleHelper");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const AssignedIncentives = db.assignedIncentives;
const IncentiveFormulaMaster = db.incentiveFormulaMaster;
const EmployeeIncentives = db.employeeIncentives;
const Employee = db.employee;
const Order = db.order;
const OrderPaymentSchedule = db.orderPaymentSchedule;
const Roles = db.roles;

/* ----------------------- utils ----------------------- */
const monthNameFromDDMMYYYY = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [dd, mm, yyyy] = dateStr.split("-").map((x) => x.trim());
  if (!mm) return null;
  const monthIndex = parseInt(mm, 10) - 1;
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return names[monthIndex] || null;
};

const sameMonthName = (a, b) =>
  (a || "").toLowerCase() === (b || "").toLowerCase();

const toNumber = (x, def = 0) => {
  if (x === null || x === undefined) return def;
  const n = Number(String(x).replace(/,/g, ""));
  return Number.isFinite(n) ? n : def;
};

/* Incentive calculation */
const calculateIncentive = (
  formulaType,
  rawConfig,
  sales,
  eligible,
  target
) => {
  const formulaConfig =
    typeof rawConfig === "string"
      ? JSON.parse(rawConfig || "{}")
      : rawConfig || {};
  const s = toNumber(sales);
  const eligibleAmt = toNumber(eligible);
  const targetAmt = toNumber(target);

  switch ((formulaType || "").toLowerCase()) {
    case "fixed":
      if (s < eligibleAmt)
        return { amount: 0, rate: toNumber(formulaConfig.rate) };
      return {
        amount: s * toNumber(formulaConfig.rate),
        rate: toNumber(formulaConfig.rate),
      };

    case "slab": {
      const slabs = Array.isArray(formulaConfig.slabs)
        ? formulaConfig.slabs
        : [];
      if (!slabs.length) return { amount: 0, rate: 0 };
      let incentive = 0;
      let mainRate = 0;
      for (const slab of slabs) {
        const min = toNumber(slab.min);
        const max =
          slab.max == null ? Number.POSITIVE_INFINITY : toNumber(slab.max);
        const rate = toNumber(slab.rate);
        if (s >= min && s <= max) {
          incentive = s * rate;
          mainRate = rate;
          break;
        } else if (s > max && max !== Number.POSITIVE_INFINITY) continue;
      }
      const lastSlab = slabs[slabs.length - 1];
      const lastRate = toNumber(lastSlab.rate);
      const lastMax =
        lastSlab.max == null
          ? Number.POSITIVE_INFINITY
          : toNumber(lastSlab.max);
      if (s > lastMax) {
        incentive = s * lastRate;
        mainRate = lastRate;
      }
      return { amount: incentive, rate: mainRate };
    }

    case "bonus":
      if (s < eligibleAmt) return { amount: 0, rate: 0 };
      return { amount: toNumber(formulaConfig.bonus), rate: 0 };

    default:
      return { amount: 0, rate: 0 };
  }
};

/* Get role ID */
const getRoleIdByName = async (org_id, roleName) => {
  const role = await Roles.findOne({ where: { org_id, role_name: roleName } });
  return role ? role.id : null;
};

/* Upsert employee incentive */
const upsertEmployeeIncentive = async (
  employee_id,
  assigned_incentive_id,
  achieved_sales,
  calculated_incentive,
  display_rate = null
) => {
  const existing = await EmployeeIncentives.findOne({
    where: { employee_id, assigned_incentive_id },
  });

  if (existing) {
    await existing.update({
      achieved_sales,
      calculated_incentive,
      display_rate,
    });
  } else {
    await EmployeeIncentives.create({
      employee_id,
      assigned_incentive_id,
      achieved_sales,
      calculated_incentive,
      display_rate,
      status: "pending",
    });
  }
};

// Recalculate incentives for the order's month (exclude/include canceled orders)
const recalculateIncentivesForMonth = async (
  org_id,
  user_id,
  orderMonthName
) => {
  // 1. Find employee
  const employee = await Employee.findOne({
    where: { org_id, user_id },
    include: [{ model: Roles, as: "role" }],
  });
  if (!employee) return;

  const employee_id = employee.id;
  const employeeRoleName = employee.role.role_name;

  // 2. Get active orders this month (exclude Canceled)
  const allOrders = await Order.findAll({ where: { org_id, user_id } });
  const activeOrdersThisMonth = allOrders.filter(
    (o) =>
      sameMonthName(monthNameFromDDMMYYYY(o.date), orderMonthName) &&
      o.status !== "Canceled"
  );

  // 3. Aggregate products from active orders
  let allProductsThisMonth = [];
  for (const order of activeOrdersThisMonth) {
    const parsed = parseJSON(order.productOrderDetails, {});
    allProductsThisMonth.push(...(parsed?.intrastate || []));
    allProductsThisMonth.push(...(parsed?.interstate || []));
  }

  // 4. Get assigned incentives for the month
  const assignedList = await AssignedIncentives.findAll({
    where: { org_id, employee_id },
    include: [
      { model: IncentiveFormulaMaster, as: "formula" },
      { model: IncentiveFormulaMaster, as: "partitionFormula" },
    ],
  });
  const assignedForMonth = assignedList.filter((a) =>
    sameMonthName(a.month, orderMonthName)
  );

  // 5. For each assigned incentive, recalculate
  for (const assigned of assignedForMonth) {
    const assignedProduct = (assigned.selectedProductName || "").trim();
    const totalAchieved = allProductsThisMonth
      .filter((p) => (p.product || "").trim() === assignedProduct)
      .reduce((sum, p) => sum + toNumber(p.subTotal, 0), 0);

    const formulaType = assigned.formula?.formula_type?.toLowerCase() || "";
    const formulaCfg = parseJSON(assigned.formula?.formula_config, {});
    const { amount: totalIncentive, rate: mainRate } = calculateIncentive(
      formulaType,
      formulaCfg,
      totalAchieved,
      assigned.eligible_amount,
      assigned.targeted_amount
    );

    // Reset incentive if totalAchieved is 0
    if (totalAchieved <= 0) {
      await upsertEmployeeIncentive(employee_id, assigned.id, 0, 0, null);
      // Optionally reset partitions (set to 0 for all related employees)
      if (assigned.partitionFormula) {
        const partitionConfig = parseJSON(
          assigned.partitionFormula.formula_config,
          {}
        );
        const shares = partitionConfig[employeeRoleName] || {};
        for (const [roleName, percentStr] of Object.entries(shares)) {
          const percent = parseFloat(percentStr || 0);
          const shareIncentive = 0;
          const displayRate = "0%";
          if (roleName.startsWith("assigned_")) {
            await upsertEmployeeIncentive(
              employee_id,
              assigned.id,
              0,
              0,
              displayRate
            );
          } else {
            const targetRoleId = await getRoleIdByName(org_id, roleName);
            if (targetRoleId) {
              const targetEmployees = await Employee.findAll({
                where: { org_id, role_id: targetRoleId },
              });
              for (const targetEmployee of targetEmployees) {
                await upsertEmployeeIncentive(
                  targetEmployee.id,
                  assigned.id,
                  0,
                  0,
                  displayRate
                );
              }
            }
          }
        }
      }
      continue;
    }

    // Handle bonus (no partition)
    if (formulaType === "bonus") {
      const displayRate = `${totalIncentive}`;
      await upsertEmployeeIncentive(
        employee_id,
        assigned.id,
        totalAchieved,
        totalIncentive,
        displayRate
      );
      continue;
    }

    // Handle partition or direct
    const partitionFormula = assigned.partitionFormula;
    if (partitionFormula && partitionFormula.formula_config) {
      const partitionConfig = parseJSON(partitionFormula.formula_config, {});
      const shares = partitionConfig[employeeRoleName] || {};
      for (const [roleName, percentStr] of Object.entries(shares)) {
        const percent = parseFloat(percentStr || 0);
        const shareIncentive = totalIncentive * (percent / 100);
        const displayRate = `${mainRate * 100}% of ${percent}%`;
        if (roleName.startsWith("assigned_")) {
          await upsertEmployeeIncentive(
            employee_id,
            assigned.id,
            totalAchieved,
            shareIncentive,
            displayRate
          );
        } else {
          const targetRoleId = await getRoleIdByName(org_id, roleName);
          if (!targetRoleId) continue;
          const targetEmployees = await Employee.findAll({
            where: { org_id, role_id: targetRoleId },
          });
          for (const targetEmployee of targetEmployees) {
            await upsertEmployeeIncentive(
              targetEmployee.id,
              assigned.id,
              totalAchieved,
              shareIncentive,
              displayRate
            );
          }
        }
      }
    } else {
      const displayRate = mainRate > 0 ? `${mainRate}%` : null;
      await upsertEmployeeIncentive(
        employee_id,
        assigned.id,
        totalAchieved,
        totalIncentive,
        displayRate
      );
    }
  }
};

/* ----------------------- Create Order ----------------------- */
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const userRoleId = req.user.role_id;

  const {
    selectedCompany,
    customerPerson,
    email,
    mobile,
    date,
    billingAddress,
    shippingAddress,
    productOrderDetails,
    orderPaymentDetails,
    finalAmt,
  } = req.body;

  try {
    // ===== Generate next numeric order number (001, 002, ...) =====
    const lastOrder = await Order.findOne({
      where: { org_id },
      order: [["id", "DESC"]],
    });

    let nextNumber = 1;

    if (lastOrder?.orderNo) {
      nextNumber = parseInt(lastOrder.orderNo, 10) + 1;
    }

    const orderNo = String(nextNumber).padStart(3, "0");

    // 1️⃣ Create order
    const newOrder = await Order.create({
      org_id,
      orderNo,
      user_id,
      assignedRoleIds: [userRoleId],
      selectedCompany,
      customerPerson,
      email,
      mobile,
      date,
      billingAddress,
      shippingAddress,
      productOrderDetails,
      status: "Pending",
      finalAmt,
    });

    // 2️⃣ Create payment schedule
    const paymentIds = [];
    for (const payment of orderPaymentDetails) {
      const amount = parseFloat(payment.amount);
      const schedule = await OrderPaymentSchedule.create({
        org_id,
        user_id,
        order_id: newOrder.id,
        dueDate: payment.dueDate,
        paymentPercent: parseFloat(payment.percentage),
        totalAmount: amount,
        dueAmount: amount,
        receivedAmount: 0,
        narration: payment.narration || "",
        status: "Pending",
      });
      paymentIds.push(schedule.id);
    }

    await newOrder.update({ orderPaymentDetails: paymentIds.join(",") });

    // 3️⃣ Employee
    const employee = await Employee.findOne({
      where: { org_id, user_id },
      include: [{ model: Roles, as: "role" }],
    });
    if (!employee)
      return res.status(201).json({
        message: "Order placed successfully (no employee profile found).",
        orderId: newOrder.id,
      });

    const employee_id = employee.id;
    const orderMonthName = monthNameFromDDMMYYYY(date);
    if (!orderMonthName)
      return res.status(201).json({
        message: "Order placed successfully (invalid date).",
        orderId: newOrder.id,
      });

    // 4️⃣ Fetch assigned incentives for employee
    const assignedList = await AssignedIncentives.findAll({
      where: { org_id, employee_id },
      include: [
        { model: IncentiveFormulaMaster, as: "formula" },
        { model: IncentiveFormulaMaster, as: "partitionFormula" },
      ],
    });

    const assignedForMonth = (assignedList || []).filter((a) =>
      sameMonthName(a.month, orderMonthName)
    );
    if (!assignedForMonth.length)
      return res.status(201).json({
        message:
          "Order placed successfully (no assigned incentives for month).",
        orderId: newOrder.id,
      });

    // 5️⃣ Parse products
    let parsedProducts = [];
    try {
      const parsed =
        typeof productOrderDetails === "string"
          ? JSON.parse(productOrderDetails)
          : productOrderDetails;
      parsedProducts = [
        ...(parsed?.intrastate || []),
        ...(parsed?.interstate || []),
      ];
    } catch (e) {
      console.warn("Parse fail", e);
    }

    // 6️⃣ Get cumulative sales
    const allOrders = await Order.findAll({ where: { org_id, user_id } });
    const myOrdersThisMonth = allOrders.filter((o) =>
      sameMonthName(monthNameFromDDMMYYYY(o.date), orderMonthName)
    );
    let allProductsThisMonth = [];
    for (const order of myOrdersThisMonth) {
      try {
        const parsed =
          typeof order.productOrderDetails === "string"
            ? JSON.parse(order.productOrderDetails)
            : order.productOrderDetails;
        allProductsThisMonth.push(...(parsed?.intrastate || []));
        allProductsThisMonth.push(...(parsed?.interstate || []));
      } catch (err) {
        console.warn("Parse fail monthly", err);
      }
    }

    // 7️⃣ Process each incentive
    for (const assigned of assignedForMonth) {
      const assignedProduct = (assigned.selectedProductName || "").trim();
      const totalAchieved = allProductsThisMonth
        .filter((p) => (p.product || "").trim() === assignedProduct)
        .reduce((sum, p) => sum + toNumber(p.subTotal, 0), 0);
      if (totalAchieved <= 0) continue;

      const formulaType = assigned.formula?.formula_type || "";
      const formulaCfg = assigned.formula?.formula_config || {};
      const { amount: totalIncentive, rate: mainRate } = calculateIncentive(
        formulaType,
        formulaCfg,
        totalAchieved,
        assigned.eligible_amount,
        assigned.targeted_amount
      );

      // ✅ Partition distribution from total incentive
      const partitionFormula = assigned.partitionFormula;
      const employeeRoleName = employee.role.role_name;

      if (formulaType.toLowerCase() === "bonus") {
        // For bonus, no partition, show bonus amount as display_rate
        const displayRate = `${totalIncentive}`;
        await upsertEmployeeIncentive(
          employee_id,
          assigned.id,
          totalAchieved,
          totalIncentive,
          displayRate
        );
        continue;
      }

      if (partitionFormula && partitionFormula.formula_config) {
        const partitionConfig =
          typeof partitionFormula.formula_config === "string"
            ? JSON.parse(partitionFormula.formula_config)
            : partitionFormula.formula_config;

        const shares = partitionConfig[employeeRoleName] || {};
        const distribution = Object.entries(shares);

        for (const [roleName, percentStr] of distribution) {
          const percent = parseFloat(percentStr || 0);
          let shareIncentive = totalIncentive * (percent / 100);
          const displayRate = `${mainRate * 100}% of ${percent}%`;

          if (roleName.startsWith("assigned_")) {
            // assigned role = current employee
            await upsertEmployeeIncentive(
              employee_id,
              assigned.id,
              totalAchieved,
              shareIncentive,
              displayRate
            );
          } else {
            // parent role distribution
            const targetRoleId = await getRoleIdByName(org_id, roleName);
            if (!targetRoleId) continue;
            const targetEmployees = await Employee.findAll({
              where: { org_id, role_id: targetRoleId },
            });
            for (const targetEmployee of targetEmployees) {
              await upsertEmployeeIncentive(
                targetEmployee.id,
                assigned.id,
                totalAchieved,
                shareIncentive,
                displayRate
              );
            }
          }
        }
      } else {
        // No partition, give all to employee
        const displayRate = mainRate > 0 ? `${mainRate}%` : null;
        await upsertEmployeeIncentive(
          employee_id,
          assigned.id,
          totalAchieved,
          totalIncentive,
          displayRate
        );
      }
    }

    return res
      .status(201)
      .json({ message: "Order placed successfully.", orderId: newOrder.id });
  } catch (error) {
    console.error("Create Order Error:", error);
    return sendErrorResponse(res, 500, "Error creating order.");
  }
};

/* ----------------------- JSON PARSER ----------------------- */
const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    if (typeof value === "object") {
      return value;
    }
    return fallback;
  } catch (err) {
    return fallback;
  }
};

/* ----------------------- Get All Orders ----------------------- */
exports.getAllOrders = async (req, res) => {
  const { org_id, id: userId, role_id: userRoleId } = req.user;

  try {
    const allOrders = await Order.findAll({ where: { org_id } });
    const visibleOrders = [];

    for (const order of allOrders) {
      let isVisible = order.user_id === userId;

      if (!isVisible) {
        const orderAssignedRoles = parseJSON(order.assignedRoleIds, []);
        for (const roleId of orderAssignedRoles) {
          const parentRoles = await getParentRoles(roleId, org_id);
          if (parentRoles.includes(userRoleId)) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) visibleOrders.push(order);
    }

    const transformedOrders = [];
    for (const order of visibleOrders) {
      // Fetch payment schedules by IDs
      const paymentIds = (order.orderPaymentDetails || "")
        .split(",")
        .map((x) => parseInt(x));
      const payments = await OrderPaymentSchedule.findAll({
        where: { id: paymentIds },
      });

      transformedOrders.push({
        id: order.id,
        orderNo: order.orderNo,
        org_id: order.org_id,
        user_id: order.user_id,
        selectedCompany: order.selectedCompany,
        customerPerson: order.customerPerson,
        email: order.email,
        mobile: order.mobile,
        date: order.date,
        billingAddress: parseJSON(order.billingAddress, {}),
        shippingAddress: parseJSON(order.shippingAddress, {}),
        productOrderDetails: parseJSON(order.productOrderDetails, {}),
        orderPaymentDetails: payments || [],
        status: order.status,
        finalAmt: order.finalAmt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }

    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch orders");
  }
};

/* ----------------------- Update existing updateOrderStatus ----------------------- */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status)
      return sendErrorResponse(res, 400, "Order ID and status are required.");
    const order = await Order.findByPk(id);
    if (!order) return sendErrorResponse(res, 404, "Order not found.");

    const previousStatus = order.status;
    await order.update({ status });

    // Trigger recalculation if status changed to/from Canceled
    if (status === "Canceled" || previousStatus === "Canceled") {
      const orderMonthName = monthNameFromDDMMYYYY(order.date);
      if (orderMonthName) {
        await recalculateIncentivesForMonth(
          order.org_id,
          order.user_id,
          orderMonthName
        );
      }
    }

    return res
      .status(200)
      .json({ message: "Order status updated successfully.", id, status });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return sendErrorResponse(res, 500, "Failed to update order status.");
  }
};

/* ----------------------- Update Order ----------------------- */
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const userRoleId = req.user.role_id;

  const {
    selectedCompany,
    customerPerson,
    email,
    mobile,
    date,
    billingAddress,
    shippingAddress,
    productOrderDetails,
    orderPaymentDetails,
    finalAmt,
  } = req.body;

  try {
    // 1️⃣ Find existing order
    const order = await Order.findOne({ where: { id, org_id } });
    if (!order) return sendErrorResponse(res, 404, "Order not found.");

    // 2️⃣ Delete old payment schedules linked to this order
    const existingPaymentIds = (order.orderPaymentDetails || "")
      .split(",")
      .map((x) => parseInt(x))
      .filter((x) => !isNaN(x));

    if (existingPaymentIds.length > 0) {
      await OrderPaymentSchedule.destroy({ where: { id: existingPaymentIds } });
    }

    // 3️⃣ Update order details
    await order.update({
      org_id,
      user_id,
      assignedRoleIds: [userRoleId],
      selectedCompany,
      customerPerson,
      email,
      mobile,
      date,
      billingAddress,
      shippingAddress,
      productOrderDetails,
      status: "Pending",
      finalAmt,
    });

    // 4️⃣ Create new payment schedule
    const paymentIds = [];
    for (const payment of orderPaymentDetails) {
      const amount = parseFloat(payment.amount);
      const schedule = await OrderPaymentSchedule.create({
        org_id,
        user_id,
        order_id: order.id,
        dueDate: payment.dueDate,
        paymentPercent: parseFloat(payment.percentage),
        totalAmount: amount,
        dueAmount: amount,
        receivedAmount: 0,
        narration: payment.narration || "",
        status: "Pending",
      });
      paymentIds.push(schedule.id);
    }

    await order.update({ orderPaymentDetails: paymentIds.join(",") });

    // 5️⃣ Employee details
    const employee = await Employee.findOne({
      where: { org_id, user_id },
      include: [{ model: Roles, as: "role" }],
    });
    if (!employee)
      return res.status(200).json({
        message: "Order updated successfully (no employee profile found).",
        orderId: order.id,
      });

    const employee_id = employee.id;
    const orderMonthName = monthNameFromDDMMYYYY(date);
    if (!orderMonthName)
      return res.status(200).json({
        message: "Order updated successfully (invalid date).",
        orderId: order.id,
      });

    // 6️⃣ Fetch assigned incentives
    const assignedList = await AssignedIncentives.findAll({
      where: { org_id, employee_id },
      include: [
        { model: IncentiveFormulaMaster, as: "formula" },
        { model: IncentiveFormulaMaster, as: "partitionFormula" },
      ],
    });

    const assignedForMonth = (assignedList || []).filter((a) =>
      sameMonthName(a.month, orderMonthName)
    );
    if (!assignedForMonth.length)
      return res.status(200).json({
        message:
          "Order updated successfully (no assigned incentives for this month).",
        orderId: order.id,
      });

    // 7️⃣ Parse products
    let parsedProducts = [];
    try {
      const parsed =
        typeof productOrderDetails === "string"
          ? JSON.parse(productOrderDetails)
          : productOrderDetails;
      parsedProducts = [
        ...(parsed?.intrastate || []),
        ...(parsed?.interstate || []),
      ];
    } catch (e) {
      console.warn("Parse fail", e);
    }

    // 8️⃣ Get cumulative sales for this month
    const allOrders = await Order.findAll({ where: { org_id, user_id } });
    const myOrdersThisMonth = allOrders.filter((o) =>
      sameMonthName(monthNameFromDDMMYYYY(o.date), orderMonthName)
    );
    let allProductsThisMonth = [];
    for (const ord of myOrdersThisMonth) {
      try {
        const parsed =
          typeof ord.productOrderDetails === "string"
            ? JSON.parse(ord.productOrderDetails)
            : ord.productOrderDetails;
        allProductsThisMonth.push(...(parsed?.intrastate || []));
        allProductsThisMonth.push(...(parsed?.interstate || []));
      } catch (err) {
        console.warn("Parse fail monthly", err);
      }
    }

    // 9️⃣ Recalculate incentives
    for (const assigned of assignedForMonth) {
      const assignedProduct = (assigned.selectedProductName || "").trim();
      const totalAchieved = allProductsThisMonth
        .filter((p) => (p.product || "").trim() === assignedProduct)
        .reduce((sum, p) => sum + toNumber(p.subTotal, 0), 0);
      if (totalAchieved <= 0) continue;

      const formulaType = assigned.formula?.formula_type || "";
      const formulaCfg = assigned.formula?.formula_config || {};
      const { amount: totalIncentive, rate: mainRate } = calculateIncentive(
        formulaType,
        formulaCfg,
        totalAchieved,
        assigned.eligible_amount,
        assigned.targeted_amount
      );

      const partitionFormula = assigned.partitionFormula;
      const employeeRoleName = employee.role.role_name;

      if (formulaType.toLowerCase() === "bonus") {
        const displayRate = `${totalIncentive}`;
        await upsertEmployeeIncentive(
          employee_id,
          assigned.id,
          totalAchieved,
          totalIncentive,
          displayRate
        );
        continue;
      }

      if (partitionFormula && partitionFormula.formula_config) {
        const partitionConfig =
          typeof partitionFormula.formula_config === "string"
            ? JSON.parse(partitionFormula.formula_config)
            : partitionFormula.formula_config;

        const shares = partitionConfig[employeeRoleName] || {};
        const distribution = Object.entries(shares);

        for (const [roleName, percentStr] of distribution) {
          const percent = parseFloat(percentStr || 0);
          let shareIncentive = totalIncentive * (percent / 100);
          const displayRate = `${mainRate * 100}% of ${percent}%`;

          if (roleName.startsWith("assigned_")) {
            await upsertEmployeeIncentive(
              employee_id,
              assigned.id,
              totalAchieved,
              shareIncentive,
              displayRate
            );
          } else {
            const targetRoleId = await getRoleIdByName(org_id, roleName);
            if (!targetRoleId) continue;
            const targetEmployees = await Employee.findAll({
              where: { org_id, role_id: targetRoleId },
            });
            for (const targetEmployee of targetEmployees) {
              await upsertEmployeeIncentive(
                targetEmployee.id,
                assigned.id,
                totalAchieved,
                shareIncentive,
                displayRate
              );
            }
          }
        }
      } else {
        const displayRate = mainRate > 0 ? `${mainRate}%` : null;
        await upsertEmployeeIncentive(
          employee_id,
          assigned.id,
          totalAchieved,
          totalIncentive,
          displayRate
        );
      }
    }

    return res.status(200).json({
      message: "Order updated successfully.",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Update Order Error:", error);
    return sendErrorResponse(res, 500, "Error updating order.");
  }
};

/* ----------------------- Delete Order ----------------------- */
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const order = await Order.findOne({ where: { id, org_id } });
    if (!order) return sendErrorResponse(res, 404, "Order not found.");

    await order.destroy();
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return sendErrorResponse(res, 500, "Error deleting order.");
  }
};
