const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { getParentRoles } = require("../utility/roleHelper");

const Quotation = db.quotation;
const Employee = db.employee;

exports.createQuotation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;

  const {
    assignedTo,
    companyName,
    gstinNo,
    customerPerson,
    mobile,
    email,
    date,
    billingAddress,
    shippingAddress,
    description,
    termsAndConditions,
    productQuotationDetails,
    finalAmt,
  } = req.body;

  try {
    // ===== Generate next numeric quotation number (001, 002, ...) =====
    const lastQuotation = await Quotation.findOne({
      where: { org_id },
      order: [["id", "DESC"]],
    });

    let nextNumber = 1;

    if (lastQuotation?.quotationNo) {
      nextNumber = parseInt(lastQuotation.quotationNo, 10) + 1;
    }

    const quotationNo = String(nextNumber).padStart(3, "0");

    // ✅ Convert assignedTo to array of IDs
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo.map((emp) => (typeof emp === "object" ? emp.id : emp))
      : [];

    // ✅ Resolve assignedRoleIds from employees
    let assignedRoleIds = [];
    if (assignedToArray.length > 0) {
      const employees = await Employee.findAll({
        where: { id: assignedToArray, org_id },
      });
      assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);
    }

    const newQuotation = await Quotation.create({
      org_id,
      quotationNo,
      user_id,
      assignedTo: assignedToArray,
      assignedRoleIds,
      companyName,
      gstinNo,
      customerPerson,
      mobile,
      email,
      date,
      billingAddress,
      shippingAddress,
      description,
      termsAndConditions,
      productQuotationDetails,
      finalAmt,
    });

    res.status(201).json({
      message: "Quotation created successfully.",
      quotationId: newQuotation.id,
      quotationNo: newQuotation.quotationNo,
    });
  } catch (error) {
    console.error("Create Quotation Error:", error);
    return sendErrorResponse(res, 500, "Error creating quotation.");
  }
};

const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    if (typeof value === "object") return value;
    return fallback;
  } catch (err) {
    return fallback;
  }
};

exports.getAllQuotations = async (req, res) => {
  const { org_id, id: userId, role_id: userRoleId } = req.user;

  try {
    const allQuotations = await Quotation.findAll({ where: { org_id } });

    const visibleQuotations = [];

    for (const quotation of allQuotations) {
      let isVisible = false;

      // ✅ Created by user
      if (quotation.user_id === userId) isVisible = true;

      // ✅ Directly assigned
      const assignedIds = Array.isArray(quotation.assignedTo)
        ? quotation.assignedTo
        : parseJSON(quotation.assignedTo, []);
      if (!isVisible && assignedIds.includes(userId)) isVisible = true;

      // ✅ Role-based visibility
      if (!isVisible) {
        const assignedRoles = Array.isArray(quotation.assignedRoleIds)
          ? quotation.assignedRoleIds
          : parseJSON(quotation.assignedRoleIds, []);

        for (const roleId of assignedRoles) {
          const parentRoles = await getParentRoles(roleId, org_id);
          if (parentRoles.includes(userRoleId)) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) visibleQuotations.push(quotation);
    }

    // ✅ Enrich assignedTo names
    const enrichedQuotations = await Promise.all(
      visibleQuotations.map(async (quotation) => {
        let assignedToNames = [];
        const assignedIds = Array.isArray(quotation.assignedTo)
          ? quotation.assignedTo
          : parseJSON(quotation.assignedTo, []);

        if (assignedIds.length > 0) {
          const employees = await Employee.findAll({
            where: { id: assignedIds },
          });
          assignedToNames = employees.map((emp) =>
            [emp.salutation, emp.firstName, emp.middleName, emp.lastName]
              .filter(Boolean)
              .join(" ")
          );
        }

        return {
          ...quotation.toJSON(),
          assignedTo: assignedToNames,
          billingAddress: parseJSON(quotation.billingAddress, {}),
          shippingAddress: parseJSON(quotation.shippingAddress, {}),
          productQuotationDetails: parseJSON(
            quotation.productQuotationDetails,
            {}
          ),
        };
      })
    );

    res.status(200).json(enrichedQuotations);
  } catch (error) {
    console.error("Get Quotations Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch quotations");
  }
};

exports.updateQuotation = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  const {
    assignedTo,
    companyName,
    gstinNo,
    customerPerson,
    mobile,
    email,
    date,
    billingAddress,
    shippingAddress,
    description,
    termsAndConditions,
    productQuotationDetails,
    finalAmt,
  } = req.body;

  try {
    const quotation = await Quotation.findOne({ where: { id, org_id } });
    if (!quotation) return sendErrorResponse(res, 404, "Quotation not found.");

    // ✅ Convert assignedTo to array of IDs (same as create)
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo.map((emp) => (typeof emp === "object" ? emp.id : emp))
      : [];

    // ✅ Resolve assignedRoleIds from employees
    let assignedRoleIds = [];
    if (assignedToArray.length > 0) {
      const employees = await Employee.findAll({
        where: { id: assignedToArray, org_id },
      });
      assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);
    }

    await quotation.update({
      assignedTo: assignedToArray,
      assignedRoleIds,
      companyName,
      gstinNo,
      customerPerson,
      mobile,
      email,
      date,
      billingAddress,
      shippingAddress,
      description,
      termsAndConditions,
      productQuotationDetails,
      finalAmt,
    });

    res.status(200).json({
      message: "Quotation updated successfully.",
      quotationId: quotation.id,
    });
  } catch (error) {
    console.error("Update Quotation Error:", error);
    return sendErrorResponse(res, 500, "Error updating quotation.");
  }
};

exports.deleteQuotation = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const quotation = await Quotation.findOne({ where: { id, org_id } });
    if (!quotation) return sendErrorResponse(res, 404, "Quotation not found.");

    await quotation.destroy();
    res.status(200).json({ message: "Quotation deleted successfully." });
  } catch (error) {
    console.error("Delete Quotation Error:", error);
    return sendErrorResponse(res, 500, "Error deleting quotation.");
  }
};
