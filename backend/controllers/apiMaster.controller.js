const { validationResult } = require("express-validator");
const db = require("../models");
const APIMaster = db.apiMaster;
const APILead = db.apiLead;
const Customer = db.customer;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// ✅ Create API Master
exports.createAPI = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id; // If you want to track who created it
  const { api_name, api_url, api_key, start_date, end_date } = req.body;

  try {
    // Prevent duplicate API name for same org
    const existingAPI = await APIMaster.findOne({
      where: { org_id, api_name },
    });
    if (existingAPI)
      return sendErrorResponse(
        res,
        400,
        "API already exists for this organization."
      );

    const newAPI = await APIMaster.create({
      org_id,
      api_name,
      api_url,
      api_key,
      start_date,
      end_date,
      user_id,
    });

    res
      .status(201)
      .json({ message: "API created successfully.", apiId: newAPI.id });
  } catch (error) {
    console.error("Create API Error:", error);
    return sendErrorResponse(res, 500, "Error creating API.");
  }
};

// ✅ Get All APIs
exports.getAllAPIs = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const apis = await APIMaster.findAll({ where: { org_id } });
    res.status(200).json(apis);
  } catch (err) {
    console.error("Get APIs Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch APIs");
  }
};

// ✅ Update API
exports.updateAPI = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const org_id = req.user.org_id;
  const { api_name, api_url, api_key, start_date, end_date } = req.body;

  try {
    const api = await APIMaster.findOne({ where: { id, org_id } });
    if (!api) return sendErrorResponse(res, 404, "API not found.");

    const duplicateAPI = await APIMaster.findOne({
      where: { org_id, api_name, id: { [Op.ne]: id } },
    });
    if (duplicateAPI)
      return sendErrorResponse(
        res,
        400,
        "Another API with this name already exists."
      );

    await APIMaster.update(
      { api_name, api_url, api_key, start_date, end_date },
      { where: { id, org_id } }
    );

    res.status(200).json({ message: "API updated successfully." });
  } catch (err) {
    console.error("Update API Error:", err);
    return sendErrorResponse(res, 500, "Failed to update API");
  }
};

// ✅ Delete API
exports.deleteAPI = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const api = await APIMaster.findOne({ where: { id, org_id } });
    if (!api) return sendErrorResponse(res, 404, "API not found.");

    await APIMaster.destroy({ where: { id } });
    res.status(200).json({ message: "API deleted successfully." });
  } catch (err) {
    console.error("Delete API Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete API");
  }
};

// Utility to format date as dd-mm-yyyy HH:MM:SS
function formatDateTime() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // January = 0
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
}

// ✅ Hit API (real or mock)
exports.hitAPI = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const api = await APIMaster.findOne({ where: { id, org_id } });
    if (!api) return sendErrorResponse(res, 404, "API not found.");

    let leadsData = [];

    // --- Mock data if Indiamart or mock key ---
    if (
      !api.api_key ||
      api.api_key === "mock" ||
      api.api_name.toLowerCase().includes("indiamart")
    ) {
      const filePath = path.join(
        __dirname,
        "..",
        "mock",
        "indiamart_leads.json"
      );
      if (!fs.existsSync(filePath)) {
        return sendErrorResponse(res, 500, "Mock JSON file not found.");
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      leadsData = JSON.parse(raw);
    } else {
      // --- Otherwise → Hit real API ---
      const response = await axios.get(api.api_url, {
        headers: {
          Authorization: `Bearer ${api.api_key}`,
          "x-api-key": api.api_key,
        },
      });
      leadsData = response.data;
    }

    // ✅ Store Leads in DB without duplicates
    for (const lead of leadsData) {
      await APILead.findOrCreate({
        where: { UNIQUE_QUERY_ID: lead.UNIQUE_QUERY_ID },
        defaults: {
          org_id,
          api_id: api.id,
          ...lead,
          status: "Pending", // default
          date: formatDateTime(), // current timestamp
        },
      });
    }

    // ✅ Fetch all leads from DB for this API
    const storedLeads = await APILead.findAll({
      where: { org_id, api_id: api.id },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      message: "API hit successfully & leads stored.",
      data: storedLeads,
    });
  } catch (err) {
    console.error("Hit API Error:", err.response?.data || err.message);
    return sendErrorResponse(
      res,
      500,
      err.response?.data?.message || "Failed to hit API."
    );
  }
};

// ✅ Fetch Leads by API
exports.getAPILeads = async (req, res) => {
  const { apiId } = req.params;
  const org_id = req.user.org_id;

  try {
    const leads = await APILead.findAll({
      where: { org_id, api_id: apiId },
      order: [["id", "DESC"]],
    });

    res.status(200).json(leads);
  } catch (err) {
    console.error("Get Leads Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch leads.");
  }
};

// ✅ Update Lead Status (Pending → Converted)
exports.updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const org_id = req.user.org_id;

  try {
    const lead = await APILead.findOne({ where: { id, org_id } });
    if (!lead) return sendErrorResponse(res, 404, "Lead not found.");

    await APILead.update({ status }, { where: { id, org_id } });

    // ✅ Auto-create Customer when status is Converted
    if (status === "Converted") {
      const org_id = req.user.org_id;
      const user_id = req.user.id;

      await Customer.findOrCreate({
        where: { org_id, mobile: lead.SENDER_MOBILE },
        defaults: {
          org_id,
          user_id,
          salutation: null,
          firstName: lead.SENDER_NAME || "Unknown",
          middleName: null,
          lastName: null,
          mobile: lead.SENDER_MOBILE,
          email: lead.SENDER_EMAIL || null,
          companyName: lead.SENDER_COMPANY || null,
          billingStreet: lead.SENDER_ADDRESS || null,
          billingCity: lead.SENDER_CITY || null,
          billingState: lead.SENDER_STATE || null,
          billingPincode: lead.SENDER_PINCODE || null,
          billingCountry: lead.SENDER_COUNTRY || null,
          customerCategory: "API Lead",
          industry: null,
          gstinNo: null,
          assignedTo: [user_id],
        },
      });
    }

    res.status(200).json({ message: "Lead status updated successfully." });
  } catch (err) {
    console.error("Update Lead Status Error:", err);
    return sendErrorResponse(res, 500, "Failed to update lead status.");
  }
};
