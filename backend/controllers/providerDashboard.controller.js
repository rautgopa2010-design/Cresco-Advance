const db = require("../models");
const Register = db.register;
const Ticket = db.ticket;
const Payment = db.payment;
const { Op } = require("sequelize");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

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

// // old
// exports.getProviderDashboardData = async (req, res) => {
//   if (
//     req.user.user_type !== "provider" ||
//     req.user.role_name !== "Super Provider Admin"
//   ) {
//     return sendErrorResponse(res, 403, "Access denied");
//   }

//   const providerOrgId = req.user.org_id;

//   try {
//     // Fetch only company organizations (exclude provider's own org)
//     const companies = await Register.findAll({
//       where: {
//         providerId: providerOrgId,
//         id: { [Op.ne]: providerOrgId },
//       },
//       attributes: [
//         "id",
//         "company",
//         "firstName",
//         "middleName",
//         "lastName",
//         "mobile",
//         "email",
//         "accountActivity",
//         "packageDetails",
//         "packageExpiryDate",
//         "createdAt",
//       ],
//     });

//     const totalOrganizations = companies.length;

//     const activeOrganizations = companies.filter(
//       (org) => org.accountActivity === "Activate"
//     ).length;

//     const deactivated = companies.filter(
//       (org) => org.accountActivity === "Deactivate"
//     ).length;

//     // Expired: either marked as Expired or package expired
//     const expired = companies.filter((org) => {
//       if (org.accountActivity === "Expired") return true;
//       if (org.packageExpiryDate && new Date(org.packageExpiryDate) < new Date())
//         return true;
//       return false;
//     }).length;

//     const companyIds = companies.map((org) => org.id);

//     // Successful payments only
//     const payments = await Payment.findAll({
//       where: {
//         org_id: companyIds,
//       },
//       attributes: [
//         "amount",
//         "currency",
//         "createdAt",
//         "paymentId",
//         "orderId",
//         "userEmail",
//         "org_id",
//         "status",
//       ],
//     });

//     // Simple currency conversion to INR
//     const conversionRates = { USD: 83, EUR: 90, GBP: 105 };
//     let totalRevenueINR = 0;
//     payments.forEach((p) => {
//       let amt = p.amount || 0;
//       if (p.currency !== "INR") {
//         amt *= conversionRates[p.currency] || 83;
//       }
//       totalRevenueINR += amt;
//     });

//     // Escalated tickets (only from companies, escalatedToProvider: true)
//     const escalatedTickets = await Ticket.findAll({
//       where: {
//         org_id: companyIds,
//         escalatedToProvider: true,
//       },
//       attributes: ["id", "status", "createdDate", "title", "org_id"],
//     });

//     const escalatedTicketsCount = escalatedTickets.length;

//     // === Monthly Revenue Trend (Last 12 months: Jan → Dec order) ===
//     const months = [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ];
//     const monthlyRevenue = [];
//     const now = new Date();

//     for (let i = 11; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(1); // Avoid day overflow issues
//       date.setMonth(now.getMonth() - i);

//       const monthStr = months[date.getMonth()];
//       const year = date.getFullYear();

//       const monthPayments = payments.filter((p) => {
//         const pDate = new Date(p.createdAt);
//         return (
//           pDate.getMonth() === date.getMonth() && pDate.getFullYear() === year
//         );
//       });

//       let monthRev = 0;
//       monthPayments.forEach((p) => {
//         let amt = p.amount || 0;
//         if (p.currency !== "INR") amt *= conversionRates[p.currency] || 83;
//         monthRev += amt;
//       });

//       monthlyRevenue.push({ month: monthStr, revenue: monthRev });
//     }
//     monthlyRevenue.reverse(); // Now: Jan → Dec

//     // === Revenue by Package ===
//     const packageRevenue = {};
//     companies.forEach((org) => {
//       const details = parseJSON(org.packageDetails, null);
//       const pkgName = details?.packageName || "Unknown";
//       const orgPayments = payments.filter((p) => p.org_id === org.id);
//       let orgRev = 0;
//       orgPayments.forEach((p) => {
//         let amt = p.amount || 0;
//         if (p.currency !== "INR") amt *= conversionRates[p.currency] || 83;
//         orgRev += amt;
//       });
//       packageRevenue[pkgName] = (packageRevenue[pkgName] || 0) + orgRev;
//     });

//     const totalPkgRev =
//       Object.values(packageRevenue).reduce((a, b) => a + b, 0) || 1;
//     const revenueByPackage = Object.entries(packageRevenue).map(
//       ([name, value]) => ({
//         name,
//         value: Math.round((value / totalPkgRev) * 100),
//       })
//     );

