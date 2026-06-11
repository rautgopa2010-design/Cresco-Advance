const db = require("../models");
const Customer = db.customer;
const Lead = db.lead;
const Followup = db.followup;
const Quotation = db.quotation;
const Order = db.order;
const Invoice = db.invoice;
const EmployeeIncentives = db.employeeIncentives;
const AssignedIncentives = db.assignedIncentives;
const Employee = db.employee;
const CreLead = db.lead;
const Roles = db.roles;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { Op } = require("sequelize");
const { getParentRoles } = require("../utility/roleHelper");
const { parseDateString, parseJSON } = require("../utility/commonHelper");

exports.getDashboardData = async (req, res) => {
  try {
    const { org_id, id: userId, role_id: userRoleId } = req.user;
    const date = new Date();

    // console.log(req.user);
    const [
      customerCount,
      leadCount,
      followupDueCount,
      quotationCount,
      orderCount,
      currentMonthRevenue,
      overdueInvoiceCount,
      monthlyChartData,
      employeeIncentives,
      leadSource,
      missedFollowupsCount,
      ticketDashboard,
    ] = await Promise.all([
      getCustomerOnboardedCount(org_id, userId, userRoleId),
      getLeadCount(org_id, userId, userRoleId), // ← Fixed name
      getFollowupDueCount(org_id, userId, userRoleId),
      getQuotationCount(org_id, userId, userRoleId), // ← Fixed name
      getOrderCount(org_id, userId, userRoleId),
      getCurrentMonthRevenue(org_id, userId, userRoleId),
      getOverdueInvoiceCount(org_id, userId, userRoleId),
      getFyMonthlyChartData(org_id, userId, userRoleId),
      getEmployeeIncentives(
        org_id,
        userId,
        "yearly",
        date.getFullYear(),
        userId,
        userRoleId
      ),
      leadSources(org_id, userId, userRoleId),
      getMissedFollowupsCount(org_id, userId, userRoleId), // ← New function call
      exports.getTicketDashboardData(org_id, userId, userRoleId),
    ]);

    res.status(200).json({
      totalCustomers: customerCount,
      totalLeads: leadCount,
      followupDueToday: followupDueCount,
      totalQuotations: quotationCount,
      totalOrders: orderCount,
      currentMonthRevenue: currentMonthRevenue,
      overdueInvoices: overdueInvoiceCount,
      monthlyChartData,
      employeeIncentives,
      leadSource: leadSource,
      missedFollowups: missedFollowupsCount,
      tickets: ticketDashboard,
    });
  } catch (err) {
    console.error("Get Dashboard Data Error:", err);
    return sendErrorResponse(res, 500, "Failed to get dashboard values");
  }
};

const getCustomerOnboardedCount = async (org_id, userId, userRoleId) => {
  const allCustomers = await Customer.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const customer of allCustomers) {
    let isVisible = customer.user_id === userId;

    if (!isVisible) {
      const assignedIds = parseJSON(customer.assignedTo, []);
      if (assignedIds.includes(userId)) isVisible = true;
    }

    if (!isVisible) {
      const assignedRoles = parseJSON(customer.assignedRoleIds, []);
      for (const roleId of assignedRoles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }

    if (isVisible) count++;
  }
  return count;
};

const getLeadCount = async (org_id, userId, userRoleId) => {
  const allLeads = await Lead.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const lead of allLeads) {
    let isVisible = lead.user_id === userId;

    if (!isVisible) {
      const assignedIds = parseJSON(lead.assignedTo, []);
      if (assignedIds.includes(userId)) isVisible = true;
    }

    if (!isVisible) {
      const assignedRoles = parseJSON(lead.assignedRoleIds, []);
      for (const roleId of assignedRoles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }

    if (isVisible) count++;
  }
  return count;
};

// // old
// const getFollowupDueCount = async (org_id, userId, userRoleId) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   // Fetch leads with ALL their followups
//   const allLeads = await Lead.findAll({
//     where: { org_id },
//     attributes: ['id', 'user_id', 'assignedTo', 'assignedRoleIds'],
//     include: [{
//       model: Followup,
//       as: 'followups',
//       attributes: ['id', 'nextFollowUpDate', 'createdAt'],
//       separate: true, // Important: loads followups separately to avoid nesting issues
//       order: [['createdAt', 'DESC']], // Latest first
//     }],
//     raw: false, // Keep as instances so we can access associations easily
//   });

