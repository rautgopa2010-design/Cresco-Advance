const { Op } = require("sequelize");
const db = require("../models");

const clean = (value) => String(value || "").trim();
const lower = (value) => clean(value).toLowerCase();
const digits = (value) => clean(value).replace(/\D/g, "");

const normalizeCompanyName = (value) =>
  lower(value)
    .replace(/\b(private|pvt|limited|ltd|llp|inc|corp|corporation|company|co)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const normalizeDomain = (value) => {
  const text = lower(value).replace(/^https?:\/\//, "").replace(/^www\./, "");
  return text.split("/")[0] || "";
};

const normalizeEmail = (value) => lower(value);
const normalizePhone = (value) => {
  const number = digits(value);
  return number.length > 10 ? number.slice(-10) : number;
};

const containsAny = (text, list = []) => {
  const value = lower(text);
  return list.some((item) => item && value.includes(lower(item)));
};

const getEvidence = async (org_id, prospectId) =>
  db.prospectingEvidence.findAll({ where: { org_id, prospectId } });

const findDuplicates = async ({ org_id, prospect, criteria = {} }) => {
  const companyKey = normalizeCompanyName(prospect.companyName);
  const domain = normalizeDomain(prospect.website);
  const email = normalizeEmail(prospect.email);
  const phone = normalizePhone(prospect.mobile);
  const matches = [];

  const or = [
    email ? { email } : null,
    phone ? { mobile: { [Op.like]: `%${phone}` } } : null,
    prospect.companyName ? { companyName: { [Op.like]: `%${prospect.companyName}%` } } : null,
  ].filter(Boolean);

  if (or.length) {
    const [customers, leads, companyAccounts] = await Promise.all([
      db.customer.findAll({ where: { org_id, [Op.or]: or }, limit: 10 }),
      db.lead.findAll({ where: { org_id, [Op.or]: or }, limit: 10 }),
      db.companySetup ? db.companySetup.findAll({ where: { org_id, [Op.or]: or }, limit: 10 }) : [],
    ]);
    customers.forEach((item) => matches.push({ type: "Existing Customer", source: "customer", id: item.id, rule: "email_phone_or_company" }));
    leads.forEach((item) => matches.push({ type: "Existing CRM Record", source: "lead", id: item.id, rule: "email_phone_or_company" }));
    companyAccounts.forEach((item) => matches.push({ type: "Existing CRM Record", source: "company_account", id: item.id, rule: "email_phone_or_company" }));
  }

  const [landingLeads, apiLeads] = await Promise.all([
    db.landingPageLead
      ? db.landingPageLead.findAll({ where: { org_id }, order: [["id", "DESC"]], limit: 200 })
      : [],
    db.apiLead
      ? db.apiLead.findAll({ where: { org_id }, order: [["id", "DESC"]], limit: 200 })
      : [],
  ]);

  landingLeads.forEach((item) => {
    const sameEmail = email && normalizeEmail(item.SENDER_EMAIL) === email;
    const samePhone = phone && [item.SENDER_MOBILE, item.SENDER_PHONE].some((value) => normalizePhone(value) === phone);
    const sameCompany = companyKey && normalizeCompanyName(item.SENDER_COMPANY) === companyKey;
    if (sameEmail || samePhone || sameCompany) {
      matches.push({ type: "Existing CRM Record", source: "landing_page_lead", id: item.id, rule: sameEmail ? "email" : samePhone ? "phone" : "company" });
    }
  });

  apiLeads.forEach((item) => {
    const sameEmail = email && normalizeEmail(item.SENDER_EMAIL) === email;
    const samePhone = phone && [item.SENDER_MOBILE, item.SENDER_PHONE].some((value) => normalizePhone(value) === phone);
    const sameCompany = companyKey && normalizeCompanyName(item.SENDER_COMPANY) === companyKey;
    if (sameEmail || samePhone || sameCompany) {
      matches.push({ type: "Existing CRM Record", source: "api_lead", id: item.id, rule: sameEmail ? "email" : samePhone ? "phone" : "company" });
    }
  });

  const previous = await db.prospectingProspect.findAll({
    where: {
      org_id,
      id: { [Op.ne]: prospect.id || 0 },
      [Op.or]: [
        { status: { [Op.in]: ["new", "review", "approved", "enquiry_created"] } },
        { status: "rejected", updatedAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ],
    },
    order: [["createdAt", "DESC"]],
    limit: 200,
  });

  for (const item of previous) {
    const sameEmail = email && normalizeEmail(item.email) === email;
    const samePhone = phone && normalizePhone(item.mobile) === phone;
    const sameDomain = domain && normalizeDomain(item.website) === domain;
    const sameCompany = companyKey && normalizeCompanyName(item.companyName) === companyKey;
    if (sameEmail || samePhone || sameDomain || sameCompany) {
      matches.push({
        type: item.status === "rejected" ? "Rejected Cooldown" : item.status === "approved" ? "Approved Prospect" : "Previous Research",
        source: "prospecting",
        id: item.id,
        rule: sameEmail ? "email" : samePhone ? "phone" : sameDomain ? "domain" : "company",
        aiMaySuggestFuzzyOnly: false,
      });
    }
  }

  const excluded = [];
  if (containsAny(prospect.industry, criteria.excludedIndustries)) excluded.push({ type: "industry", value: prospect.industry });
  if (containsAny(prospect.companyName, criteria.excludedCompanies)) excluded.push({ type: "company", value: prospect.companyName });

  return {
    normalized: {
      companyName: companyKey,
      domain,
      email,
      phone,
      providerId: clean(prospect.providerIdentifier || prospect.externalId),
    },
    confirmedDuplicates: matches,
    fuzzySuggestions: [],
    exclusions: excluded,
  };
};

const scoreEvidence = ({ prospect, evidence = [], duplicateSummary, criteria = {} }) => {
  const evidenceTypes = new Set(evidence.map((item) => lower(item.evidenceType || item.title)));
  const hasDomain = Boolean(normalizeDomain(prospect.website));
  const hasContact = Boolean(prospect.email || prospect.mobile);
  const hasCompany = Boolean(prospect.companyName);
  const hasIndustry = Boolean(prospect.industry);
  const hasIntent = evidence.some((item) => lower(`${item.evidenceType} ${item.value}`).includes("intent") || lower(`${item.value}`).includes("buy"));
  const hasHiring = evidence.some((item) => lower(`${item.evidenceType} ${item.value}`).includes("hiring"));
  const directFirstParty = evidence.some((item) => lower(`${item.title} ${item.value}`).includes("direct request") || lower(`${item.value}`).includes("demo request") || lower(`${item.value}`).includes("quotation request"));
  const recentEvidenceCount = evidence.filter((item) => {
    const updated = new Date(item.updatedAt || item.createdAt || Date.now());
    return Date.now() - updated.getTime() <= 90 * 24 * 60 * 60 * 1000;
  }).length;

  const checks = {
    companyActivity: hasCompany && evidence.length > 0,
    companyDomainAssociation: hasDomain,
    location: Boolean(criteria.targetLocation),
    industry: hasIndustry,
    contactCompanyAssociation: hasContact && hasCompany,
    contactSource: evidenceTypes.size > 0,
    evidenceFreshness: recentEvidenceCount > 0,
    conflictingData: false,
    exclusions: duplicateSummary.exclusions.length === 0,
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const dataQualityScore = Math.round((passed / Object.keys(checks).length) * 100);
  const prospectFitScore = Math.min(100, 45 + (hasIndustry ? 15 : 0) + (hasCompany ? 15 : 0) + (hasDomain ? 10 : 0) + (criteria.productFocus === "Both" ? 5 : 0));
  const intentScore = Math.min(100, (hasIntent ? 45 : 10) + (hasHiring ? 15 : 0) + (directFirstParty ? 35 : 0));
  const finalProspectScore = Math.round(prospectFitScore * 0.45 + intentScore * 0.3 + dataQualityScore * 0.25);

  return {
    checks,
    dataQualityScore,
    prospectFitScore,
    intentScore,
    finalProspectScore,
    directFirstParty,
    hasIntent,
  };
};

const classify = ({ duplicateSummary, scores }) => {
  if (duplicateSummary.exclusions.length) return "Unqualified Record";
  if (scores.directFirstParty) return "Confirmed Enquiry";
  if (scores.hasIntent && scores.finalProspectScore >= 70) return "High-Intent Prospect";
  if (scores.finalProspectScore >= 55) return "Potential Prospect";
  return "Unqualified Record";
};

const recommend = ({ criteria = {}, classification, priority }) => {
  const product = criteria.productFocus === "HRMS" ? "HRMS" : criteria.productFocus === "Both" ? "Both" : "CRM";
  if (classification === "Confirmed Enquiry") return { crmRecommendation: product, suggestedNextAction: "Create enquiry only after human approval and schedule immediate follow-up." };
  if (priority === "Hot") return { crmRecommendation: product, suggestedNextAction: "Review evidence, approve if relevant, then create enquiry for sales follow-up." };
  if (priority === "Warm") return { crmRecommendation: product, suggestedNextAction: "Review fit and add missing evidence before approval." };
  return { crmRecommendation: product, suggestedNextAction: "Keep in research history; do not create enquiry without stronger evidence." };
};

const verificationStatusFor = ({ duplicateSummary, scores, classification }) => {
  if (duplicateSummary.exclusions.length) return "Disqualified";
  if (duplicateSummary.confirmedDuplicates.some((item) => item.type === "Existing Customer")) return "Existing Customer";
  if (duplicateSummary.confirmedDuplicates.length) return "Duplicate";
  if (classification === "Unqualified Record") return scores.dataQualityScore < 45 ? "Insufficient Evidence" : "Disqualified";
  if (scores.dataQualityScore >= 75) return "Verified";
  if (scores.dataQualityScore >= 50) return "Partially Verified";
  return "Unverified";
};

const priorityFor = (score) => (score >= 80 ? "Hot" : score >= 60 ? "Warm" : "Cold");

const verifyAndScoreProspect = async ({ prospect, org_id, criteria = {} }) => {
  const evidence = prospect.id ? await getEvidence(org_id, prospect.id) : [];
  const duplicateSummary = await findDuplicates({ org_id, prospect, criteria });
  const scores = scoreEvidence({ prospect, evidence, duplicateSummary, criteria });
  const classification = classify({ duplicateSummary, scores });
  const verificationStatus = verificationStatusFor({ duplicateSummary, scores, classification });
  const priority = priorityFor(scores.finalProspectScore);
  const recommendation = recommend({ criteria, classification, priority });
  const canEnterApprovalQueue = ["Verified", "Partially Verified"].includes(verificationStatus);

  return {
    verificationStatus,
    classification,
    priority,
    score: scores.finalProspectScore,
    prospectFitScore: scores.prospectFitScore,
    intentScore: scores.intentScore,
    dataQualityScore: scores.dataQualityScore,
    scoreBreakdown: {
      prospectFitScore: scores.prospectFitScore,
      intentScore: scores.intentScore,
      dataQualityScore: scores.dataQualityScore,
      finalProspectScore: scores.finalProspectScore,
      checks: scores.checks,
      explanation: [
        `Fit score ${scores.prospectFitScore} based on company, industry and product alignment.`,
        `Intent score ${scores.intentScore}; provider/AI inference alone cannot create Confirmed Enquiry.`,
        `Data quality score ${scores.dataQualityScore} based on verification checks and evidence freshness.`,
      ],
    },
    verificationSummary: {
      checks: scores.checks,
      canEnterApprovalQueue,
      note: "Only deterministic duplicate/exclusion rules are applied automatically. Fuzzy duplicates must be reviewed by a user.",
    },
    duplicateSummary,
    ...recommendation,
    status: canEnterApprovalQueue ? "review" : "new",
  };
};

const existingEngagementScore = ({ enquiry }) => {
  let score = 30;
  if (enquiry?.email) score += 20;
  if (enquiry?.mobile) score += 20;
  if (enquiry?.companyName) score += 15;
  if (enquiry?.leadSource === "AI Prospecting") score += 10;
  return Math.min(score, 100);
};

module.exports = {
  normalizeCompanyName,
  normalizeDomain,
  normalizeEmail,
  normalizePhone,
  findDuplicates,
  verifyAndScoreProspect,
  existingEngagementScore,
};
