const { validationResult } = require("express-validator");
const db = require("../models");
const Invoice = db.invoice;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { getParentRoles } = require("../utility/roleHelper");

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

// /* ----------------------- CREATE INVOICE ----------------------- */
// exports.createInvoice = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return sendErrorResponse(res, 400, errors.array()[0].msg);
//   }

//   const org_id = req.user.org_id;
//   const user_id = req.user.id;
//   const userRoleId = req.user.role_id;

//   const {
//     selectedCompany,
//     customerPerson,
//     email,
//     mobile,
//     date,
//     billingAddress,
//     shippingAddress,
//     termsAndConditions,
//     productInvoiceDetails,
//     finalAmt,
//   } = req.body;

//   try {
//     // ===== Generate next numeric invoice number (001, 002, ...) =====
//     const lastInvoice = await Invoice.findOne({
//       where: { org_id },
//       order: [["id", "DESC"]],
//     });

//     let nextNumber = 1;

//     if (lastInvoice?.invoiceNo) {
//       nextNumber = parseInt(lastInvoice.invoiceNo, 10) + 1;
//     }

//     const invoiceNo = String(nextNumber).padStart(3, "0");

//     const newInvoice = await Invoice.create({
//       org_id,
//       invoiceNo,
//       user_id,
//       assignedRoleIds: [userRoleId], // ✅ assign current role
//       selectedCompany,
//       customerPerson,
//       email,
//       mobile,
//       date,
//       billingAddress,
//       shippingAddress,
//       termsAndConditions,
//       productInvoiceDetails,
//       status: "Pending",
//       finalAmt,
//     });

//     return res.status(201).json({
//       message: "Invoice placed successfully.",
//       invoiceId: newInvoice.id,
//     });
//   } catch (error) {
//     console.error("Create Invoice Error:", error);
//     return sendErrorResponse(res, 500, "Error creating invoice.");
//   }
// };

exports.createInvoice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

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
      termsAndConditions,
      productInvoiceDetails,
      finalAmt,
      orderId, // Add orderId to track which order generated this invoice
      invoiceType = "final",
  } = req.body;
  const normalizedInvoiceType = invoiceType === "proforma" ? "proforma" : "final";

  try {
      // ✅ Check if invoice already exists for this order
      if (orderId) {
          const existingInvoice = await Invoice.findOne({
              where: { 
                  org_id,
                  orderId: orderId,
                  invoiceType: normalizedInvoiceType,
              }
          });
          
          if (existingInvoice) {
              return sendErrorResponse(res, 400, "Invoice already generated for this order. You can only edit the existing invoice.");
          }
      }

      // Generate next numeric invoice number
      const lastInvoice = await Invoice.findOne({
          where: { org_id, invoiceType: normalizedInvoiceType },
          order: [["id", "DESC"]],
      });

      let nextNumber = 1;
      if (lastInvoice?.invoiceNo) {
          nextNumber = parseInt(lastInvoice.invoiceNo, 10) + 1;
      }

      const invoiceNo = String(nextNumber).padStart(3, "0");

      const newInvoice = await Invoice.create({
          org_id,
          invoiceNo,
          invoiceType: normalizedInvoiceType,
          user_id,
          assignedRoleIds: [userRoleId],
          selectedCompany,
          customerPerson,
          email,
          mobile,
          date,
          billingAddress,
          shippingAddress,
          termsAndConditions,
          productInvoiceDetails,
          status: "Pending",
          finalAmt,
          orderId, // Store which order created this invoice
      });

      return res.status(201).json({
          message: "Invoice placed successfully.",
          invoiceId: newInvoice.id,
      });
  } catch (error) {
      console.error("Create Invoice Error:", error);
      return sendErrorResponse(res, 500, "Error creating invoice.");
  }
};