//   const parseDashedDate = (dateStr) => {
//     if (!dateStr) return null;
//     const parts = dateStr.split('-');
//     if (parts.length !== 3) return null;
//     const day = parseInt(parts[0], 10);
//     const month = parseInt(parts[1], 10) - 1;
//     const year = parseInt(parts[2], 10);
//     if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
//     const date = new Date(year, month, day);
//     date.setHours(0, 0, 0, 0);
//     return date;
//   };

//   let count = 0;

//   for (const lead of allLeads) {
//     const followups = lead.followups || [];

//     if (followups.length === 0) continue;

//     // Get the LATEST followup
//     const latestFollowup = followups[0]; // Already ordered DESC by createdAt

//     const followupDateStr = latestFollowup.nextFollowUpDate;
//     if (!followupDateStr) continue;

//     const followupDate = parseDashedDate(followupDateStr);
//     if (!followupDate || followupDate.getTime() !== today.getTime()) continue;

//     // Visibility check
//     let isVisible = lead.user_id === userId;

//     if (!isVisible) {
//       const assignedIds = parseJSON(lead.assignedTo, []);
//       if (assignedIds.some(id => Number(id) === Number(userId))) {
//         isVisible = true;
//       }
//     }

//     if (!isVisible) {
//       const assignedRoles = parseJSON(lead.assignedRoleIds, []);
//       for (const roleId of assignedRoles) {
//         const parents = await getParentRoles(roleId, org_id);
//         if (parents.map(p => Number(p)).includes(Number(userRoleId))) {
//           isVisible = true;
//           break;
//         }
//       }
//     }

//     if (isVisible) count++;
//   }

//   return count;
// };

const getFollowupDueCount = async (org_id, userId, userRoleId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch leads with their followups - but only incomplete ones
  const allLeads = await Lead.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    include: [
      {
        model: Followup,
        as: "followups",
        attributes: ["id", "nextFollowUpDate", "createdAt", "isCompleted"], // Added isCompleted
        separate: true,
        order: [["createdAt", "DESC"]],
      },
    ],
    raw: false,
  });

  const parseDashedDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  let count = 0;

  for (const lead of allLeads) {
    const followups = lead.followups || [];

    if (followups.length === 0) continue;

    // Get the LATEST followup
    const latestFollowup = followups[0];

    // Check if the followup is completed - if yes, skip it
    if (latestFollowup.isCompleted === true) continue;

    const followupDateStr = latestFollowup.nextFollowUpDate;
    if (!followupDateStr) continue;

    const followupDate = parseDashedDate(followupDateStr);
    if (!followupDate || followupDate.getTime() !== today.getTime()) continue;

    // Visibility check
    let isVisible = lead.user_id === userId;

    if (!isVisible) {
      const assignedIds = parseJSON(lead.assignedTo, []);
      if (assignedIds.some((id) => Number(id) === Number(userId))) {
        isVisible = true;
      }
    }

    if (!isVisible) {
      const assignedRoles = parseJSON(lead.assignedRoleIds, []);
      for (const roleId of assignedRoles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.map((p) => Number(p)).includes(Number(userRoleId))) {
          isVisible = true;
          break;
        }
      }
    }

    if (isVisible) count++;
  }

  return count;
};

const getQuotationCount = async (org_id, userId, userRoleId) => {
  const allQuotations = await Quotation.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const quotation of allQuotations) {
    let isVisible = quotation.user_id === userId;

    if (!isVisible) {
      const assignedIds = parseJSON(quotation.assignedTo, []);
      if (assignedIds.includes(userId)) isVisible = true;
    }

    if (!isVisible) {
      const roles = parseJSON(quotation.assignedRoleIds, []);
      for (const roleId of roles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }
    if (isVisible) count++;
  }
  return count;
};