//     // Fallback if no package data
//     if (revenueByPackage.length === 0) {
//       revenueByPackage.push(
//         { name: "Basic", value: 22 },
//         { name: "Pro", value: 38 },
//         { name: "Enterprise", value: 40 }
//       );
//     }

//     // === Active Packages Count ===
//     const activePackageCounts = {};
//     companies
//       .filter((org) => org.accountActivity === "Activate")
//       .forEach((org) => {
//         const details = parseJSON(org.packageDetails, null);
//         const pkgName = details?.packageName || "Free";
//         activePackageCounts[pkgName] = (activePackageCounts[pkgName] || 0) + 1;
//       });

//     const activePackages = Object.entries(activePackageCounts).map(
//       ([name, value]) => ({
//         name,
//         value,
//       })
//     );

//     // === Upcoming Expiries ===
//     const today = new Date();
//     const next7 = new Date(today);
//     next7.setDate(today.getDate() + 7);
//     const next30 = new Date(today);
//     next30.setDate(today.getDate() + 30);
//     const next90 = new Date(today);
//     next90.setDate(today.getDate() + 90);

//     let exp7 = 0,
//       exp30 = 0,
//       exp90 = 0;
//     companies.forEach((org) => {
//       if (org.packageExpiryDate) {
//         const exp = new Date(org.packageExpiryDate);
//         if (exp <= next90) exp90++;
//         if (exp <= next30) exp30++;
//         if (exp <= next7) exp7++;
//       }
//     });

//     // === Escalated Tickets Status - Correct Categories ===
//     const statusCount = { Pending: 0, Escalated: 0, Completed: 0, Canceled: 0 };
//     escalatedTickets.forEach((ticket) => {
//       const s = ticket.status;
//       if (statusCount.hasOwnProperty(s)) {
//         statusCount[s]++;
//       }
//     });

//     const escalatedTicketsStatus = [
//       { name: "Pending", value: statusCount.Pending },
//       { name: "Escalated", value: statusCount.Escalated }, // ← Changed from "In Progress"
//       { name: "Completed", value: statusCount.Completed },
//       { name: "Canceled", value: statusCount.Canceled },
//     ];

//     // === Recent Activities ===
//     const recentRegistrations = companies
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 5)
//       .map((org) => ({
//         date: org.createdAt
//           ? new Date(org.createdAt).toISOString().split("T")[0]
//           : "-",
//         company: org.company || "-",
//         customerName:
//           [org.firstName, org.middleName, org.lastName]
//             .filter(Boolean)
//             .join(" ") || "-",
//         package: parseJSON(org.packageDetails, null)?.packageName || "-",
//         mobile: org.mobile || "-",
//         email: org.email || "-",
//       }));

//     const recentPayments = payments
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 5)
//       .map((p) => {
//         const org = companies.find((o) => o.id === p.org_id) || {};
//         return {
//           date: p.createdAt
//             ? new Date(p.createdAt).toISOString().split("T")[0]
//             : "-",
//           company: org.company || "-",
//           paymentId: p.paymentId || "-",
//           orderId: p.orderId || "-",
//           email: p.userEmail || "-",
//           amount: `₹${p.amount || 0}`,
//           status: p.status || "-",
//         };
//       });

//     const recentEscalatedTickets = escalatedTickets
//       .sort((a, b) => b.id - a.id)
//       .slice(0, 5)
//       .map((t) => {
//         const org = companies.find((o) => o.id === t.org_id) || {};
//         return {
//           date: t.createdDate || "-",
//           company: org.company || "-",
//           ticketId: t.id,
//           title: t.title || "-",
//           status: t.status || "-",
//         };
//       });

//     // Final Response
//     res.status(200).json({
//       summaryCards: {
//         totalOrganizations,
//         activeOrganizations,
//         expired,
//         totalRevenue:
//           totalRevenueINR >= 100000
//             ? `₹${(totalRevenueINR / 100000).toFixed(1)}L`
//             : `₹${Math.round(totalRevenueINR)}`,
//         deactivate: deactivated,
//         escalatedTickets: escalatedTicketsCount,
//       },
//       monthlyRevenueTrend: monthlyRevenue,
//       revenueByPackage,
//       activePackages,
//       upcomingExpiries: [
//         { label: "Next 7 Days", value: exp7 },
//         { label: "Next 30 Days", value: exp30 },
//         { label: "Next 90 Days", value: exp90 },
//       ],
//       escalatedTicketsStatus, // Now shows "Escalated" instead of "In Progress"
//       recentRegistrations,
//       recentPayments,
//       recentEscalatedTickets,
//     });
//   } catch (error) {
//     console.error("getProviderDashboardData Error:", error);
//     return sendErrorResponse(
//       res,
//       500,
//       "Failed to fetch provider dashboard data"
//     );
//   }
// };

