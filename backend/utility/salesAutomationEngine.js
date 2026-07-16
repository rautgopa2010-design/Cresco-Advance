const { Op } = require("sequelize");
const db = require("../models");
const { createNotification, NOTIFICATION_TYPES } = require("./notificationHelper");

const Lead = db.lead;
const Followup = db.followup;
const Employee = db.employee;
const Notification = db.notification;
const Quotation = db.quotation;
const Order = db.order;

const OPEN_STAGE_KEYS = ["new", "qualified", "proposal", "negotiation"];
const STALE_DAYS = 7;

const parseAssignedTo = (assignedTo) => {
  if (!assignedTo) return [];
  if (Array.isArray(assignedTo)) return assignedTo.map(Number).filter(Boolean);
  try {
    return JSON.parse(assignedTo).map(Number).filter(Boolean);
  } catch {
    return [];
  }
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

const daysBetween = (from, to = new Date()) => {
  const first = dayStart(from);
  const second = dayStart(to);
  return Math.floor((second - first) / (1000 * 60 * 60 * 24));
};

const normalizeStage = (lead) => String(lead?.leadStage || "New").trim() || "New";

const isOpenDeal = (lead) => {
  const stage = normalizeStage(lead).toLowerCase();
  const status = String(lead?.leadStatus || "").toLowerCase();
  return OPEN_STAGE_KEYS.includes(stage) && !["won", "lost", "closed"].includes(status);
};

const numberValue = (value) => {
  const parsed = Number(String(value || 0).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getRecipientsForLead = async (lead) => {
  const employeeIds = parseAssignedTo(lead.assignedTo);
  if (employeeIds.length) {
    const employees = await Employee.findAll({
      where: { id: employeeIds, org_id: lead.org_id },
      attributes: ["user_id"],
      raw: true,
    });
    const userIds = employees.map((employee) => employee.user_id).filter(Boolean);
    if (userIds.length) return [...new Set(userIds)];
  }
  return [lead.user_id].filter(Boolean);
};

const hasRecentNotification = async ({ org_id, user_id, type, automationKey }) => {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const notifications = await Notification.findAll({
    where: {
      org_id,
      user_id,
      type,
      created_at: { [Op.gte]: since },
    },
    attributes: ["data"],
    raw: true,
  });
  return notifications.some((notification) => notification.data?.automationKey === automationKey);
};

const notifyLeadRecipients = async ({ lead, type, title, message, data }) => {
  const userIds = await getRecipientsForLead(lead);
  let created = 0;

  for (const user_id of userIds) {
    const automationKey = data.automationKey;
    const exists = await hasRecentNotification({ org_id: lead.org_id, user_id, type, automationKey });
    if (exists) continue;

    const notification = await createNotification({
      org_id: lead.org_id,
      user_id,
      type,
      title,
      message,
      data,
    });
    if (notification) created += 1;
  }

  return created;
};

const findQuotationForLead = async (lead) => {
  const criteria = [
    lead.email ? { email: lead.email } : null,
    lead.mobile ? { mobile: lead.mobile } : null,
    lead.companyName ? { companyName: lead.companyName } : null,
  ].filter(Boolean);
  if (!criteria.length) return null;

  return Quotation.findOne({
    where: {
      org_id: lead.org_id,
      [Op.or]: criteria,
    },
    order: [["createdAt", "DESC"]],
  });
};

const findOrderForLead = async (lead) => {
  const criteria = [
    lead.email ? { email: lead.email } : null,
    lead.mobile ? { mobile: lead.mobile } : null,
    lead.companyName ? { selectedCompany: lead.companyName } : null,
  ].filter(Boolean);
  if (!criteria.length) return null;

  return Order.findOne({
    where: {
      org_id: lead.org_id,
      [Op.or]: criteria,
    },
    order: [["createdAt", "DESC"]],
  });
};

const buildAutomationSummary = async (org_id) => {
  const today = dayStart();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const leads = await Lead.findAll({
    where: { org_id },
    include: [{ model: Followup, as: "followups", required: false }],
    order: [["updatedAt", "DESC"]],
  });

  const followupReminders = [];
  const staleDeals = [];
  const stageSuggestions = [];

  for (const lead of leads) {
    const followups = Array.isArray(lead.followups) ? lead.followups : [];
    const incompleteFollowups = followups.filter((followup) => !followup.isCompleted);

    for (const followup of incompleteFollowups) {
      const followupDate = parseDate(followup.nextFollowUpDate || followup.followup_date);
      if (!followupDate) continue;
      const diff = daysBetween(today, followupDate);
      if (diff >= 0 && diff <= 1) {
        followupReminders.push({
          leadId: lead.id,
          followupId: followup.id,
          companyName: lead.companyName || lead.customerPerson || "Lead",
          dueDate: followup.nextFollowUpDate || followup.followup_date,
          urgency: diff === 0 ? "Due today" : "Due tomorrow",
          assignedTo: parseAssignedTo(followup.assignedTo),
        });
      }
    }

    if (isOpenDeal(lead)) {
      const lastTouch = followups.length
        ? followups.reduce((latest, followup) => {
            const updated = parseDate(followup.updatedAt || followup.createdAt);
            return updated && updated > latest ? updated : latest;
          }, parseDate(lead.updatedAt || lead.createdAt))
        : parseDate(lead.updatedAt || lead.createdAt);
      const staleForDays = lastTouch ? daysBetween(lastTouch, today) : 0;
      if (staleForDays >= STALE_DAYS) {
        staleDeals.push({
          leadId: lead.id,
          companyName: lead.companyName || lead.customerPerson || "Lead",
          leadStage: normalizeStage(lead),
          expectedAmount: numberValue(lead.expectedAmount),
          staleForDays,
          lastActivity: lastTouch,
        });
      }
    }

    const stage = normalizeStage(lead).toLowerCase();
    const order = await findOrderForLead(lead);
    const quotation = order ? null : await findQuotationForLead(lead);
    if (order && stage !== "won") {
      stageSuggestions.push({
        leadId: lead.id,
        companyName: lead.companyName || lead.customerPerson || "Lead",
        currentStage: normalizeStage(lead),
        suggestedStage: "Won",
        suggestedStatus: "Won",
        reason: "An order exists for this customer.",
      });
    } else if (quotation && !["proposal", "negotiation", "won", "lost"].includes(stage)) {
      stageSuggestions.push({
        leadId: lead.id,
        companyName: lead.companyName || lead.customerPerson || "Lead",
        currentStage: normalizeStage(lead),
        suggestedStage: "Proposal",
        suggestedStatus: "Quotation Sent",
        reason: "A quotation exists for this customer.",
      });
    }
  }

  return {
    generatedAt: new Date(),
    rules: {
      followupReminderWindow: "Today and tomorrow",
      staleDealDays: STALE_DAYS,
      autoStageSignals: ["Quotation created", "Order created"],
    },
    summary: {
      followupReminders: followupReminders.length,
      staleDeals: staleDeals.length,
      stageSuggestions: stageSuggestions.length,
      activeAutomations: 4,
    },
    followupReminders,
    staleDeals,
    stageSuggestions,
  };
};

const runSalesAutomationForOrg = async (org_id) => {
  const summary = await buildAutomationSummary(org_id);
  let notificationsCreated = 0;

  const leadMap = new Map(
    (await Lead.findAll({ where: { org_id } })).map((lead) => [lead.id, lead])
  );

  for (const item of summary.staleDeals) {
    const lead = leadMap.get(item.leadId);
    if (!lead) continue;
    notificationsCreated += await notifyLeadRecipients({
      lead,
      type: NOTIFICATION_TYPES.STALE_DEAL_ALERT,
      title: "Stale deal needs attention",
      message: `${item.companyName} has had no activity for ${item.staleForDays} days.`,
      data: { ...item, automationKey: `stale-${item.leadId}` },
    });
  }

  for (const item of summary.stageSuggestions) {
    const lead = leadMap.get(item.leadId);
    if (!lead) continue;
    notificationsCreated += await notifyLeadRecipients({
      lead,
      type: NOTIFICATION_TYPES.AUTO_STAGE_SUGGESTION,
      title: "Stage update suggested",
      message: `${item.companyName} can move from ${item.currentStage} to ${item.suggestedStage}.`,
      data: { ...item, automationKey: `stage-${item.leadId}-${item.suggestedStage}` },
    });
  }

  for (const item of summary.followupReminders) {
    const lead = leadMap.get(item.leadId);
    if (!lead) continue;
    notificationsCreated += await notifyLeadRecipients({
      lead,
      type: NOTIFICATION_TYPES.FOLLOWUP_REMINDER,
      title: "Follow-up reminder",
      message: `${item.companyName} follow-up is ${item.urgency.toLowerCase()}.`,
      data: { ...item, automationKey: `followup-${item.followupId}-${item.dueDate}` },
    });
  }

  return { ...summary, notificationsCreated };
};

const runSalesAutomationForAllOrgs = async () => {
  const orgRows = await Lead.findAll({
    attributes: ["org_id"],
    group: ["org_id"],
    raw: true,
  });

  const results = [];
  for (const row of orgRows) {
    if (!row.org_id) continue;
    results.push(await runSalesAutomationForOrg(row.org_id));
  }
  return results;
};

module.exports = {
  buildAutomationSummary,
  runSalesAutomationForOrg,
  runSalesAutomationForAllOrgs,
};