const getOrderCount = async (org_id, userId, userRoleId) => {
  const allOrders = await Order.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const order of allOrders) {
    let isVisible = order.user_id === userId;
    if (!isVisible) {
      const roles = parseJSON(order.assignedRoleIds, []);
      for (const roleId of roles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }
    if (isVisible) count++;
  }
  return count;
};

const getCurrentMonthRevenue = async (org_id, userId, userRoleId) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12 format

  // Helper function to parse DD-MM-YYYY format
  const parseDashedDate = (dateStr) => {
    if (!dateStr) return null;

    try {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

      return { day, month, year };
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return null;
    }
  };

  const allOrders = await Order.findAll({
    where: {
      org_id,
      status: "Completed",
    },
    attributes: ["id", "user_id", "assignedRoleIds", "finalAmt", "date"],
    raw: true,
  });

  let revenue = 0;
  for (const order of allOrders) {
    // Parse the date string (DD-MM-YYYY)
    const parsedDate = parseDashedDate(order.date);

    // Skip if date couldn't be parsed or not in current month
    if (!parsedDate) continue;

    // Check if date is in current month and year
    if (parsedDate.month !== currentMonth || parsedDate.year !== currentYear) {
      continue;
    }

    // Check visibility
    let isVisible = order.user_id === userId;
    if (!isVisible) {
      const roles = parseJSON(order.assignedRoleIds, []);
      for (const roleId of roles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }

    if (isVisible) {
      revenue += parseFloat(order.finalAmt) || 0;
    }
  }

  return Math.round(revenue * 100) / 100;
};

const getOverdueInvoiceCount = async (org_id, userId, userRoleId) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const allInvoices = await Invoice.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedRoleIds", "date"],
    raw: true,
  });

  let count = 0;
  for (const invoice of allInvoices) {
    const invDate = parseDateString(invoice.date);
    if (!invDate || invDate >= todayStr) continue;

    let isVisible = invoice.user_id === userId;
    if (!isVisible) {
      const roles = parseJSON(invoice.assignedRoleIds, []);
      for (const roleId of roles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }
    if (isVisible) count++;
  }
  return count;
};

// // old
// const getMissedFollowupsCount = async (org_id, userId, userRoleId) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const allLeads = await Lead.findAll({
//     where: { org_id },
//     attributes: ['id', 'user_id', 'assignedTo', 'assignedRoleIds'],
//     include: [{
//       model: Followup,
//       as: 'followups',
//       attributes: ['id', 'nextFollowUpDate', 'createdAt'],
//       separate: true,
//       order: [['createdAt', 'DESC']],
//     }],
//     raw: false,
//   });

//   const parseDashedDate = (dateStr) => {
//     if (!dateStr) return null;
//     const parts = dateStr.split('-');
//     if (parts.length !== 3) return null;
//     const day = parseInt(parts[0], 10);
//     const month = parseInt(parts[1], 10) - 1;
//     const year = parseInt(parts[2], 10);
//     if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
//     const date = new Date(year, month, day);
//     date.setHours(0, 0, 0, 0);
//     return date;
//   };

//   let count = 0;

//   for (const lead of allLeads) {
//     const followups = lead.followups || [];
//     if (followups.length === 0) continue;

//     const latestFollowup = followups[0];
//     const followupDateStr = latestFollowup.nextFollowUpDate;
//     if (!followupDateStr) continue;

//     const followupDate = parseDashedDate(followupDateStr);
//     if (!followupDate || followupDate.getTime() >= today.getTime()) continue; // Not missed

//     // Visibility check (same as above)
//     let isVisible = lead.user_id === userId;

//     if (!isVisible) {
//       const assignedIds = parseJSON(lead.assignedTo, []);
//       if (assignedIds.some(id => Number(id) === Number(userId))) {
//         isVisible = true;
//       }
//     }

//     if (!isVisible) {
//       const assignedRoles = parseJSON(lead.assignedRoleIds, []);
//       for (const roleId of assignedRoles) {
//         const parents = await getParentRoles(roleId, org_id);
//         if (parents.map(p => Number(p)).includes(Number(userRoleId))) {
//           isVisible = true;
//           break;
//         }
//       }
//     }

//     if (isVisible) count++;
//   }

//   return count;
// };

