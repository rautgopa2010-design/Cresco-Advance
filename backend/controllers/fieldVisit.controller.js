const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { validationResult } = require("express-validator");

const FieldVisit = db.fieldVisit;
const Employee = db.employee;
const Customer = db.customer;
const Lead = db.lead;

const compactAddress = (...parts) => parts.filter(Boolean).join(", ");

const userFullName = (employee) =>
  [employee?.salutation, employee?.firstName, employee?.middleName, employee?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

const findEmployeeForUser = async (user) => {
  const byUserId = await Employee.findOne({ where: { org_id: user.org_id, user_id: user.id } });
  if (byUserId) return byUserId;

  const email = String(user?.email || "").trim();
  if (!email) return null;
  return Employee.findOne({ where: { org_id: user.org_id, email } });
};

exports.createVisit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendErrorResponse(res, 400, errors.array()[0].msg);

  const org_id = req.user.org_id;
  const user_id = req.user.id;

  const {
    visitFor = "Customer",
    customer_id,
    lead_id,
    clientName,
    contactPerson,
    mobile,
    address,
    latitude,
    longitude,
    accuracy,
    notes,
  } = req.body;

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return sendErrorResponse(res, 400, "Valid current location is required.");
  }

  try {
    const employee = await findEmployeeForUser(req.user);
    let resolvedClientName = String(clientName || "").trim();
    let resolvedContactPerson = String(contactPerson || "").trim();
    let resolvedMobile = String(mobile || "").trim();
    let resolvedAddress = String(address || "").trim();
    let resolvedCustomerId = customer_id || null;
    let resolvedLeadId = lead_id || null;

    if (resolvedCustomerId) {
      const customer = await Customer.findOne({ where: { id: resolvedCustomerId, org_id } });
      if (!customer) return sendErrorResponse(res, 404, "Customer not found.");
      resolvedClientName = resolvedClientName || customer.companyName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
      resolvedContactPerson = resolvedContactPerson || `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
      resolvedMobile = resolvedMobile || customer.mobile || "";
    }

    if (resolvedLeadId) {
      const lead = await Lead.findOne({ where: { id: resolvedLeadId, org_id } });
      if (!lead) return sendErrorResponse(res, 404, "Lead not found.");
      resolvedClientName = resolvedClientName || lead.companyName || lead.customerPerson;
      resolvedContactPerson = resolvedContactPerson || lead.customerPerson || "";
      resolvedMobile = resolvedMobile || lead.mobile || "";
    }

    if (!resolvedClientName) {
      return sendErrorResponse(res, 400, "Client name is required.");
    }

    if (!resolvedAddress) {
      resolvedAddress = `Lat ${lat.toFixed(6)}, Long ${lng.toFixed(6)}`;
    }

    const visit = await FieldVisit.create({
      org_id,
      user_id,
      employee_id: employee?.id || null,
      customer_id: resolvedCustomerId,
      lead_id: resolvedLeadId,
      visitFor,
      clientName: resolvedClientName,
      contactPerson: resolvedContactPerson,
      mobile: resolvedMobile,
      address: resolvedAddress,
      latitude: lat,
      longitude: lng,
      accuracy: Number.isFinite(Number(accuracy)) ? Number(accuracy) : null,
      notes,
      checkedInAt: new Date(),
    });

    res.status(201).json({
      message: "Visit check-in saved successfully.",
      visit,
    });
  } catch (error) {
    console.error("Create Field Visit Error:", error);
    return sendErrorResponse(res, 500, "Failed to save visit check-in.");
  }
};

exports.getVisits = async (req, res) => {
  const org_id = req.user.org_id;
  const { employee_id, visitFor, dateFrom, dateTo } = req.query;

  const where = { org_id };
  if (employee_id) where.employee_id = employee_id;
  if (visitFor) where.visitFor = visitFor;

  if (dateFrom || dateTo) {
    where.checkedInAt = {};
    if (dateFrom) where.checkedInAt[db.Sequelize.Op.gte] = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.checkedInAt[db.Sequelize.Op.lte] = end;
    }
  }

  try {
    const visits = await FieldVisit.findAll({
      where,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "salutation", "firstName", "middleName", "lastName", "email", "mobile"],
          required: false,
        },
      ],
      order: [["checkedInAt", "DESC"]],
    });

    res.status(200).json(
      visits.map((visit) => {
        const plain = visit.get({ plain: true });
        return {
          ...plain,
          employeeName: userFullName(plain.employee) || "Unknown employee",
        };
      })
    );
  } catch (error) {
    console.error("Get Field Visits Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch field visits.");
  }
};

exports.getVisitSummary = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const visits = await FieldVisit.findAll({
      where: { org_id },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "salutation", "firstName", "middleName", "lastName"],
          required: false,
        },
      ],
      order: [["checkedInAt", "DESC"]],
      limit: 10,
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalVisits, todayVisits, uniqueEmployees] = await Promise.all([
      FieldVisit.count({ where: { org_id } }),
      FieldVisit.count({ where: { org_id, checkedInAt: { [db.Sequelize.Op.gte]: todayStart } } }),
      FieldVisit.count({ where: { org_id }, distinct: true, col: "employee_id" }),
    ]);

    res.status(200).json({
      totalVisits,
      todayVisits,
      uniqueEmployees,
      recentVisits: visits.map((visit) => {
        const plain = visit.get({ plain: true });
        return {
          ...plain,
          employeeName: userFullName(plain.employee) || "Unknown employee",
        };
      }),
    });
  } catch (error) {
    console.error("Field Visit Summary Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch visit summary.");
  }
};
