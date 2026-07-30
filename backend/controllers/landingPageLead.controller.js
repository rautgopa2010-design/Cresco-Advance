const db = require("../models");
const LandingPageLead = db.landingPageLead;
const Customer = db.customer;
const CompanySetup = db.companySetup;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { Op } = require("sequelize");

const submissionWindows = new Map();

const clean = (value) => String(value || "").trim();

const getClientIp = (req) =>
  clean(req.headers["x-forwarded-for"]).split(",")[0] || req.ip || "";

const isRateLimited = (req) => {
  const key = `${getClientIp(req)}:${clean(req.body.companySlug)}`;
  const now = Date.now();
  const recent = (submissionWindows.get(key) || []).filter(
    (time) => now - time < 60 * 1000
  );
  if (recent.length >= 5) return true;
  recent.push(now);
  submissionWindows.set(key, recent);
  return false;
};

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
    templateKey,
    landingPageName,
    interestedProduct,
    utm = {},
  } = req.body;

  if (!companySlug)
    return sendErrorResponse(res, 400, "companySlug is required");
  if (!name || !mobile)
    return sendErrorResponse(res, 400, "Required fields missing");

  if (isRateLimited(req)) {
    return sendErrorResponse(res, 429, "Too many submissions. Please try again shortly.");
  }

  try {
    // Get org_id from companySlug
    const company = await CompanySetup.findOne({ where: { companySlug } });
    if (!company) return sendErrorResponse(res, 404, "Invalid company slug");

    const role = await db.roles.findOne({
      where: { org_id: company.org_id, role_name: "Super Admin" },
    });
    const owner = await db.users.findOne({
      where: {
        org_id: company.org_id,
        ...(role?.id ? { role_id: role.id } : {}),
        isDeleted: false,
      },
    });

    const duplicateWhere = [{ mobile }];
    if (email) duplicateWhere.push({ email });
    const existingCustomer = await Customer.findOne({
      where: {
        org_id: company.org_id,
        [Op.or]: duplicateWhere,
      },
    });

    let enquiryId = existingCustomer?.id || null;
    if (!existingCustomer && owner) {
      const enquiry = await Customer.create({
        org_id: company.org_id,
        user_id: owner.id,
        firstName: clean(name),
        mobile: clean(mobile),
        email: clean(email) || null,
        companyName: clean(companyName) || null,
        leadSource: clean(leadSource) || clean(landingPageName) || "Landing Page",
        billingStreet: clean(address) || null,
        assignedTo: [owner.id],
        assignedRoleIds: role?.id ? [role.id] : [],
      });
      enquiryId = enquiry.id;
    }

    await LandingPageLead.create({
      org_id: company.org_id,
      companySlug,
      date: formatDateTime(),
      SENDER_NAME: clean(name),
      SENDER_COMPANY: clean(companyName) || null,
      SENDER_MOBILE: clean(mobile),
      SENDER_PHONE: phone || null,
      SENDER_EMAIL: clean(email) || null,
      SENDER_ADDRESS: address || null,
      LEAD_SOURCE: clean(leadSource) || clean(landingPageName) || null,
      QUERY_MESSAGE: clean(description) || null,
      landingPageName: clean(landingPageName) || null,
      templateKey: clean(templateKey) || "classic",
      interestedProduct: clean(interestedProduct) || null,
      utmSource: clean(utm.utm_source || utm.source),
      utmMedium: clean(utm.utm_medium || utm.medium),
      utmCampaign: clean(utm.utm_campaign || utm.campaign),
      utmTerm: clean(utm.utm_term || utm.term),
      utmContent: clean(utm.utm_content || utm.content),
      ipAddress: getClientIp(req),
      userAgent: clean(req.headers["user-agent"]),
      enquiryId,
    });

    // Send welcome email to the enquiry email address
    if (email) try {
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