const getMissedFollowupsCount = async (org_id, userId, userRoleId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allLeads = await Lead.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    include: [
      {
        model: Followup,
        as: "followups",
        attributes: ["id", "nextFollowUpDate", "createdAt", "isCompleted"], // Added isCompleted
        separate: true,
        order: [["createdAt", "DESC"]],
      },
    ],
    raw: false,
  });

  const parseDashedDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  let count = 0;

  for (const lead of allLeads) {
    const followups = lead.followups || [];
    if (followups.length === 0) continue;

    const latestFollowup = followups[0];

    // Check if the followup is completed - if yes, skip it
    if (latestFollowup.isCompleted === true) continue;

    const followupDateStr = latestFollowup.nextFollowUpDate;
    if (!followupDateStr) continue;

    const followupDate = parseDashedDate(followupDateStr);
    if (!followupDate || followupDate.getTime() >= today.getTime()) continue; // Not missed

    // Visibility check (same as above)
    let isVisible = lead.user_id === userId;

    if (!isVisible) {
      const assignedIds = parseJSON(lead.assignedTo, []);
      if (assignedIds.some((id) => Number(id) === Number(userId))) {
        isVisible = true;
      }
    }

    if (!isVisible) {
      const assignedRoles = parseJSON(lead.assignedRoleIds, []);
      for (const roleId of assignedRoles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.map((p) => Number(p)).includes(Number(userRoleId))) {
          isVisible = true;
          break;
        }
      }
    }

    if (isVisible) count++;
  }

  return count;
};

const getFyMonthlyChartData = async (org_id, userId, userRoleId) => {
  try {
    const today = new Date(); // Current date: December 25, 2025
    let fyYear = today.getFullYear();
    if (today.getMonth() + 1 < 4) fyYear -= 1; // Jan-Mar → previous FY (FY 2025-26 in this case)

    // Desired output order: Jan to Dec
    const calendarMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize data array in calendar order (Jan=0 ... Dec=11)
    const monthlyData = calendarMonths.map((month) => ({
      month,
      revenue: 0,
      orders: 0,
      quotations: 0,
    }));

    // Fiscal year boundaries: Apr 1 of fyYear → Mar 31 of fyYear+1
    const fyStart = new Date(fyYear, 3, 1); // April 1
    const fyEnd = new Date(fyYear + 1, 3, 0, 23, 59, 59); // March 31

    // Fetch data (same as old code)
    const orders = await Order.findAll({
      where: {
        org_id,
        createdAt: { [Op.between]: [fyStart, fyEnd] },
        status: "Completed",
      },
      attributes: ["date", "finalAmt", "user_id", "assignedRoleIds"],
      raw: true,
    });

    const quotations = await Quotation.findAll({
      where: {
        org_id,
        createdAt: { [Op.between]: [fyStart, fyEnd] },
      },
      attributes: ["createdAt", "user_id", "assignedTo", "assignedRoleIds"],
      raw: true,
    });

    // Helper: Get calendar month index for final array (Jan=0, Feb=1, ..., Dec=11)
    const getCalendarIndex = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) return null;
      return date.getMonth(); // 0=Jan, 1=Feb, ..., 11=Dec
    };

    const parseOrderDate = (dateStr) => {
      if (!dateStr || typeof dateStr !== "string") return null;
      const parts = dateStr.split(/[-\/]/);
      if (parts.length !== 3) return null;
      const [d, m, y] = parts.map(Number);
      if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
      const date = new Date(y, m - 1, d);
      return isNaN(date.getTime()) ? null : date;
    };

    // Visibility checks (exactly as in your old code)
    const isOrderVisible = async (order) => {
      if (order.user_id === userId) return true;
      const roles = parseJSON(order.assignedRoleIds, []);
      for (const roleId of roles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) return true;
      }
      return false;
    };

    const isQuotationVisible = async (quotation) => {
      if (quotation.user_id === userId) return true;
      const assignedIds = parseJSON(quotation.assignedTo, []);
      if (assignedIds.includes(userId)) return true;
      const roles = parseJSON(quotation.assignedRoleIds, []);
      for (const roleId of roles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) return true;
      }
      return false;
    };

    // Process Orders
    for (const order of orders) {
      if (!(await isOrderVisible(order))) continue;

      const orderDate = parseOrderDate(order.date);
      const idx = getCalendarIndex(orderDate);
      if (idx === null) continue;

      const revenue = parseFloat(order.finalAmt) || 0;
      monthlyData[idx].revenue += revenue;
      monthlyData[idx].orders += 1;
    }

    // Process Quotations
    for (const quotation of quotations) {
      if (!(await isQuotationVisible(quotation))) continue;

      const quotationDate = new Date(quotation.createdAt);
      const idx = getCalendarIndex(quotationDate);
      if (idx !== null) {
        monthlyData[idx].quotations += 1;
      }
    }

    // Round revenue
    monthlyData.forEach((m) => {
      m.revenue = Math.round(m.revenue);
    });

    return monthlyData;
  } catch (error) {
    console.error("Get FY Monthly Chart Data Error:", error);
    const calendarMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return calendarMonths.map((month) => ({
      month,
      revenue: 0,
      orders: 0,
      quotations: 0,
    }));
  }
};

