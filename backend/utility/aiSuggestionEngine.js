const { Op } = require("sequelize");
const db = require("../models");

const Lead = db.lead;
const Followup = db.followup;
const Quotation = db.quotation;
const Order = db.order;

const STAGE_BASE_PROBABILITY = {
  new: 10,
  qualified: 30,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
};

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value).trim();
  const dashed = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashed) {
    const [, day, month, year] = dashed;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dayStart = (date = new Date()) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const daysBetween = (from, to = new Date()) => {
  if (!from) return 0;
  return Math.floor((dayStart(to) - dayStart(from)) / (1000 * 60 * 60 * 24));
};

const numberValue = (value) => {
  const parsed = Number(String(value || 0).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStage = (lead) => String(lead?.leadStage || "New").trim() || "New";

const normalizeStatus = (lead) => String(lead?.leadStatus || "").trim();

const isClosed = (stage, status) => {
  const key = String(stage || "").toLowerCase();
  const statusKey = String(status || "").toLowerCase();
  return ["won", "lost"].includes(key) || ["won", "lost", "closed"].includes(statusKey);
};

const criteriaForLead = (lead, companyField = "companyName") =>
  [
    lead.email ? { email: lead.email } : null,
    lead.mobile ? { mobile: lead.mobile } : null,
    lead.companyName ? { [companyField]: lead.companyName } : null,
  ].filter(Boolean);

const findQuotationForLead = async (lead) => {
  const criteria = criteriaForLead(lead, "companyName");
  if (!criteria.length) return null;
  return Quotation.findOne({
    where: { org_id: lead.org_id, [Op.or]: criteria },
    order: [["createdAt", "DESC"]],
  });
};

const findOrderForLead = async (lead) => {
  const criteria = criteriaForLead(lead, "selectedCompany");
  if (!criteria.length) return null;
  return Order.findOne({
    where: { org_id: lead.org_id, [Op.or]: criteria },
    order: [["createdAt", "DESC"]],
  });
};

const getLatestFollowup = (followups = []) =>
  followups
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0] || null;

const getRiskLevel = (score) => {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
};

const formatDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const buildSuggestionForLead = async (lead) => {
  const stage = normalizeStage(lead);
  const status = normalizeStatus(lead);
  const stageKey = stage.toLowerCase();
  const amount = numberValue(lead.expectedAmount);
  const followups = Array.isArray(lead.followups) ? lead.followups : [];
  const latestFollowup = getLatestFollowup(followups);
  const latestTouch = parseDate(latestFollowup?.updatedAt || latestFollowup?.createdAt || lead.updatedAt || lead.createdAt);
  const staleDays = daysBetween(latestTouch);
  const closingDate = parseDate(lead.expectedClosingDate);
  const overdueClosingDays = closingDate && dayStart(closingDate) < dayStart() ? daysBetween(closingDate) : 0;
  const quotation = await findQuotationForLead(lead);
  const order = await findOrderForLead(lead);
  const hasOpenFollowup = followups.some((followup) => !followup.isCompleted);

  let riskScore = 10;
  const riskReasons = [];

  if (isClosed(stage, status)) riskScore = 5;
  if (!isClosed(stage, status) && staleDays >= 7) {
    riskScore += Math.min(staleDays * 5, 40);
    riskReasons.push(`No activity for ${staleDays} days`);
  }
  if (!isClosed(stage, status) && overdueClosingDays > 0) {
    riskScore += Math.min(overdueClosingDays * 6, 30);
    riskReasons.push(`Expected closing date passed by ${overdueClosingDays} days`);
  }
  if (!hasOpenFollowup && !isClosed(stage, status)) {
    riskScore += 15;
    riskReasons.push("No active follow-up is scheduled");
  }
  if (amount >= 100000 && ["new", "qualified"].includes(stageKey)) {
    riskScore += 10;
    riskReasons.push("High value deal is still early stage");
  }
  if (order) riskReasons.push("Order signal found");
  if (quotation && !order) riskReasons.push("Quotation signal found");

  riskScore = Math.max(0, Math.min(100, riskScore));

  let suggestedProbability = STAGE_BASE_PROBABILITY[stageKey] ?? 10;
  if (quotation) suggestedProbability += 12;
  if (order) suggestedProbability = 100;
  if (staleDays >= 7) suggestedProbability -= 15;
  if (overdueClosingDays > 0) suggestedProbability -= 12;
  if (!hasOpenFollowup && !isClosed(stage, status)) suggestedProbability -= 8;
  if (stageKey === "lost") suggestedProbability = 0;
  suggestedProbability = Math.max(0, Math.min(100, Math.round(suggestedProbability)));

  let nextBestAction = "Review deal details and update the next step";
  let followupSuggestion = "Schedule a follow-up within 2 days";
  let suggestedStage = stage;
  let suggestedStatus = status || "Open";

  if (order && stageKey !== "won") {
    nextBestAction = "Move this deal to Won and verify order/payment details";
    followupSuggestion = "Send confirmation and payment follow-up today";
    suggestedStage = "Won";
    suggestedStatus = "Won";
  } else if (quotation && !["proposal", "negotiation", "won", "lost"].includes(stageKey)) {
    nextBestAction = "Move deal to Proposal and follow up on quotation response";
    followupSuggestion = `Call or email by ${formatDate(addDays(new Date(), 1))}`;
    suggestedStage = "Proposal";
    suggestedStatus = "Quotation Sent";
  } else if (staleDays >= 7) {
    nextBestAction = "Contact customer and confirm buying interest";
    followupSuggestion = `Schedule reactivation follow-up for ${formatDate(addDays(new Date(), 1))}`;
  } else if (overdueClosingDays > 0) {
    nextBestAction = "Update expected closing date or mark the deal outcome";
    followupSuggestion = "Call today to confirm decision timeline";
  } else if (!hasOpenFollowup) {
    nextBestAction = "Create the next follow-up so this deal stays active";
    followupSuggestion = `Create follow-up for ${formatDate(addDays(new Date(), 2))}`;
  } else if (stageKey === "negotiation") {
    nextBestAction = "Confirm final commercial terms and ask for decision";
    followupSuggestion = "Send negotiation summary and call within 24 hours";
  } else if (stageKey === "qualified") {
    nextBestAction = "Prepare quotation or proposal for the customer";
    followupSuggestion = `Schedule proposal follow-up for ${formatDate(addDays(new Date(), 2))}`;
  }

  return {
    leadId: lead.id,
    companyName: lead.companyName || lead.customerPerson || "Lead",
    customerPerson: lead.customerPerson,
    currentStage: stage,
    currentStatus: status || "-",
    expectedAmount: amount,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    riskReasons: riskReasons.length ? riskReasons : ["Deal activity looks healthy"],
    nextBestAction,
    followupSuggestion,
    suggestedProbability,
    suggestedStage,
    suggestedStatus,
    staleDays,
    hasQuotation: Boolean(quotation),
    hasOrder: Boolean(order),
    hasOpenFollowup,
  };
};

const buildAiSuggestions = async (org_id) => {
  const leads = await Lead.findAll({
    where: { org_id },
    include: [{ model: Followup, as: "followups", required: false }],
    order: [["updatedAt", "DESC"]],
  });

  const suggestions = [];
  for (const lead of leads) {
    suggestions.push(await buildSuggestionForLead(lead));
  }

  const sortedSuggestions = suggestions.sort((a, b) => b.riskScore - a.riskScore || b.expectedAmount - a.expectedAmount);
  const highRisk = sortedSuggestions.filter((item) => item.riskLevel === "High").length;
  const mediumRisk = sortedSuggestions.filter((item) => item.riskLevel === "Medium").length;
  const nextActions = sortedSuggestions.filter((item) => item.nextBestAction).length;
  const probabilityChanges = sortedSuggestions.filter((item) => item.suggestedProbability !== (STAGE_BASE_PROBABILITY[item.currentStage.toLowerCase()] ?? 10)).length;

  return {
    generatedAt: new Date(),
    summary: {
      totalDeals: sortedSuggestions.length,
      highRisk,
      mediumRisk,
      nextActions,
      probabilityChanges,
    },
    suggestions: sortedSuggestions,
  };
};

module.exports = {
  buildAiSuggestions,
};