exports.getProviderDashboardData = async (req, res) => {
  if (
    req.user.user_type !== "provider" ||
    req.user.role_name !== "Super Provider Admin"
  ) {
    return sendErrorResponse(res, 403, "Access denied");
  }

  const providerOrgId = req.user.org_id;

  try {
    // Fetch only company organizations (exclude provider's own org)
    const companies = await Register.findAll({
      where: {
        providerId: providerOrgId,
        id: { [Op.ne]: providerOrgId },
      },
      attributes: [
        "id",
        "company",
        "firstName",
        "middleName",
        "lastName",
        "mobile",
        "email",
        "accountActivity",
        "packageDetails",
        "packageExpiryDate",
        "createdAt",
      ],
    });

    const totalOrganizations = companies.length;

    const activeOrganizations = companies.filter(
      (org) => org.accountActivity === "Activate"
    ).length;

    const deactivated = companies.filter(
      (org) => org.accountActivity === "Deactivate"
    ).length;

    // Expired: either marked as Expired or package expired
    const expired = companies.filter((org) => {
      if (org.accountActivity === "Expired") return true;
      if (org.packageExpiryDate && new Date(org.packageExpiryDate) < new Date())
        return true;
      return false;
    }).length;

    const companyIds = companies.map((org) => org.id);

    // Get ALL payments (including 'created' for total revenue)
    const allPayments = await Payment.findAll({
      where: {
        org_id: companyIds,
      },
      attributes: [
        "amount",
        "currency",
        "createdAt",
        "paymentId",
        "orderId",
        "userEmail",
        "org_id",
        "status",
      ],
    });

    // Get ONLY COMPLETED payments for charts and analytics
    const completedPayments = allPayments.filter(
      (p) => p.status === "completed"
    );

    // Simple currency conversion to INR
    const conversionRates = { USD: 83, EUR: 90, GBP: 105 };

    // Calculate total revenue from ALL payments (only 'completed')
    let totalRevenueINR = 0;
    completedPayments.forEach((p) => {
      let amt = p.amount || 0;
      if (p.currency !== "INR") {
        amt *= conversionRates[p.currency] || 83;
      }
      totalRevenueINR += amt;
    });

    // Escalated tickets (only from companies, escalatedToProvider: true)
    const escalatedTickets = await Ticket.findAll({
      where: {
        org_id: companyIds,
        escalatedToProvider: true,
      },
      attributes: ["id", "status", "createdDate", "title", "org_id"],
    });

    const escalatedTicketsCount = escalatedTickets.length;

    // === Monthly Revenue Trend (Last 12 months: Jan → Dec order) ===
    // Using ONLY COMPLETED payments for monthly trend
    const months = [
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
    const monthlyRevenue = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(now.getMonth() - i);

      const monthStr = months[date.getMonth()];
      const year = date.getFullYear();

      // Use completedPayments instead of allPayments
      const monthPayments = completedPayments.filter((p) => {
        const pDate = new Date(p.createdAt);
        return (
          pDate.getMonth() === date.getMonth() && pDate.getFullYear() === year
        );
      });

      let monthRev = 0;
      monthPayments.forEach((p) => {
        let amt = p.amount || 0;
        if (p.currency !== "INR") amt *= conversionRates[p.currency] || 83;
        monthRev += amt;
      });

      monthlyRevenue.push({ month: monthStr, revenue: monthRev });
    }
    monthlyRevenue.reverse(); // Now: Jan → Dec

    // === Revenue by Package ===
    // Use completedPayments for package revenue
    const packageRevenue = {};
    companies.forEach((org) => {
      const details = parseJSON(org.packageDetails, null);
      const pkgName = details?.packageName || "Unknown";
      const orgPayments = completedPayments.filter((p) => p.org_id === org.id);
      let orgRev = 0;
      orgPayments.forEach((p) => {
        let amt = p.amount || 0;
        if (p.currency !== "INR") amt *= conversionRates[p.currency] || 83;
        orgRev += amt;
      });
      packageRevenue[pkgName] = (packageRevenue[pkgName] || 0) + orgRev;
    });

    const totalPkgRev =
      Object.values(packageRevenue).reduce((a, b) => a + b, 0) || 1;
    const revenueByPackage = Object.entries(packageRevenue).map(
      ([name, value]) => ({
        name,
        value: Math.round((value / totalPkgRev) * 100),
      })
    );

    // Fallback if no package data
    if (revenueByPackage.length === 0) {
      revenueByPackage.push(
        { name: "Basic", value: 22 },
        { name: "Pro", value: 38 },
        { name: "Enterprise", value: 40 }
      );
    }

    // === Active Packages Count ===
    const activePackageCounts = {};
    companies
      .filter((org) => org.accountActivity === "Activate")
      .forEach((org) => {
        const details = parseJSON(org.packageDetails, null);
        const pkgName = details?.packageName || "Free";
        activePackageCounts[pkgName] = (activePackageCounts[pkgName] || 0) + 1;
      });

    const activePackages = Object.entries(activePackageCounts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // === Upcoming Expiries ===
    const today = new Date();
    const next7 = new Date(today);
    next7.setDate(today.getDate() + 7);
    const next30 = new Date(today);
    next30.setDate(today.getDate() + 30);
    const next90 = new Date(today);
    next90.setDate(today.getDate() + 90);

    let exp7 = 0,
      exp30 = 0,
      exp90 = 0;
    companies.forEach((org) => {
      if (org.packageExpiryDate) {
        const exp = new Date(org.packageExpiryDate);
        if (exp <= next90) exp90++;
        if (exp <= next30) exp30++;
        if (exp <= next7) exp7++;
      }
    });

    // === Escalated Tickets Status ===
    const statusCount = { Pending: 0, Escalated: 0, Completed: 0, Canceled: 0 };
    escalatedTickets.forEach((ticket) => {
      const s = ticket.status;
      if (statusCount.hasOwnProperty(s)) {
        statusCount[s]++;
      }
    });

    const escalatedTicketsStatus = [
      { name: "Pending", value: statusCount.Pending },
      { name: "Escalated", value: statusCount.Escalated },
      { name: "Completed", value: statusCount.Completed },
      { name: "Canceled", value: statusCount.Canceled },
    ];

    // === Recent Activities ===
    const recentRegistrations = companies
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((org) => ({
        date: org.createdAt
          ? new Date(org.createdAt).toISOString().split("T")[0]
          : "-",
        company: org.company || "-",
        customerName:
          [org.firstName, org.middleName, org.lastName]
            .filter(Boolean)
            .join(" ") || "-",
        package: parseJSON(org.packageDetails, null)?.packageName || "-",
        mobile: org.mobile || "-",
        email: org.email || "-",
      }));

    // Use allPayments for recent payments (show both completed and created)
    const recentPayments = allPayments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((p) => {
        const org = companies.find((o) => o.id === p.org_id) || {};
        return {
          date: p.createdAt
            ? new Date(p.createdAt).toISOString().split("T")[0]
            : "-",
          company: org.company || "-",
          paymentId: p.paymentId || "-",
          orderId: p.orderId || "-",
          email: p.userEmail || "-",
          amount: p.amount || 0,
          status: p.status || "-",
        };
      });

    const recentEscalatedTickets = escalatedTickets
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map((t) => {
        const org = companies.find((o) => o.id === t.org_id) || {};
        return {
          date: t.createdDate || "-",
          company: org.company || "-",
          ticketId: t.id,
          title: t.title || "-",
          status: t.status || "-",
        };
      });

    // Format total revenue WITHOUT rounding to Lakhs/Crores
    // Just show the actual number with ₹ symbol
    const formattedTotalRevenue = `₹${Math.round(
      totalRevenueINR
    ).toLocaleString("en-IN")}`;

    // Final Response
    res.status(200).json({
      summaryCards: {
        totalOrganizations,
        activeOrganizations,
        expired,
        totalRevenue: formattedTotalRevenue, // Now shows actual value like "₹1,47,726"
        deactivate: deactivated,
        escalatedTickets: escalatedTicketsCount,
      },
      monthlyRevenueTrend: monthlyRevenue, // Now only includes completed payments
      revenueByPackage,
      activePackages,
      upcomingExpiries: [
        { label: "Next 7 Days", value: exp7 },
        { label: "Next 30 Days", value: exp30 },
        { label: "Next 90 Days", value: exp90 },
      ],
      escalatedTicketsStatus,
      recentRegistrations,
      recentPayments,
      recentEscalatedTickets,
    });
  } catch (error) {
    console.error("getProviderDashboardData Error:", error);
    return sendErrorResponse(
      res,
      500,
      "Failed to fetch provider dashboard data"
    );
  }
};
