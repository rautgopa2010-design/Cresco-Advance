const db = require("../models");
const EmployeeIncentives = db.employeeIncentives;
const Employee = db.employee;
const AssignedIncentives = db.assignedIncentives;
const IncentiveFormulaMaster = db.incentiveFormulaMaster;
const { sendErrorResponse } = require("../utility/sendErrorResponse");

/* ---------------- Get Employee Incentives ---------------- */
exports.getEmployeeIncentives = async (req, res) => {
  const org_id = req.user.org_id;  // ✅ comes from logged-in user
  const { employee_id, type, period } = req.query;

  try {
    // Base filter
    let where = {};
    if (employee_id) where.employee_id = employee_id;

    // ✅ org_id filter applied inside employee include
    let incentives = await EmployeeIncentives.findAll({
      where,
      include: [
        {
          model: AssignedIncentives,
          as: "assignedIncentive",
          include: [{ model: IncentiveFormulaMaster, as: "formula" }],
        },
        {
          model: Employee,
          as: "employee",
          where: { org_id }, // ✅ this ensures only employees of that org
        },
      ],
    });

    // 🔹 Grouping by type
    const filterByPeriod = (list, type, period) => {
      if (type === "monthly") {
        return list.filter((i) => i.assignedIncentive.month === period);
      }
      if (type === "quarterly") {
        const qMap = {
          Q1: ["January", "February", "March"],
          Q2: ["April", "May", "June"],
          Q3: ["July", "August", "September"],
          Q4: ["October", "November", "December"],
        };
        return list.filter((i) => qMap[period]?.includes(i.assignedIncentive.month));
      }
      if (type === "halfyearly") {
        const hMap = {
          H1: ["January", "February", "March", "April", "May", "June"],
          H2: ["July", "August", "September", "October", "November", "December"],
        };
        return list.filter((i) => hMap[period]?.includes(i.assignedIncentive.month));
      }
      if (type === "yearly") {
        return list; // all months
      }
      return list;
    };

    const filtered = filterByPeriod(incentives, type, period);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("Get Employee Incentives Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch incentives");
  }
};

exports.payIncentive = async (req, res) => {
  const { incentive_id, pay_amount } = req.body;
  const org_id = req.user.org_id;

  try {
    const incentive = await EmployeeIncentives.findOne({
      where: { id: incentive_id },
      include: [
        {
          model: Employee,
          as: "employee",
          where: { org_id },
        },
      ],
    });

    if (!incentive) {
      return sendErrorResponse(res, 404, "Incentive not found");
    }

    const newPaid = (incentive.paid_amount || 0) + parseFloat(pay_amount);
    const total = incentive.calculated_incentive;

    let status = "partially-paid";
    if (newPaid >= total) {
      status = "paid";
    } else if (newPaid > 0) {
      status = "partially-paid";
    }

    await incentive.update({
      paid_amount: newPaid,
      status,
    });

    res.status(200).json({
      message: "Payment recorded successfully",
      incentive: {
        id: incentive.id,
        paid_amount: newPaid,
        status,
        remaining: total - newPaid,
      },
    });
  } catch (err) {
    console.error(err);
    return sendErrorResponse(res, 500, "Failed to process payment");
  }
};