/* ----------------------- GET ALL INVOICES ----------------------- */
exports.getAllInvoices = async (req, res) => {
  const { org_id, id: userId, role_id: userRoleId } = req.user;
  const requestedType = req.query.invoiceType === "proforma" ? "proforma" : "final";

  try {
    const allInvoices = await Invoice.findAll({ where: { org_id, invoiceType: requestedType } });

    const visibleInvoices = [];
    for (const invoice of allInvoices) {
      let isVisible = false;

      // 1️⃣ Creator access
      if (invoice.user_id === userId) {
        isVisible = true;
      }

      // 2️⃣ Role-based access
      if (!isVisible) {
        const invoiceAssignedRoles = parseJSON(invoice.assignedRoleIds, []);
        for (const roleId of invoiceAssignedRoles) {
          const parentRoles = await getParentRoles(roleId, org_id);
          if (parentRoles.includes(userRoleId)) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) visibleInvoices.push(invoice);
    }

    // Transform for response
    const transformedInvoices = visibleInvoices.map((invoice) => ({
      id: invoice.id,
      invoiceNo: invoice.invoiceNo,
      invoiceType: invoice.invoiceType,
      org_id: invoice.org_id,
      user_id: invoice.user_id,
      selectedCompany: invoice.selectedCompany,
      customerPerson: invoice.customerPerson,
      email: invoice.email,
      mobile: invoice.mobile,
      date: invoice.date,
      billingAddress: parseJSON(invoice.billingAddress, {}),
      shippingAddress: parseJSON(invoice.shippingAddress, {}),
      termsAndConditions: invoice.termsAndConditions,
      productInvoiceDetails: parseJSON(invoice.productInvoiceDetails, {}),
      status: invoice.status,
      finalAmt: invoice.finalAmt,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }));

    res.status(200).json(transformedInvoices);
  } catch (error) {
    console.error("Get Invoices Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch invoices");
  }
};

// /* ----------------------- Update Invoice ----------------------- */
// exports.updateInvoice = async (req, res) => {
//   const { id } = req.params;
//   const org_id = req.user.org_id;

//   const {
//     selectedCompany,
//     customerPerson,
//     email,
//     mobile,
//     date,
//     billingAddress,
//     shippingAddress,
//     termsAndConditions,
//     productInvoiceDetails,
//     status,
//     finalAmt,
//   } = req.body;

//   try {
//     const invoice = await Invoice.findOne({ where: { id, org_id } });
//     if (!invoice) return sendErrorResponse(res, 404, "Invoice not found.");

//     // ✅ Update fields
//     await invoice.update({
//       selectedCompany,
//       customerPerson,
//       email,
//       mobile,
//       date,
//       billingAddress,
//       shippingAddress,
//       termsAndConditions,
//       productInvoiceDetails,
//       status,
//       finalAmt,
//     });

//     // ✅ Respond with updated data
//     return res.status(200).json({
//       message: "Invoice updated successfully.",
//       updatedInvoice: {
//         id: invoice.id,
//         org_id: invoice.org_id,
//         user_id: invoice.user_id,
//         selectedCompany: invoice.selectedCompany,
//         customerPerson: invoice.customerPerson,
//         email: invoice.email,
//         mobile: invoice.mobile,
//         date: invoice.date,
//         billingAddress: parseJSON(invoice.billingAddress, {}),
//         shippingAddress: parseJSON(invoice.shippingAddress, {}),
//         termsAndConditions: invoice.termsAndConditions,
//         productInvoiceDetails: parseJSON(invoice.productInvoiceDetails, {}),
//         status: invoice.status,
//         finalAmt: invoice.finalAmt,
//         createdAt: invoice.createdAt,
//         updatedAt: invoice.updatedAt,
//       },
//     });
//   } catch (error) {
//     console.error("Update Invoice Error:", error);
//     return sendErrorResponse(res, 500, "Error updating invoice.");
//   }
// };

/* ----------------------- Update Invoice ----------------------- */
exports.updateInvoice = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  const {
    selectedCompany,
    customerPerson,
    email,
    mobile,
    date,
    billingAddress,
    shippingAddress,
    termsAndConditions,
    productInvoiceDetails,
    status,
    finalAmt,
    invoiceType,
  } = req.body;
  const normalizedInvoiceType = invoiceType === "proforma" ? "proforma" : "final";

  try {
    const invoice = await Invoice.findOne({ where: { id, org_id } });
    if (!invoice) return sendErrorResponse(res, 404, "Invoice not found.");

    // ✅ Check if invoice has an associated order
    if (normalizedInvoiceType === "final" && invoice.orderId) {
      const Order = db.order;
      const order = await Order.findOne({ where: { id: invoice.orderId, org_id } });
      
      if (order && order.status !== "Completed") {
        return sendErrorResponse(res, 400, `Cannot update invoice. Associated order is ${order.status}. Only "Completed" orders can have invoices.`);
      }
    }

    // ✅ Update fields
    await invoice.update({
      selectedCompany,
      customerPerson,
      email,
      mobile,
      date,
      billingAddress,
      shippingAddress,
      termsAndConditions,
      productInvoiceDetails,
      status,
      finalAmt,
      invoiceType: normalizedInvoiceType,
    });

    // ✅ Respond with updated data
    return res.status(200).json({
      message: "Invoice updated successfully.",
      updatedInvoice: {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        org_id: invoice.org_id,
        user_id: invoice.user_id,
        selectedCompany: invoice.selectedCompany,
        customerPerson: invoice.customerPerson,
        email: invoice.email,
        mobile: invoice.mobile,
        date: invoice.date,
        billingAddress: parseJSON(invoice.billingAddress, {}),
        shippingAddress: parseJSON(invoice.shippingAddress, {}),
        termsAndConditions: invoice.termsAndConditions,
        productInvoiceDetails: parseJSON(invoice.productInvoiceDetails, {}),
        status: invoice.status,
        finalAmt: invoice.finalAmt,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    return sendErrorResponse(res, 500, "Error updating invoice.");
  }
};

/* ----------------------- Delete Invoice ----------------------- */
exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const invoice = await Invoice.findOne({ where: { id, org_id } });
    if (!invoice) return sendErrorResponse(res, 404, "Invoice not found.");

    await invoice.destroy();
    res.status(200).json({ message: "Invoice deleted successfully." });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return sendErrorResponse(res, 500, "Error deleting invoice.");
  }
};

/* ----------------------- Cancel Invoice ----------------------- */
exports.cancelInvoice = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const invoice = await Invoice.findOne({ where: { id, org_id } });
    if (!invoice) return sendErrorResponse(res, 404, "Invoice not found.");

    if (invoice.status === "Cancelled") {
      return sendErrorResponse(res, 400, "Invoice is already cancelled.");
    }

    await invoice.update({ status: "Cancelled" });

    return res.status(200).json({
      message: "Invoice cancelled successfully.",
      updatedInvoice: {
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        org_id: invoice.org_id,
        user_id: invoice.user_id,
        selectedCompany: invoice.selectedCompany,
        customerPerson: invoice.customerPerson,
        email: invoice.email,
        mobile: invoice.mobile,
        date: invoice.date,
        billingAddress: parseJSON(invoice.billingAddress, {}),
        shippingAddress: parseJSON(invoice.shippingAddress, {}),
        termsAndConditions: invoice.termsAndConditions,
        productInvoiceDetails: parseJSON(invoice.productInvoiceDetails, {}),
        status: invoice.status,
        finalAmt: invoice.finalAmt,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      },
    });
  } catch (error) {
    console.error("Cancel Invoice Error:", error);
    return sendErrorResponse(res, 500, "Error cancelling invoice.");
  }
};