const getEmployeeIncentives = async (
  org_id,
  employee_id,
  type,
  period,
  userId,
  userRoleId
) => {
  try {
    // Step 1: Check if the current user is a Super Admin
    const userRole = await Roles.findOne({
      where: { id: userRoleId, org_id },
      attributes: ["role_name"],
      raw: true,
    });

    const isSuperAdmin = userRole && userRole.role_name === "Super Admin";

    let visibleEmployeeIds = new Set();

    if (isSuperAdmin) {
      // Super Admin sees ALL employees in the organization
      const allEmployees = await Employee.findAll({
        where: { org_id, isDeleted: false },
        attributes: ["id"],
        raw: true,
      });
      allEmployees.forEach((emp) => visibleEmployeeIds.add(emp.id));
    } else {
      // Existing logic: filter employees based on visibility (self, reporting, role hierarchy, etc.)
      let employeeWhere = { org_id, isDeleted: false };
      if (employee_id) {
        employeeWhere.id = employee_id;
      }

      const allEmployees = await Employee.findAll({
        where: employeeWhere,
        attributes: [
          "id",
          "user_id",
          "role_id",
          "reportTo",
          "firstName",
          "lastName",
        ],
        raw: true,
      });

      if (allEmployees.length === 0) {
        return getEmptyMonthArray();
      }

      const userParentRoles = await getParentRoles(userRoleId, org_id);
      const userAllRoles = [
        Number(userRoleId),
        ...userParentRoles.map((p) => Number(p)),
      ];

      for (const emp of allEmployees) {
        let isVisible = false;

        if (emp.user_id === userId) {
          isVisible = true;
        }

        if (!isVisible && emp.reportTo) {
          try {
            const reportToIds = JSON.parse(emp.reportTo);
            if (
              Array.isArray(reportToIds) &&
              reportToIds.includes(Number(userId))
            ) {
              isVisible = true;
            }
          } catch (error) {
            if (emp.reportTo.includes(userId.toString())) {
              isVisible = true;
            }
          }
        }

        if (!isVisible && emp.role_id) {
          const canView = await canUserViewEmployeeRole(
            userId,
            userRoleId,
            emp.role_id,
            org_id
          );
          if (canView) {
            isVisible = true;
          }
        }

        // Optional: Add admin-like roles if needed
        // if (!isVisible && (userAllRoles.includes(1) || userAllRoles.includes(2))) {
        //   isVisible = true;
        // }

        if (isVisible) {
          visibleEmployeeIds.add(emp.id);
        }
      }

      if (visibleEmployeeIds.size === 0) {
        return getEmptyMonthArray();
      }
    }

    // Now fetch incentives for visible employees
    let incentives = await EmployeeIncentives.findAll({
      where: {
        employee_id: Array.from(visibleEmployeeIds),
      },
      attributes: ["employee_id", "calculated_incentive"],
      include: [
        {
          model: AssignedIncentives,
          as: "assignedIncentive",
          attributes: ["month"],
          required: true,
        },
      ],
      raw: true,
    });

    // Apply type/period filtering (monthly, quarterly, yearly, etc.)
    let filteredIncentives = incentives;
    if (type && period) {
      const getMonthsInPeriod = () => {
        if (type === "monthly") {
          const monthMap = {
            Jan: "January",
            Feb: "February",
            Mar: "March",
            Apr: "April",
            May: "May",
            Jun: "June",
            Jul: "July",
            Aug: "August",
            Sep: "September",
            Oct: "October",
            Nov: "November",
            Dec: "December",
          };
          return [monthMap[period] || period];
        }
        if (type === "quarterly") {
          const qMap = {
            Q1: ["January", "February", "March"],
            Q2: ["April", "May", "June"],
            Q3: ["July", "August", "September"],
            Q4: ["October", "November", "December"],
          };
          return qMap[period] || [];
        }
        if (type === "halfyearly") {
          const hMap = {
            H1: ["January", "February", "March", "April", "May", "June"],
            H2: [
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
          };
          return hMap[period] || [];
        }
        if (type === "yearly") {
          return [
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
        }
        return null;
      };

      const allowedMonths = getMonthsInPeriod();
      if (allowedMonths) {
        filteredIncentives = incentives.filter((i) =>
          allowedMonths.includes(i["assignedIncentive.month"])
        );
      }
    }

    // Aggregate by month (this works for both single user and Super Admin total)
    const monthSums = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    filteredIncentives.forEach((record) => {
      const month = record["assignedIncentive.month"];
      const amount = parseFloat(record.calculated_incentive) || 0;
      if (month && monthSums.hasOwnProperty(month)) {
        monthSums[month] += amount;
      }
    });

    const orderedMonths = [
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
    const shortMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = orderedMonths.map((fullMonth, index) => ({
      incentive: monthSums[fullMonth],
      month: shortMonths[index],
    }));

    return result;
  } catch (err) {
    console.error("Error in getEmployeeIncentives:", err);
    return getEmptyMonthArray();
  }
};

// Helper function to check if user can view employees of a specific role
const canUserViewEmployeeRole = async (
  userId,
  userRoleId,
  employeeRoleId,
  org_id
) => {
  try {
    // Get user's role hierarchy
    const userParentRoles = await getParentRoles(userRoleId, org_id);
    const userAllRoles = [
      Number(userRoleId),
      ...userParentRoles.map((p) => Number(p)),
    ];

    // Simple logic: User can view if their role is higher in hierarchy
    // You might need more complex logic based on your role permissions
    const employeeParentRoles = await getParentRoles(employeeRoleId, org_id);

    // Check if user's role is in the employee's role parent hierarchy
    return employeeParentRoles.includes(Number(userRoleId));
  } catch (error) {
    console.error("Error checking role visibility:", error);
    return false;
  }
};

// Helper function to return empty month array
const getEmptyMonthArray = () => {
  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return shortMonths.map((month) => ({
    incentive: 0,
    month: month,
  }));
};

const leadSources = async (org_id, userId, userRoleId) => {
  try {
    const allLeads = await CreLead.findAll({
      where: {
        org_id,
        leadSource: {
          [Op.ne]: null,
        },
      },
      attributes: [
        "id",
        "leadSource",
        "user_id",
        "assignedTo",
        "assignedRoleIds",
      ],
      raw: true,
    });

    function safeParseJSON(value, defaultValue = []) {
      if (value === null || value === undefined) {
        return defaultValue;
      }

      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : defaultValue;
        } catch {
          return defaultValue;
        }
      }

      return defaultValue;
    }

    const visibleLeads = [];

    for (const lead of allLeads) {
      let isVisible = false;

      // 1️⃣ Creator
      if (lead.user_id === userId) {
        isVisible = true;
      }

      // 2️⃣ Direct assignment
      if (!isVisible) {
        const assignedUsers = safeParseJSON(lead.assignedTo, []);
        if (assignedUsers && assignedUsers.includes(Number(userId))) {
          isVisible = true;
        }
      }

      // 3️⃣ Role hierarchy (CRITICAL FIX)
      if (!isVisible) {
        const roleIds = safeParseJSON(lead.assignedRoleIds, []);
        for (const roleId of roleIds) {
          const parents = await getParentRoles(roleId, org_id);
          if (parents.map(Number).includes(Number(userRoleId))) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) {
        visibleLeads.push(lead);
      }
    }

    // 🔢 Aggregate by lead source
    const sourceCounts = {};
    visibleLeads.forEach((lead) => {
      sourceCounts[lead.leadSource] = (sourceCounts[lead.leadSource] || 0) + 1;
    });

    const total = visibleLeads.length;

    const result = Object.entries(sourceCounts).map(
      ([leadSource, count_leads]) => ({
        leadSource,
        count_leads,
        percent: total ? Math.round((count_leads / total) * 10000) / 100 : 0,
      })
    );

    result.sort((a, b) => b.count_leads - a.count_leads);
    return result;
  } catch (err) {
    console.error("Error in leadSources:", err);
    return [];
  }
};

const getTotalTicketsCount = async (org_id, userId, userRoleId) => {
  const allTickets = await db.ticket.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const ticket of allTickets) {
    let isVisible = ticket.user_id === userId;

    if (!isVisible) {
      const assignedIds = parseJSON(ticket.assignedTo, []);
      if (assignedIds.includes(userId)) isVisible = true;
    }

    if (!isVisible) {
      const assignedRoles = parseJSON(ticket.assignedRoleIds, []);
      for (const roleId of assignedRoles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }

    if (isVisible) count++;
  }
  return count;
};

const getOpenTicketsCount = async (org_id, userId, userRoleId) => {
  const allTickets = await db.ticket.findAll({
    where: { org_id },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds", "status"],
    raw: true,
  });

  let count = 0;
  const openStatuses = ["Pending", "In Progress", "Escalated"];

  for (const ticket of allTickets) {
    if (!openStatuses.includes(ticket.status)) continue;

    let isVisible = ticket.user_id === userId;
    if (!isVisible) {
      const assignedIds = parseJSON(ticket.assignedTo, []);
      if (assignedIds.includes(userId)) isVisible = true;
    }
    if (!isVisible) {
      const assignedRoles = parseJSON(ticket.assignedRoleIds, []);
      for (const roleId of assignedRoles) {
        const parents = await getParentRoles(roleId, org_id);
        if (parents.includes(userRoleId)) {
          isVisible = true;
          break;
        }
      }
    }
    if (isVisible) count++;
  }
  return count;
};

const getDueTodayTicketsCount = async (org_id, userId, userRoleId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0]; // yyyy-mm-dd

  // But most dates are stored as DD-MM-YYYY
  const todayDDMMYYYY = [
    String(today.getDate()).padStart(2, "0"),
    String(today.getMonth() + 1).padStart(2, "0"),
    today.getFullYear(),
  ].join("-");

  const tickets = await db.ticket.findAll({
    where: {
      org_id,
      dueDate: todayDDMMYYYY,
      status: { [Op.notIn]: ["Completed", "Canceled"] },
    },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const t of tickets) {
    let visible = t.user_id === userId;
    if (!visible && parseJSON(t.assignedTo, []).includes(userId))
      visible = true;
    if (!visible) {
      const roles = parseJSON(t.assignedRoleIds, []);
      for (const r of roles) {
        if ((await getParentRoles(r, org_id)).includes(userRoleId)) {
          visible = true;
          break;
        }
      }
    }
    if (visible) count++;
  }
  return count;
};

const getOverdueTicketsCount = async (org_id, userId, userRoleId) => {
  const today = new Date();
  const todayStr = [
    String(today.getDate()).padStart(2, "0"),
    String(today.getMonth() + 1).padStart(2, "0"),
    today.getFullYear(),
  ].join("-");

  const allTickets = await db.ticket.findAll({
    where: {
      org_id,
      status: ["Pending", "In Progress", "Escalated"],
    },
    attributes: ["id", "dueDate", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;

  for (const ticket of allTickets) {
    if (!ticket.dueDate) continue;
    const [dd, mm, yyyy] = ticket.dueDate.split("-").map(Number);
    if (!dd || !mm || !yyyy) continue;

    const due = new Date(yyyy, mm - 1, dd);
    if (due >= today) continue; // not overdue

    let visible = ticket.user_id === userId;
    if (!visible && parseJSON(ticket.assignedTo, []).includes(userId))
      visible = true;
    if (!visible) {
      for (const r of parseJSON(ticket.assignedRoleIds, [])) {
        if ((await getParentRoles(r, org_id)).includes(userRoleId)) {
          visible = true;
          break;
        }
      }
    }
    if (visible) count++;
  }
  return count;
};

const getHighPriorityTicketsCount = async (org_id, userId, userRoleId) => {
  const tickets = await db.ticket.findAll({
    where: {
      org_id,
      priority: { [Op.in]: ["High", "Urgent"] },
    },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const t of tickets) {
    let v = t.user_id === userId;
    if (!v && parseJSON(t.assignedTo, []).includes(userId)) v = true;
    if (!v) {
      for (const r of parseJSON(t.assignedRoleIds, [])) {
        if ((await getParentRoles(r, org_id)).includes(userRoleId)) {
          v = true;
          break;
        }
      }
    }
    if (v) count++;
  }
  return count;
};

const getEscalatedTicketsCount = async (org_id, userId, userRoleId) => {
  const tickets = await db.ticket.findAll({
    where: {
      org_id,
      [Op.or]: [{ isEscalated: true }, { escalatedToProvider: true }],
    },
    attributes: ["id", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  let count = 0;
  for (const t of tickets) {
    let visible = t.user_id === userId;
    if (!visible && parseJSON(t.assignedTo, []).some((id) => id == userId))
      visible = true;
    if (!visible) {
      const roles = parseJSON(t.assignedRoleIds, []);
      for (const r of roles) {
        if ((await getParentRoles(r, org_id)).includes(userRoleId)) {
          visible = true;
          break;
        }
      }
    }
    if (visible) count++;
  }
  return count;
};

const getTicketsByStatus = async (org_id, userId, userRoleId) => {
  const allTickets = await db.ticket.findAll({
    where: { org_id },
    attributes: ["status", "user_id", "assignedTo", "assignedRoleIds"],
    raw: true,
  });

  const statusCount = {
    Pending: 0,
    "In Progress": 0,
    Completed: 0,
    Canceled: 0,
    Escalated: 0,
    Other: 0,
  };

  for (const t of allTickets) {
    let visible = t.user_id === userId;
    if (!visible && parseJSON(t.assignedTo, []).includes(userId))
      visible = true;
    if (!visible) {
      for (const r of parseJSON(t.assignedRoleIds, [])) {
        if ((await getParentRoles(r, org_id)).includes(userRoleId)) {
          visible = true;
          break;
        }
      }
    }

    if (visible) {
      const s = t.status || "Other";
      statusCount[s] = (statusCount[s] || 0) + 1;
    }
  }

  return Object.entries(statusCount)
    .filter(([_, v]) => v > 0)
    .map(([status, count]) => ({ status, count }));
};

exports.getTicketDashboardData = async (org_id, userId, userRoleId) => {
  try {
    const [
      totalTickets,
      openTickets,
      dueToday,
      overdue,
      highPriority,
      escalated,
      statusBreakdown,
    ] = await Promise.all([
      getTotalTicketsCount(org_id, userId, userRoleId),
      getOpenTicketsCount(org_id, userId, userRoleId),
      getDueTodayTicketsCount(org_id, userId, userRoleId),
      getOverdueTicketsCount(org_id, userId, userRoleId),
      getHighPriorityTicketsCount(org_id, userId, userRoleId),
      getEscalatedTicketsCount(org_id, userId, userRoleId),
      getTicketsByStatus(org_id, userId, userRoleId),
    ]);

    return {
      totalTickets,
      openTickets,
      dueTodayTickets: dueToday,
      overdueTickets: overdue,
      highPriorityTickets: highPriority,
      escalatedTickets: escalated,
      ticketsByStatus: statusBreakdown,
    };
  } catch (err) {
    console.error("Ticket Dashboard Data Error:", err);
    return {
      totalTickets: 0,
      openTickets: 0,
      dueTodayTickets: 0,
      overdueTickets: 0,
      highPriorityTickets: 0,
      escalatedTickets: 0,
      ticketsByStatus: [],
    };
  }
};
