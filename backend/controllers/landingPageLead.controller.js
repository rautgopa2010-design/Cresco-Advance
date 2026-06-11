const db = require("../models");
const LandingPageLead = db.landingPageLead;
const Customer = db.customer;
const CompanySetup = db.companySetup;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { Op } = require("sequelize");

function formatDateTime() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
}

// Public endpoint – no auth
exports.createLandingLead = async (req, res) => {
  const {
    name,
    companyName,
    mobile,
    phone,
    email,
    leadSource,
    address,
    description,
    companySlug,
  } = req.body;

  if (!companySlug)
    return sendErrorResponse(res, 400, "companySlug is required");
  if (!name || !mobile || !email)
    return sendErrorResponse(res, 400, "Required fields missing");

  try {
    // Get org_id from companySlug
    const company = await CompanySetup.findOne({ where: { companySlug } });
    if (!company) return sendErrorResponse(res, 404, "Invalid company slug");

    await LandingPageLead.create({
      org_id: company.org_id,
      companySlug,
      date: formatDateTime(),
      SENDER_NAME: name,
      SENDER_COMPANY: companyName || null,
      SENDER_MOBILE: mobile,
      SENDER_PHONE: phone || null,
      SENDER_EMAIL: email,
      SENDER_ADDRESS: address || null,
      LEAD_SOURCE: leadSource || null,
      QUERY_MESSAGE: description || null,
    });

    // Send welcome email to the enquiry email address
    try {
      const { sendLandingPageWelcomeEmail } = require("../utility/leadEmails");
      await sendLandingPageWelcomeEmail({
        name,
        email,
        leadSource: leadSource || "Landing Page",
        companyName: companyName || company.companyName || "Our Company",
        mobile,
        companySlug,
        org_id: company.org_id 
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Failed to send welcome email:", emailError);
    }

    res.status(201).json({ message: "Enquiry submitted successfully" });
  } catch (err) {
    console.error("Landing Lead Error:", err);
    return sendErrorResponse(res, 500, "Failed to save enquiry");
  }
};

// Authenticated – get leads for logged-in org
exports.getLandingLeads = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    const leads = await LandingPageLead.findAll({
      where: { org_id },
      order: [["id", "DESC"]],
    });
    res.status(200).json(leads);
  } catch (err) {
    console.error("Get Landing Leads Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch landing leads");
  }
};

// Update status (Pending → Converted) + auto-create Customer
exports.updateLandingLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const org_id = req.user.org_id;

  try {
    const lead = await LandingPageLead.findOne({ where: { id, org_id } });
    if (!lead) return sendErrorResponse(res, 404, "Lead not found");

    await lead.update({ status });

    if (status === "Converted") {
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
          leadSource: lead.LEAD_SOURCE || null,
          customerCategory: null,
          assignedTo: [user_id],
        },
      });
    }

    res
      .status(200)
      .json({ message: "Enquiry and Lead status generated successfully" });
  } catch (err) {
    console.error("Update Landing Lead Status Error:", err);
    return sendErrorResponse(res, 500, "Failed to update lead status");
  }
};
