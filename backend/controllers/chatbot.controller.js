const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const db = require("../models");
const { Op } = require("sequelize");
const validator = require("validator");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { writeAudit } = require("../utility/chatbotAuthorization");

const clean = (value) => String(value || "").trim();
const isHexColor = (value) => /^#[0-9a-fA-F]{6}$/.test(clean(value));

const defaultActionCards = [
  { id: "ask_ai", label: "Ask Our AI Assistant", enabled: true, sortOrder: 1 },
  { id: "request_demo", label: "Request a Demo", enabled: true, sortOrder: 2 },
  { id: "send_enquiry", label: "Send an Enquiry", enabled: true, sortOrder: 3 },
  { id: "contact_team", label: "Contact Our Team", enabled: true, sortOrder: 4 },
];

const defaultLeadFields = [
  { key: "name", label: "Name", enabled: true, required: true },
  { key: "phone", label: "Phone", enabled: true, required: true },
  { key: "email", label: "Email", enabled: true, required: false },
  { key: "companyName", label: "Company name", enabled: true, required: false },
  { key: "interestedProduct", label: "Interested product/service", enabled: true, required: false },
  { key: "requirement", label: "Requirement", enabled: true, required: true },
  { key: "preferredContactTime", label: "Preferred contact time", enabled: true, required: false },
];

const normalizeDomain = (value) =>
  clean(value)
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

const summarize = (text) => clean(text).replace(/\s+/g, " ").slice(0, 450);
const escapeHtml = (value) =>
  clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ensureSetupRows = async (org_id) => {
  const [configuration] = await db.chatbotConfiguration.findOrCreate({
    where: { org_id },
    defaults: {
      org_id,
      actionCards: defaultActionCards,
      visibleContactFields: ["businessName", "phone", "email", "businessHours"],
      contactInfo: {},
    },
  });
  const [leadForm] = await db.chatbotLeadForm.findOrCreate({
    where: { org_id },
    defaults: { org_id, fields: defaultLeadFields },
  });
  return { configuration, leadForm };
};

const validateConfiguration = ({ configuration, leadForm, domains, knowledgeSources, faqs }) => {
  const issues = [];
  if (!clean(configuration.chatbotName)) issues.push("Chatbot name is required.");
  if (!clean(configuration.greeting)) issues.push("Greeting is required.");
  ["primaryColor", "secondaryColor", "headerBackground", "textColor", "buttonColor"].forEach((field) => {
    if (!isHexColor(configuration[field])) issues.push(`${field} must be a valid hex colour.`);
  });
  const activeLeadFields = (leadForm.fields || []).filter((item) => item.enabled);
  if (!activeLeadFields.some((item) => item.key === "name" && item.required)) issues.push("Lead form must require visitor name.");
  if (!activeLeadFields.some((item) => ["phone", "email"].includes(item.key) && item.required)) issues.push("Lead form must require phone or email.");
  if (!domains.length) issues.push("Add at least one allowed website domain before installing the widget.");
  if (!knowledgeSources.length && !faqs.length) issues.push("Add at least one active FAQ or knowledge source.");
  return issues;
};

const extractDocumentText = async (file) => {
  const absolutePath = file.path;
  if (file.mimetype === "text/plain") {
    return fs.readFileSync(absolutePath, "utf8");
  }
  const buffer = fs.readFileSync(absolutePath);
  const roughText = buffer.toString("utf8").replace(/[^\x20-\x7E\r\n\t]+/g, " ");
  return roughText.length > 200 ? roughText : "Document uploaded. Full semantic indexing will run in the AI answering phase.";
};

const validateSafeUrl = (value) => {
  const url = clean(value);
  if (!validator.isURL(url, { protocols: ["http", "https"], require_protocol: true })) {
    throw new Error("Enter a valid http or https URL.");
  }
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    throw new Error("Private or local URLs are not allowed.");
  }
  return parsed.toString();
};

const processUrl = async (url) => {
  const safeUrl = validateSafeUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(safeUrl, {
      signal: controller.signal,
      headers: { "user-agent": "CrescosoftChatbotIndexer/1.0" },
    });
    if (!response.ok) throw new Error(`URL returned ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("Only public HTML or text URLs can be processed in Phase 3.");
    }
    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 30000);
    if (text.length < 50) throw new Error("URL did not contain enough readable content.");
    return { url: safeUrl, text };
  } finally {
    clearTimeout(timeout);
  }
};

const getRequestDomain = (req) => {
  const origin = clean(req.headers.origin);
  const referer = clean(req.headers.referer || req.headers.referrer);
  const source = origin || referer;
  if (!source) return "";
  try {
    return new URL(source).hostname.toLowerCase();
  } catch {
    return normalizeDomain(source);
  }
};

const findWidgetContext = async (req, widgetIdentifier) => {
  const widget = await db.chatbotWidget.findOne({ where: { widgetIdentifier, status: "active" } });
  if (!widget) {
    const error = new Error("Widget is not active.");
    error.statusCode = 404;
    throw error;
  }
  const domain = getRequestDomain(req);
  const allowedDomains = await db.chatbotAllowedDomain.findAll({
    where: { org_id: widget.org_id, isActive: true },
  });
  const allowed = allowedDomains.some((item) => {
    const allowedDomain = normalizeDomain(item.domain);
    return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`);
  });
  if (!allowed) {
    const error = new Error("This domain is not allowed to load the chatbot widget.");
    error.statusCode = 403;
    error.metadata = { domain };
    throw error;
  }
  const entitlement = await db.chatbotEntitlement.findOne({ where: { org_id: widget.org_id } });
  const expired = entitlement?.expiresAt && new Date(entitlement.expiresAt) < new Date();
  if (!entitlement || !["trial", "active"].includes(entitlement.status) || expired) {
    const error = new Error("Website AI Chatbot is not active for this organization.");
    error.statusCode = 402;
    throw error;
  }
  await widget.update({ lastUsedAt: new Date() });
  return { widget, domain, entitlement };
};

const activeWidgetPayload = async (org_id) => {
  const [configuration, leadForm, faqs, knowledgeSources, domains, widget] = await Promise.all([
    db.chatbotConfiguration.findOne({ where: { org_id } }),
    db.chatbotLeadForm.findOne({ where: { org_id } }),
    db.chatbotFaq.findAll({ where: { org_id, status: "Active" }, order: [["sortOrder", "ASC"], ["updatedAt", "DESC"]] }),
    db.chatbotKnowledgeSource.findAll({ where: { org_id, status: "Active" }, order: [["updatedAt", "DESC"]] }),
    db.chatbotAllowedDomain.findAll({ where: { org_id, isActive: true }, order: [["createdAt", "DESC"]] }),
    db.chatbotWidget.findOne({ where: { org_id, status: "active" } }),
  ]);
  return { configuration, leadForm, faqs, knowledgeSources, domains, widget };
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "you",
  "your",
  "with",
  "what",
  "how",
  "can",
  "are",
  "our",
  "about",
  "that",
  "this",
  "from",
  "have",
  "does",
  "please",
]);

const SAFETY_PATTERNS = [
  /ignore (all )?(previous|prior) instructions/i,
  /system prompt/i,
  /developer message/i,
  /api key|secret|credential|password|token/i,
  /another organization|other organization|other tenant|different tenant/i,
  /database|sql|table schema/i,
];

const ENQUIRY_INTENT_PATTERNS = [
  /enquir|inquir/i,
  /book.*demo|schedule.*demo|request.*demo/i,
  /contact.*sales|talk.*sales|sales.*call/i,
  /call me|contact me|get in touch/i,
  /quotation|quote|pricing|price/i,
  /interested|buy|purchase/i,
];

const tokenizeQuestion = (value) =>
  clean(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const relevantExcerpt = (text, words, limit = 420) => {
  const cleaned = clean(text).replace(/\s+/g, " ");
  if (!cleaned) return "";
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const ranked = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: words.reduce((count, word) => count + (sentence.toLowerCase().includes(word) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = ranked.filter((item) => item.score > 0).slice(0, 3);
  const excerpt = (selected.length ? selected : ranked.slice(0, 2))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence)
    .join(" ");
  return excerpt.slice(0, limit);
};

const makeGroundedAnswer = ({ excerpt, sourceTitle, confidence }) => {
  if (confidence < 45 || !excerpt) {
    return "I do not have enough approved information to answer that confidently. Please send an enquiry or contact the team for help.";
  }
  return `Based on approved information from ${sourceTitle}: ${excerpt}`;
};

const answerFromKnowledge = ({ question, faqs, knowledgeSources }) => {
  if (SAFETY_PATTERNS.some((pattern) => pattern.test(question))) {
    return {
      answer: "I can only answer from this organization's approved public knowledge. I cannot share internal instructions, credentials, private data or another organization's information.",
      confidence: 15,
      references: [],
      grounded: true,
      lowConfidence: true,
      safetyBlocked: true,
    };
  }
  const words = tokenizeQuestion(question);
  if (!words.length) {
    return {
      answer: "Please ask a specific question about this organization's products, services, pricing, demo, support or contact details.",
      confidence: 20,
      references: [],
      grounded: true,
      lowConfidence: true,
    };
  }
  const scoreText = (text) => words.reduce((score, word) => score + (String(text || "").toLowerCase().includes(word) ? 1 : 0), 0);
  const faqMatches = faqs
    .map((faq) => ({
      id: faq.id,
      type: "FAQ",
      title: faq.question,
      sourceText: faq.answer,
      score: scoreText(`${faq.question} ${faq.answer}`),
    }))
    .sort((a, b) => b.score - a.score);
  if (faqMatches[0]?.score >= 2) {
    const excerpt = relevantExcerpt(faqMatches[0].sourceText, words, 600);
    const confidence = Math.min(95, 58 + faqMatches[0].score * 8);
    return {
      answer: makeGroundedAnswer({ excerpt, sourceTitle: faqMatches[0].title, confidence }),
      confidence,
      references: [{ id: faqMatches[0].id, type: "FAQ", title: faqMatches[0].title }],
      grounded: true,
      lowConfidence: false,
    };
  }
  const sourceMatches = knowledgeSources
    .map((source) => ({
      id: source.id,
      type: source.sourceType,
      title: source.title,
      sourceText: source.contentText || source.processedSummary,
      score: scoreText(`${source.title} ${source.contentText} ${source.processedSummary}`),
    }))
    .sort((a, b) => b.score - a.score);
  if (sourceMatches[0]?.score >= 2) {
    const excerpt = relevantExcerpt(sourceMatches[0].sourceText, words, 520);
    const confidence = Math.min(88, 48 + sourceMatches[0].score * 8);
    return {
      answer: makeGroundedAnswer({ excerpt, sourceTitle: sourceMatches[0].title, confidence }),
      confidence,
      references: [{ id: sourceMatches[0].id, type: sourceMatches[0].type, title: sourceMatches[0].title }],
      grounded: true,
      lowConfidence: confidence < 50,
    };
  }
  return {
    answer: "I do not have enough approved information to answer that confidently. Please send an enquiry or contact the team for help.",
    confidence: 20,
    references: [],
    grounded: true,
    lowConfidence: true,
  };
};

const writeUsage = async ({ org_id, conversationId, entryType, reason, quantity = 1 }) =>
  db.chatbotUsageLedger.create({
    org_id,
    conversationId,
    entryType,
    quantity,
    direction: "debit",
    lifecycle: "consumed",
    reason,
    idempotencyKey: `chatbot-${entryType}-${conversationId || "none"}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
  });

const getWidgetUsageTotals = async (org_id) => {
  const rows = await db.chatbotUsageLedger.findAll({
    where: {
      org_id,
      lifecycle: { [Op.in]: ["consumed", "released", "refunded"] },
    },
  });
  return rows.reduce((acc, row) => {
    const multiplier = row.direction === "credit" ? -1 : 1;
    acc[row.entryType] = (acc[row.entryType] || 0) + Number(row.quantity || 0) * multiplier;
    return acc;
  }, {});
};

const ensurePublicMessageCapacity = async ({ entitlement, widget, sessionKey, checkAiMessages = true }) => {
  const usage = await getWidgetUsageTotals(entitlement.org_id);
  const aiMessageLimit = Number(entitlement.monthlyAiMessageLimit || 0) + Number(entitlement.extraAiMessagePacks || 0);
  if (checkAiMessages && aiMessageLimit > 0 && Number(usage.ai_message || 0) >= aiMessageLimit) {
    const error = new Error("Website AI Chatbot message limit is exhausted for this organization.");
    error.statusCode = 429;
    throw error;
  }
  const conversationLimit = Number(entitlement.monthlyConversationLimit || 0) + Number(entitlement.extraConversationPacks || 0);
  if (conversationLimit > 0 && Number(usage.conversation || 0) >= conversationLimit) {
    const existingConversation = clean(sessionKey)
      ? await db.chatbotConversation.findOne({ where: { org_id: widget.org_id, sessionKey: clean(sessionKey) } })
      : null;
    if (!existingConversation) {
      const error = new Error("Website AI Chatbot conversation limit is exhausted for this organization.");
      error.statusCode = 429;
      throw error;
    }
  }
};

const analyticsForOrg = async (org_id) => {
  const [conversations, supportRequests, chatbotEnquiries, recentMessages, usageRows] = await Promise.all([
    db.chatbotConversation.findAll({
      where: { org_id },
      order: [["updatedAt", "DESC"]],
      limit: 20,
    }),
    db.chatbotSupportRequest.findAll({
      where: { org_id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    }),
    db.customer.findAll({
      where: { org_id, leadSource: "Website AI Chatbot" },
      order: [["createdAt", "DESC"]],
      limit: 20,
      attributes: ["id", "firstName", "lastName", "mobile", "email", "companyName", "chatbotConversationId", "createdAt"],
    }),
    db.chatbotMessage.findAll({
      where: { org_id },
      order: [["createdAt", "DESC"]],
      limit: 50,
      attributes: ["id", "conversationId", "senderType", "confidence", "createdAt"],
    }),
    db.chatbotUsageLedger.findAll({
      where: { org_id },
      order: [["createdAt", "DESC"]],
      limit: 100,
    }),
  ]);
  const byStatus = conversations.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const aiMessages = recentMessages.filter((item) => item.senderType === "ai");
  const confidenceValues = aiMessages.map((item) => Number(item.confidence || 0)).filter((value) => value > 0);
  const averageConfidence = confidenceValues.length
    ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
    : 0;
  return {
    totals: {
      recentConversations: conversations.length,
      supportRequests: supportRequests.length,
      chatbotEnquiries: chatbotEnquiries.length,
      handovers: conversations.filter((item) => ["Waiting for Agent", "Assigned", "Agent Active"].includes(item.status)).length,
      averageConfidence,
    },
    byStatus,
    recentConversations: conversations.map((item) => ({
      id: item.id,
      status: item.status,
      visitorName: item.visitorName,
      visitorEmail: item.visitorEmail,
      visitorPhone: item.visitorPhone,
      enquiryId: item.enquiryId,
      assignedTo: item.assignedTo,
      sourceDomain: item.sourceDomain,
      updatedAt: item.updatedAt,
    })),
    recentSupportRequests: supportRequests,
    recentEnquiries: chatbotEnquiries,
    recentUsage: usageRows,
  };
};

const hasEnquiryIntent = (message) => ENQUIRY_INTENT_PATTERNS.some((pattern) => pattern.test(clean(message)));

const splitVisitorName = (name) => {
  const parts = clean(name || "Website Visitor").split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Website",
    lastName: parts.slice(1).join(" ") || "Visitor",
  };
};

const findAssignmentTarget = async (org_id) => {
  const employee = await db.employee.findOne({
    where: { org_id, isDeleted: false },
    order: [["id", "ASC"]],
  });
  if (employee) {
    return {
      userId: employee.user_id,
      assignedTo: employee.id,
      roleId: employee.role_id,
    };
  }
  const user = await db.users.findOne({
    where: { org_id, isDeleted: false },
    order: [["id", "ASC"]],
  });
  return {
    userId: user?.id || 1,
    assignedTo: user?.id || 1,
    roleId: user?.role_id || null,
  };
};

const findOrCreatePublicConversation = async ({ widget, domain, sessionKey, conversationId, transaction }) => {
  if (conversationId) {
    const existing = await db.chatbotConversation.findOne({
      where: { id: conversationId, org_id: widget.org_id },
      transaction,
    });
    if (existing) return { conversation: existing, createdConversation: false };
  }
  const normalizedSessionKey = clean(sessionKey) || `session-${crypto.randomBytes(8).toString("hex")}`;
  const [conversation, createdConversation] = await db.chatbotConversation.findOrCreate({
    where: { org_id: widget.org_id, sessionKey: normalizedSessionKey },
    defaults: { org_id: widget.org_id, widgetId: widget.id, sessionKey: normalizedSessionKey, sourceDomain: domain },
    transaction,
  });
  return { conversation, createdConversation };
};

const createOrLinkChatbotEnquiry = async ({ widget, domain, body }) => {
  const name = clean(body.name);
  const phone = clean(body.phone);
  const email = clean(body.email).toLowerCase();
  const requirement = clean(body.requirement || body.description);
  const consentAccepted = body.consentAccepted === true || body.consentAccepted === "true";
  if (!consentAccepted) {
    const error = new Error("Consent is required before creating an enquiry.");
    error.statusCode = 400;
    throw error;
  }
  if (!name || !phone || !requirement) {
    const error = new Error("Name, phone and requirement are required.");
    error.statusCode = 400;
    throw error;
  }

  return db.sequelize.transaction(async (transaction) => {
    const { conversation, createdConversation } = await findOrCreatePublicConversation({
      widget,
      domain,
      sessionKey: body.sessionKey,
      conversationId: body.conversationId,
      transaction,
    });
    const assignment = await findAssignmentTarget(widget.org_id);
    const duplicateWhere = [{ org_id: widget.org_id, mobile: phone }];
    if (email) duplicateWhere.push({ org_id: widget.org_id, email });
    const duplicate = await db.customer.findOne({ where: { [Op.or]: duplicateWhere }, transaction });
    if (duplicate) {
      await conversation.update(
        {
          visitorName: name,
          visitorEmail: email || null,
          visitorPhone: phone,
          enquiryId: duplicate.id,
          assignedTo: assignment.assignedTo,
          status: "Assigned",
          handoverReason: "Existing enquiry linked from chatbot",
          consentAcceptedAt: new Date(),
        },
        { transaction }
      );
      await db.chatbotMessage.create(
        {
          org_id: widget.org_id,
          conversationId: conversation.id,
          senderType: "system",
          message: `Existing enquiry #${duplicate.id} linked from chatbot visitor consent.`,
        },
        { transaction }
      );
      return { enquiry: duplicate, conversation, createdConversation, reused: true, assignment };
    }

    const { firstName, lastName } = splitVisitorName(name);
    const enquiry = await db.customer.create(
      {
        org_id: widget.org_id,
        user_id: assignment.userId,
        salutation: null,
        firstName,
        middleName: null,
        lastName,
        mobile: phone,
        email: email || null,
        customerCategory: "Website Enquiry",
        industry: clean(body.industry) || null,
        designation: clean(body.designation) || null,
        leadSource: "Website AI Chatbot",
        companyName: clean(body.companyName) || null,
        gstinNo: null,
        billingStreet: "Website AI Chatbot",
        billingCity: "Not Provided",
        billingState: "Not Provided",
        billingPincode: "000000",
        billingCountry: "Not Provided",
        shippingStreet: "Website AI Chatbot",
        shippingCity: "Not Provided",
        shippingState: "Not Provided",
        shippingPincode: "000000",
        shippingCountry: "Not Provided",
        assignedTo: [assignment.assignedTo],
        assignedRoleIds: assignment.roleId ? [assignment.roleId] : [],
        chatbotConversationId: conversation.id,
        chatbotRequirement: requirement,
        chatbotConsentAcceptedAt: new Date(),
      },
      { transaction }
    );
    await conversation.update(
      {
        visitorName: name,
        visitorEmail: email || null,
        visitorPhone: phone,
        enquiryId: enquiry.id,
        assignedTo: assignment.assignedTo,
        status: "Assigned",
        handoverReason: "Enquiry captured from chatbot",
        consentAcceptedAt: new Date(),
      },
      { transaction }
    );
    await db.chatbotMessage.bulkCreate(
      [
        {
          org_id: widget.org_id,
          conversationId: conversation.id,
          senderType: "visitor",
          message: `Enquiry submitted. Name: ${name}; Phone: ${phone}; Email: ${email || "-"}; Company: ${clean(body.companyName) || "-"}; Requirement: ${requirement}`,
        },
        {
          org_id: widget.org_id,
          conversationId: conversation.id,
          senderType: "system",
          message: `CRM enquiry #${enquiry.id} created and assigned to support team.`,
        },
      ],
      { transaction }
    );
    return { enquiry, conversation, createdConversation, reused: false, assignment };
  });
};

exports.getSummary = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const { configuration, leadForm } = await ensureSetupRows(org_id);
    const [domains, knowledgeSources, faqs] = await Promise.all([
      db.chatbotAllowedDomain.findAll({ where: { org_id }, order: [["createdAt", "DESC"]] }),
      db.chatbotKnowledgeSource.findAll({ where: { org_id, status: { [Op.ne]: "Archived" } }, order: [["updatedAt", "DESC"]] }),
      db.chatbotFaq.findAll({ where: { org_id, status: { [Op.ne]: "Archived" } }, order: [["sortOrder", "ASC"], ["updatedAt", "DESC"]] }),
    ]);
    let [widget] = await db.chatbotWidget.findOrCreate({
      where: { org_id },
      defaults: {
        org_id,
        widgetIdentifier: `cw_${crypto.randomBytes(18).toString("hex")}`,
        status: "active",
      },
    });
    const activeKnowledgeSources = knowledgeSources.filter((item) => item.status === "Active");
    const activeFaqs = faqs.filter((item) => item.status === "Active");
    const validationIssues = validateConfiguration({
      configuration,
      leadForm,
      domains: domains.filter((item) => item.isActive),
      knowledgeSources: activeKnowledgeSources,
      faqs: activeFaqs,
    });
    if (JSON.stringify(configuration.validationIssues || []) !== JSON.stringify(validationIssues)) {
      await configuration.update({ validationIssues, isConfigured: validationIssues.length === 0 });
    }
    res.json({
      entitlement: req.chatbotEntitlement,
      usage: req.chatbotUsage.usage,
      limits: req.chatbotUsage.limits,
      status: req.chatbotUsage.status,
      active: req.chatbotUsage.active,
      exhausted: req.chatbotUsage.exhausted,
      reason: req.chatbotUsage.reason,
      configuration: await db.chatbotConfiguration.findOne({ where: { org_id } }),
      leadForm,
      domains,
      widget,
      installScript: `<script src="${req.protocol}://${req.get("host")}/chatbot/widget.js" data-widget-id="${widget.widgetIdentifier}" async></script>`,
      knowledgeSources,
      faqs,
      analytics: await analyticsForOrg(org_id),
      validationIssues,
      phase: "phase-7-analytics-security-final-qa",
      message: "Website AI Chatbot setup is enabled for this organization.",
    });
  } catch (error) {
    console.error("Get chatbot summary error:", error);
    return sendErrorResponse(res, 500, "Failed to load Website AI Chatbot summary.");
  }
};

exports.updateConfiguration = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const { configuration } = await ensureSetupRows(org_id);
    const payload = {
      chatbotName: clean(req.body.chatbotName) || configuration.chatbotName,
      greeting: clean(req.body.greeting) || configuration.greeting,
      subtitle: clean(req.body.subtitle) || configuration.subtitle,
      primaryColor: clean(req.body.primaryColor) || configuration.primaryColor,
      secondaryColor: clean(req.body.secondaryColor) || configuration.secondaryColor,
      headerBackground: clean(req.body.headerBackground) || configuration.headerBackground,
      textColor: clean(req.body.textColor) || configuration.textColor,
      buttonColor: clean(req.body.buttonColor) || configuration.buttonColor,
      widgetPosition: ["left", "right"].includes(req.body.widgetPosition) ? req.body.widgetPosition : configuration.widgetPosition,
      borderRadius: Math.min(28, Math.max(8, Number(req.body.borderRadius || configuration.borderRadius))),
      styleMode: ["light", "dark"].includes(req.body.styleMode) ? req.body.styleMode : configuration.styleMode,
      onlineText: clean(req.body.onlineText) || configuration.onlineText,
      offlineText: clean(req.body.offlineText) || configuration.offlineText,
      actionCards: Array.isArray(req.body.actionCards) ? req.body.actionCards : configuration.actionCards,
      visibleContactFields: Array.isArray(req.body.visibleContactFields) ? req.body.visibleContactFields : configuration.visibleContactFields,
      contactInfo: req.body.contactInfo && typeof req.body.contactInfo === "object" ? req.body.contactInfo : configuration.contactInfo,
      responseTone: clean(req.body.responseTone) || configuration.responseTone,
      responseLanguage: clean(req.body.responseLanguage) || configuration.responseLanguage,
      medicalDisclaimer: clean(req.body.medicalDisclaimer) || null,
    };
    const colorIssues = ["primaryColor", "secondaryColor", "headerBackground", "textColor", "buttonColor"].filter((key) => !isHexColor(payload[key]));
    if (colorIssues.length) return sendErrorResponse(res, 400, `Invalid colour values: ${colorIssues.join(", ")}`);
    await configuration.update(payload);
    await writeAudit({ req, org_id, action: "chatbot.configuration.updated", entityType: "chatbot_configuration", entityId: configuration.id });
    res.json({ message: "Chatbot appearance and settings saved.", configuration });
  } catch (error) {
    console.error("Update chatbot configuration error:", error);
    return sendErrorResponse(res, 500, "Failed to save chatbot configuration.");
  }
};

exports.updateLeadForm = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const { leadForm } = await ensureSetupRows(org_id);
    const fields = Array.isArray(req.body.fields) ? req.body.fields : leadForm.fields;
    if (!fields.some((item) => item.key === "name" && item.enabled && item.required)) {
      return sendErrorResponse(res, 400, "Name must stay enabled and required.");
    }
    if (!fields.some((item) => ["phone", "email"].includes(item.key) && item.enabled && item.required)) {
      return sendErrorResponse(res, 400, "Phone or email must be required.");
    }
    await leadForm.update({
      fields,
      requireConsent: req.body.requireConsent !== false,
      consentText: clean(req.body.consentText) || leadForm.consentText,
      duplicateCheckEnabled: req.body.duplicateCheckEnabled !== false,
    });
    await writeAudit({ req, org_id, action: "chatbot.lead_form.updated", entityType: "chatbot_lead_form", entityId: leadForm.id });
    res.json({ message: "Chatbot lead form saved.", leadForm });
  } catch (error) {
    console.error("Update chatbot lead form error:", error);
    return sendErrorResponse(res, 500, "Failed to save chatbot lead form.");
  }
};

exports.addDomain = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const domain = normalizeDomain(req.body.domain);
    if (!validator.isFQDN(domain)) return sendErrorResponse(res, 400, "Enter a valid domain name.");
    const existingCount = await db.chatbotAllowedDomain.count({ where: { org_id, isActive: true } });
    const limit = Number(req.chatbotUsage.limits.domain || 0);
    if (limit > 0 && existingCount >= limit) return sendErrorResponse(res, 429, "Allowed domain limit is exhausted.");
    const [row, created] = await db.chatbotAllowedDomain.findOrCreate({
      where: { org_id, domain },
      defaults: { org_id, domain, verifiedAt: new Date() },
    });
    const reactivated = !row.isActive;
    if (reactivated) await row.update({ isActive: true, verifiedAt: new Date() });
    if (created || reactivated) await writeUsage({ org_id, entryType: "domain", reason: "allowed_domain_added" });
    await writeAudit({ req, org_id, action: "chatbot.domain.added", entityType: "chatbot_allowed_domain", entityId: row.id, metadata: { domain } });
    res.status(201).json({ message: "Allowed domain saved.", domain: row });
  } catch (error) {
    console.error("Add chatbot domain error:", error);
    return sendErrorResponse(res, 500, "Failed to save allowed domain.");
  }
};

exports.archiveDomain = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const row = await db.chatbotAllowedDomain.findOne({ where: { org_id, id: req.params.id } });
    if (!row) return sendErrorResponse(res, 404, "Domain not found.");
    await row.update({ isActive: false });
    await writeAudit({ req, org_id, action: "chatbot.domain.archived", entityType: "chatbot_allowed_domain", entityId: row.id });
    res.json({ message: "Allowed domain removed.", domain: row });
  } catch (error) {
    console.error("Archive chatbot domain error:", error);
    return sendErrorResponse(res, 500, "Failed to remove allowed domain.");
  }
};

exports.createFaq = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    if (!clean(req.body.question) || !clean(req.body.answer)) return sendErrorResponse(res, 400, "Question and answer are required.");
    const faq = await db.chatbotFaq.create({
      org_id,
      question: clean(req.body.question),
      answer: clean(req.body.answer),
      category: clean(req.body.category) || null,
      language: clean(req.body.language) || "English",
      status: req.body.status || "Active",
      sortOrder: Number(req.body.sortOrder || 0),
      createdBy: req.user.id,
    });
    await writeAudit({ req, org_id, action: "chatbot.faq.created", entityType: "chatbot_faq", entityId: faq.id });
    res.status(201).json({ message: "FAQ saved.", faq });
  } catch (error) {
    console.error("Create chatbot FAQ error:", error);
    return sendErrorResponse(res, 500, "Failed to save FAQ.");
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const faq = await db.chatbotFaq.findOne({ where: { org_id, id: req.params.id } });
    if (!faq) return sendErrorResponse(res, 404, "FAQ not found.");
    await faq.update({
      question: clean(req.body.question) || faq.question,
      answer: clean(req.body.answer) || faq.answer,
      category: clean(req.body.category) || null,
      language: clean(req.body.language) || faq.language,
      status: req.body.status || faq.status,
      sortOrder: Number(req.body.sortOrder ?? faq.sortOrder),
    });
    await writeAudit({ req, org_id, action: "chatbot.faq.updated", entityType: "chatbot_faq", entityId: faq.id });
    res.json({ message: "FAQ updated.", faq });
  } catch (error) {
    console.error("Update chatbot FAQ error:", error);
    return sendErrorResponse(res, 500, "Failed to update FAQ.");
  }
};

exports.archiveFaq = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const faq = await db.chatbotFaq.findOne({ where: { org_id, id: req.params.id } });
    if (!faq) return sendErrorResponse(res, 404, "FAQ not found.");
    await faq.update({ status: "Archived" });
    await writeAudit({ req, org_id, action: "chatbot.faq.archived", entityType: "chatbot_faq", entityId: faq.id });
    res.json({ message: "FAQ archived.", faq });
  } catch (error) {
    console.error("Archive chatbot FAQ error:", error);
    return sendErrorResponse(res, 500, "Failed to archive FAQ.");
  }
};

exports.createTextKnowledge = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    if (!clean(req.body.title) || !clean(req.body.contentText)) return sendErrorResponse(res, 400, "Title and content are required.");
    const activeCount = await db.chatbotKnowledgeSource.count({ where: { org_id, status: { [Op.ne]: "Archived" } } });
    const limit = Number(req.chatbotUsage.limits.knowledge_source || 0);
    if (limit > 0 && activeCount >= limit) return sendErrorResponse(res, 429, "Knowledge source limit is exhausted.");
    const source = await db.chatbotKnowledgeSource.create({
      org_id,
      title: clean(req.body.title),
      sourceType: "manual_text",
      status: req.body.status || "Active",
      language: clean(req.body.language) || "English",
      contentText: clean(req.body.contentText),
      processedSummary: summarize(req.body.contentText),
      createdBy: req.user.id,
      lastIndexedAt: new Date(),
    });
    await writeUsage({ org_id, entryType: "knowledge_source", reason: "manual_text_created" });
    await writeAudit({ req, org_id, action: "chatbot.knowledge.created", entityType: "chatbot_knowledge_source", entityId: source.id });
    res.status(201).json({ message: "Knowledge source saved.", source });
  } catch (error) {
    console.error("Create chatbot knowledge error:", error);
    return sendErrorResponse(res, 500, "Failed to save knowledge source.");
  }
};

exports.uploadDocumentKnowledge = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    if (!req.file) return sendErrorResponse(res, 400, "Document file is required.");
    const activeCount = await db.chatbotKnowledgeSource.count({ where: { org_id, status: { [Op.ne]: "Archived" } } });
    const limit = Number(req.chatbotUsage.limits.knowledge_source || 0);
    if (limit > 0 && activeCount >= limit) return sendErrorResponse(res, 429, "Knowledge source limit is exhausted.");
    const relativePath = `/uploads/chatbot-knowledge/${path.basename(req.file.path)}`;
    const duplicate = await db.chatbotKnowledgeSource.findOne({
      where: { org_id, fileName: req.file.originalname, fileSize: req.file.size, status: { [Op.ne]: "Archived" } },
    });
    if (duplicate) return sendErrorResponse(res, 409, "This document already exists in the chatbot knowledge base.");

    let contentText = "";
    let status = "Active";
    let errorDetails = null;
    try {
      contentText = await extractDocumentText(req.file);
      if (!clean(contentText)) throw new Error("Document does not contain readable text.");
    } catch (error) {
      status = "Failed";
      errorDetails = error.message;
    }
    const source = await db.chatbotKnowledgeSource.create({
      org_id,
      title: clean(req.body.title) || req.file.originalname,
      sourceType: "document",
      status,
      language: clean(req.body.language) || "English",
      filePath: relativePath,
      fileName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSize: req.file.size,
      contentText,
      processedSummary: contentText ? summarize(contentText) : null,
      errorDetails,
      createdBy: req.user.id,
      lastIndexedAt: status === "Active" ? new Date() : null,
    });
    if (status === "Active") {
      await writeUsage({ org_id, entryType: "knowledge_source", reason: "document_knowledge_created" });
      await writeUsage({
        org_id,
        entryType: "document_storage_mb",
        quantity: Math.max(1, Math.ceil(Number(req.file.size || 0) / (1024 * 1024))),
        reason: "document_uploaded",
      });
    }
    await writeAudit({ req, org_id, action: "chatbot.knowledge.document_uploaded", entityType: "chatbot_knowledge_source", entityId: source.id, metadata: { status } });
    res.status(201).json({ message: status === "Active" ? "Document processed." : "Document stored but processing failed.", source });
  } catch (error) {
    console.error("Upload chatbot document error:", error);
    return sendErrorResponse(res, 500, "Failed to upload chatbot document.");
  }
};

exports.createUrlKnowledge = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const activeCount = await db.chatbotKnowledgeSource.count({ where: { org_id, status: { [Op.ne]: "Archived" } } });
    const limit = Number(req.chatbotUsage.limits.knowledge_source || 0);
    if (limit > 0 && activeCount >= limit) return sendErrorResponse(res, 429, "Knowledge source limit is exhausted.");
    const processed = await processUrl(req.body.url);
    const source = await db.chatbotKnowledgeSource.create({
      org_id,
      title: clean(req.body.title) || processed.url,
      sourceType: "url",
      status: "Active",
      language: clean(req.body.language) || "English",
      url: processed.url,
      contentText: processed.text,
      processedSummary: summarize(processed.text),
      createdBy: req.user.id,
      lastIndexedAt: new Date(),
    });
    await writeUsage({ org_id, entryType: "knowledge_source", reason: "url_knowledge_created" });
    await writeAudit({ req, org_id, action: "chatbot.knowledge.url_processed", entityType: "chatbot_knowledge_source", entityId: source.id, metadata: { url: processed.url } });
    res.status(201).json({ message: "URL processed.", source });
  } catch (error) {
    console.error("Process chatbot URL error:", error);
    return sendErrorResponse(res, 400, error.message || "Failed to process URL.");
  }
};

exports.archiveKnowledge = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const source = await db.chatbotKnowledgeSource.findOne({ where: { org_id, id: req.params.id } });
    if (!source) return sendErrorResponse(res, 404, "Knowledge source not found.");
    await source.update({ status: "Archived" });
    await writeAudit({ req, org_id, action: "chatbot.knowledge.archived", entityType: "chatbot_knowledge_source", entityId: source.id });
    res.json({ message: "Knowledge source archived.", source });
  } catch (error) {
    console.error("Archive chatbot knowledge error:", error);
    return sendErrorResponse(res, 500, "Failed to archive knowledge source.");
  }
};

exports.rotateWidgetIdentifier = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const [widget] = await db.chatbotWidget.findOrCreate({
      where: { org_id },
      defaults: {
        org_id,
        widgetIdentifier: `cw_${crypto.randomBytes(18).toString("hex")}`,
        status: "active",
      },
    });
    await widget.update({ widgetIdentifier: `cw_${crypto.randomBytes(18).toString("hex")}`, status: "active" });
    await writeAudit({ req, org_id, action: "chatbot.widget.rotated", entityType: "chatbot_widget", entityId: widget.id });
    res.json({
      message: "Widget installation key rotated.",
      widget,
      installScript: `<script src="${req.protocol}://${req.get("host")}/chatbot/widget.js" data-widget-id="${widget.widgetIdentifier}" async></script>`,
    });
  } catch (error) {
    console.error("Rotate chatbot widget error:", error);
    return sendErrorResponse(res, 500, "Failed to rotate widget key.");
  }
};

exports.getPublicConfig = async (req, res) => {
  try {
    const { widget, domain } = await findWidgetContext(req, req.params.widgetIdentifier);
    const { configuration, leadForm, faqs, domains } = await activeWidgetPayload(widget.org_id);
    if (!configuration?.isConfigured) return sendErrorResponse(res, 409, "Chatbot setup is not complete.");
    res.json({
      widgetIdentifier: widget.widgetIdentifier,
      allowedDomain: domain,
      configuration: {
        chatbotName: configuration.chatbotName,
        greeting: configuration.greeting,
        subtitle: configuration.subtitle,
        primaryColor: configuration.primaryColor,
        secondaryColor: configuration.secondaryColor,
        headerBackground: configuration.headerBackground,
        textColor: configuration.textColor,
        buttonColor: configuration.buttonColor,
        widgetPosition: configuration.widgetPosition,
        borderRadius: configuration.borderRadius,
        styleMode: configuration.styleMode,
        onlineText: configuration.onlineText,
        offlineText: configuration.offlineText,
        actionCards: configuration.actionCards || defaultActionCards,
        contactInfo: configuration.contactInfo || {},
        visibleContactFields: configuration.visibleContactFields || [],
      },
      leadForm: {
        fields: leadForm?.fields || defaultLeadFields,
        requireConsent: leadForm?.requireConsent !== false,
        consentText: leadForm?.consentText,
      },
      suggestedQuestions: faqs.slice(0, 5).map((faq) => faq.question),
      allowedDomains: domains.map((item) => item.domain),
    });
  } catch (error) {
    return sendErrorResponse(res, error.statusCode || 500, error.message || "Failed to load chatbot widget.");
  }
};

exports.publicMessage = async (req, res) => {
  try {
    const { widget, domain, entitlement } = await findWidgetContext(req, req.params.widgetIdentifier);
    await ensurePublicMessageCapacity({ entitlement, widget, sessionKey: req.body.sessionKey });
    const question = clean(req.body.message).slice(0, 1000);
    if (!question) return sendErrorResponse(res, 400, "Message is required.");
    const { faqs, knowledgeSources } = await activeWidgetPayload(widget.org_id);
    const reply = answerFromKnowledge({ question, faqs, knowledgeSources });
    const enquiryIntent = hasEnquiryIntent(question);
    if (enquiryIntent && !reply.safetyBlocked) {
      reply.answer = `${reply.answer}\n\nI can help create an enquiry for the team. Please share your name, phone number and requirement in the enquiry form, and confirm consent before submitting.`;
      reply.enquiryIntent = true;
      reply.nextAction = "capture_enquiry";
    }
    const sessionKey = clean(req.body.sessionKey) || `session-${crypto.randomBytes(8).toString("hex")}`;
    const [conversation, createdConversation] = await db.chatbotConversation.findOrCreate({
      where: { org_id: widget.org_id, sessionKey },
      defaults: { org_id: widget.org_id, widgetId: widget.id, sessionKey, sourceDomain: domain },
    });
    await db.chatbotMessage.bulkCreate([
      { org_id: widget.org_id, conversationId: conversation.id, senderType: "visitor", message: question },
      { org_id: widget.org_id, conversationId: conversation.id, senderType: "ai", message: reply.answer, confidence: reply.confidence, references: reply.references },
    ]);
    const usageWrites = [writeUsage({ org_id: widget.org_id, conversationId: conversation.id, entryType: "ai_message", reason: "grounded_answer" })];
    if (createdConversation) {
      usageWrites.push(writeUsage({ org_id: widget.org_id, conversationId: conversation.id, entryType: "conversation", reason: "widget_session_started" }));
    }
    if (reply.lowConfidence) {
      usageWrites.push(writeUsage({ org_id: widget.org_id, conversationId: conversation.id, entryType: "low_confidence_fallback", reason: reply.safetyBlocked ? "safety_blocked" : "insufficient_evidence" }));
    }
    await Promise.all(usageWrites);
    res.json({ conversationId: conversation.id, sessionKey, ...reply });
  } catch (error) {
    return sendErrorResponse(res, error.statusCode || 500, error.message || "Failed to answer chatbot message.");
  }
};

exports.publicEnquiryCapture = async (req, res) => {
  try {
    const { widget, domain, entitlement } = await findWidgetContext(req, req.params.widgetIdentifier);
    await ensurePublicMessageCapacity({ entitlement, widget, sessionKey: req.body.sessionKey, checkAiMessages: false });
    const result = await createOrLinkChatbotEnquiry({ widget, domain, body: req.body || {} });
    const usageWrites = [
      writeUsage({ org_id: widget.org_id, conversationId: result.conversation.id, entryType: "enquiry", reason: result.reused ? "existing_enquiry_linked" : "chatbot_enquiry_created" }),
      writeUsage({ org_id: widget.org_id, conversationId: result.conversation.id, entryType: "handover", reason: "enquiry_assigned_to_team" }),
    ];
    if (result.createdConversation) {
      usageWrites.push(writeUsage({ org_id: widget.org_id, conversationId: result.conversation.id, entryType: "conversation", reason: "widget_session_started" }));
    }
    await Promise.all(usageWrites);
    res.status(result.reused ? 200 : 201).json({
      message: result.reused ? "Existing enquiry linked and assigned to the team." : "Enquiry created and assigned to the team.",
      enquiryId: result.enquiry.id,
      enquiryLink: `/customer/edit/${result.enquiry.id}`,
      conversationId: result.conversation.id,
      assignedTo: result.assignment.assignedTo,
      reused: result.reused,
    });
  } catch (error) {
    return sendErrorResponse(res, error.statusCode || 500, error.message || "Failed to submit enquiry.");
  }
};

exports.publicSupportRequest = async (req, res) => {
  try {
    const { widget, domain, entitlement } = await findWidgetContext(req, req.params.widgetIdentifier);
    if (!entitlement.humanHandoverEnabled) return sendErrorResponse(res, 403, "Human handover is not enabled for this organization.");
    const name = clean(req.body.name);
    const subject = clean(req.body.subject);
    const description = clean(req.body.description);
    if (!name || !subject || !description) return sendErrorResponse(res, 400, "Name, subject and description are required.");
    const assignment = await findAssignmentTarget(widget.org_id);
    const support = await db.chatbotSupportRequest.create({
      org_id: widget.org_id,
      conversationId: req.body.conversationId || null,
      name,
      email: clean(req.body.email) || null,
      phone: clean(req.body.phone) || null,
      category: clean(req.body.category) || null,
      subject,
      description,
      referenceNumber: clean(req.body.referenceNumber) || `SUP-${Date.now()}`,
      assignedTo: assignment.assignedTo,
      consentAcceptedAt: req.body.consentAccepted === true || req.body.consentAccepted === "true" ? new Date() : null,
      sourceDomain: domain,
    });
    if (req.body.conversationId) {
      await db.chatbotConversation.update(
        { status: "Assigned", assignedTo: assignment.assignedTo, handoverReason: subject },
        { where: { id: req.body.conversationId, org_id: widget.org_id } }
      );
    }
    await writeUsage({ org_id: widget.org_id, conversationId: req.body.conversationId || null, entryType: "handover", reason: "support_request_assigned" });
    res.status(201).json({ message: "Support request submitted and assigned to the team.", referenceNumber: support.referenceNumber, assignedTo: assignment.assignedTo });
  } catch (error) {
    return sendErrorResponse(res, error.statusCode || 500, error.message || "Failed to submit support request.");
  }
};

exports.widgetScript = (req, res) => {
  const script = `
(function(){
  if (window.__crescoChatbotLoaded) return;
  window.__crescoChatbotLoaded = true;
  var currentScript = document.currentScript || (function(){ var scripts=document.getElementsByTagName('script'); return scripts[scripts.length-1]; })();
  var widgetId = currentScript && currentScript.getAttribute('data-widget-id');
  var apiBase = new URL(currentScript.src).origin + '/api/chatbot/public';
  if (!widgetId) return;
  var sessionKey = localStorage.getItem('cresco_chat_session_' + widgetId) || ('cw-session-' + Math.random().toString(16).slice(2) + Date.now());
  localStorage.setItem('cresco_chat_session_' + widgetId, sessionKey);
  var host = document.createElement('div');
  host.id = 'cresco-chatbot-root';
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: 'open' });
  var state = { open:false, tab:'home', formMode:'support', config:null, messages:[], loading:false, conversationId:null };
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function styles(c){return '<style>:host{all:initial;font-family:Inter,Arial,sans-serif;color:#0f172a}.cw-btn{position:fixed;z-index:2147483646;bottom:22px;'+(c.widgetPosition==='left'?'left':'right')+':22px;width:62px;height:62px;border-radius:999px;border:0;background:'+c.primaryColor+';color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.25);cursor:pointer;font:700 24px Arial}.cw-panel{position:fixed;z-index:2147483646;bottom:96px;'+(c.widgetPosition==='left'?'left':'right')+':22px;width:min(380px,calc(100vw - 24px));height:min(620px,calc(100vh - 120px));background:#fff;border:1px solid #e2e8f0;border-radius:'+c.borderRadius+'px;box-shadow:0 22px 70px rgba(15,23,42,.28);overflow:hidden;display:flex;flex-direction:column}.cw-head{padding:16px;background:'+c.headerBackground+';color:'+c.textColor+';border-bottom:1px solid #e2e8f0}.cw-title{font-size:16px;font-weight:900}.cw-sub{font-size:12px;font-weight:700;opacity:.75;margin-top:3px}.cw-close{float:right;border:0;background:transparent;font-size:20px;cursor:pointer;color:inherit}.cw-body{flex:1;overflow:auto;padding:14px;background:#f8fafc}.cw-nav{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #e2e8f0;background:#fff}.cw-nav button{border:0;background:#fff;padding:10px 4px;font-size:12px;font-weight:800;color:#475569;cursor:pointer}.cw-nav button.active{color:'+c.primaryColor+'}.cw-card,.cw-input,.cw-text{width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:11px;margin:7px 0;font:700 13px Arial;color:#334155}.cw-card{cursor:pointer;text-align:left}.cw-primary{width:100%;border:0;border-radius:12px;padding:12px;background:'+c.buttonColor+';color:#fff;font-weight:900;cursor:pointer;margin-top:8px}.cw-msg{margin:8px 0;max-width:86%;padding:10px 12px;border-radius:14px;font:600 13px/1.4 Arial}.cw-user{margin-left:auto;background:'+c.primaryColor+';color:#fff}.cw-ai{background:#fff;border:1px solid #e2e8f0;color:#334155}.cw-small{font-size:12px;color:#64748b;font-weight:700}.cw-error{color:#b91c1c;font-weight:800;font-size:12px}</style>'}
  function render(){
    var c = state.config && state.config.configuration;
    if(!c){ shadow.innerHTML='<style>.cw-btn{position:fixed;right:22px;bottom:22px;width:62px;height:62px;border-radius:999px;border:0;background:#4f46e5;color:#fff}</style><button class="cw-btn" aria-label="Loading chat">...</button>'; return; }
    var html = styles(c) + '<button class="cw-btn" id="cw-toggle" aria-label="Open chat">Chat</button>';
    if(state.open){
      html += '<section class="cw-panel" role="dialog" aria-label="'+esc(c.chatbotName)+'"><header class="cw-head"><button class="cw-close" id="cw-close" aria-label="Close">×</button><div class="cw-title">'+esc(c.chatbotName)+'</div><div class="cw-sub">'+esc(c.greeting)+' '+esc(c.subtitle)+'</div><div class="cw-small">'+esc(c.onlineText||'Online')+'</div></header><main class="cw-body">'+tabHtml()+'</main><nav class="cw-nav">'+['home','chat','contact','support'].map(function(t){return '<button data-tab="'+t+'" class="'+(state.tab===t?'active':'')+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('')+'</nav></section>';
    }
    shadow.innerHTML = html; bind();
  }
  function tabHtml(){
    var cfg = state.config.configuration;
    if(state.tab==='home') return (cfg.actionCards||[]).filter(function(x){return x.enabled!==false}).map(function(card){return '<button class="cw-card" data-action="'+esc(card.id||'chat')+'">'+esc(card.label)+'</button>'}).join('') || '<p class="cw-small">Start a chat or contact the team.</p>';
    if(state.tab==='chat') return '<div id="cw-messages">'+state.messages.map(function(m){return '<div class="cw-msg '+(m.sender==='user'?'cw-user':'cw-ai')+'">'+esc(m.text)+'</div>'}).join('')+'</div>'+(state.config.suggestedQuestions||[]).slice(0,3).map(function(q){return '<button class="cw-card cw-suggest">'+esc(q)+'</button>'}).join('')+'<input class="cw-input" id="cw-chat-input" placeholder="Ask a question" /><button class="cw-primary" id="cw-send">Send</button>';
    if(state.tab==='contact'){var info=cfg.contactInfo||{}; return '<div class="cw-card"><b>'+esc(info.businessName||cfg.chatbotName)+'</b><p>'+esc(info.phone||'')+'</p><p>'+esc(info.email||'')+'</p><p>'+esc(info.businessHours||'')+'</p><p>'+esc(info.address||'')+'</p></div><button class="cw-primary" data-action="send_enquiry">Send Enquiry</button>';}
    if(state.formMode==='enquiry') return '<input class="cw-input" id="sup-name" placeholder="Name *" /><input class="cw-input" id="sup-phone" placeholder="Phone *" /><input class="cw-input" id="sup-email" placeholder="Email" /><input class="cw-input" id="sup-company" placeholder="Company" /><input class="cw-input" id="sup-product" placeholder="Interested product/service" /><textarea class="cw-text" id="sup-desc" rows="4" placeholder="Requirement *"></textarea><label class="cw-small"><input type="checkbox" id="sup-consent" /> '+esc(state.config.leadForm && state.config.leadForm.consentText || 'I agree to be contacted about this enquiry.')+'</label><button class="cw-primary" id="sup-submit">Submit Enquiry</button><button class="cw-card" id="sup-switch">Need support instead?</button><div class="cw-small" id="sup-result"></div>';
    return '<input class="cw-input" id="sup-name" placeholder="Name" /><input class="cw-input" id="sup-email" placeholder="Email" /><input class="cw-input" id="sup-phone" placeholder="Phone" /><input class="cw-input" id="sup-subject" placeholder="Subject" /><textarea class="cw-text" id="sup-desc" rows="4" placeholder="How can we help?"></textarea><button class="cw-primary" id="sup-submit">Submit Support Request</button><button class="cw-card" id="sup-enquiry">Send an enquiry instead</button><div class="cw-small" id="sup-result"></div>';
  }
  function bind(){
    var toggle=shadow.getElementById('cw-toggle'); if(toggle) toggle.onclick=function(){state.open=!state.open; render();};
    var close=shadow.getElementById('cw-close'); if(close) close.onclick=function(){state.open=false; render();};
    shadow.querySelectorAll('[data-tab]').forEach(function(btn){btn.onclick=function(){state.tab=btn.getAttribute('data-tab'); render();};});
    shadow.querySelectorAll('[data-action]').forEach(function(btn){btn.onclick=function(){var a=btn.getAttribute('data-action'); if(a==='send_enquiry'||a==='request_demo'){state.formMode='enquiry';state.tab='support';}else{state.tab=a==='contact_team'?'contact':a==='get_support'?'support':'chat';} render();};});
    shadow.querySelectorAll('.cw-suggest').forEach(function(btn){btn.onclick=function(){sendMessage(btn.textContent);};});
    var send=shadow.getElementById('cw-send'); if(send) send.onclick=function(){var input=shadow.getElementById('cw-chat-input'); sendMessage(input && input.value);};
    var sup=shadow.getElementById('sup-submit'); if(sup) sup.onclick=function(){state.formMode==='enquiry'?submitEnquiry():submitSupport();};
    var sw=shadow.getElementById('sup-switch'); if(sw) sw.onclick=function(){state.formMode='support';render();};
    var enq=shadow.getElementById('sup-enquiry'); if(enq) enq.onclick=function(){state.formMode='enquiry';render();};
  }
  function sendMessage(text){
    text=(text||'').trim(); if(!text) return;
    state.messages.push({sender:'user',text:text}); render();
    fetch(apiBase+'/'+encodeURIComponent(widgetId)+'/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:text,sessionKey:sessionKey})}).then(function(r){return r.json().then(function(j){if(!r.ok) throw j; return j;});}).then(function(j){state.conversationId=j.conversationId; state.messages.push({sender:'ai',text:j.answer}); if(j.nextAction==='capture_enquiry'){state.formMode='enquiry';state.tab='support';} render();}).catch(function(){state.messages.push({sender:'ai',text:'Sorry, I could not answer right now. Please try again or contact support.'}); render();});
  }
  function submitEnquiry(){
    var body={conversationId:state.conversationId,sessionKey:sessionKey,name:val('sup-name'),phone:val('sup-phone'),email:val('sup-email'),companyName:val('sup-company'),interestedProduct:val('sup-product'),requirement:val('sup-desc'),consentAccepted:!!(shadow.getElementById('sup-consent')&&shadow.getElementById('sup-consent').checked)};
    fetch(apiBase+'/'+encodeURIComponent(widgetId)+'/enquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){if(!r.ok) throw j; return j;});}).then(function(j){state.conversationId=j.conversationId; shadow.getElementById('sup-result').textContent='Enquiry submitted. ID: '+j.enquiryId;}).catch(function(e){shadow.getElementById('sup-result').textContent=(e.errors&&e.errors[0]&&e.errors[0].msg)||'Could not submit enquiry.';});
  }
  function submitSupport(){
    var body={conversationId:state.conversationId,name:val('sup-name'),email:val('sup-email'),phone:val('sup-phone'),subject:val('sup-subject'),description:val('sup-desc'),consentAccepted:true};
    fetch(apiBase+'/'+encodeURIComponent(widgetId)+'/support',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){if(!r.ok) throw j; return j;});}).then(function(j){shadow.getElementById('sup-result').textContent='Submitted. Reference: '+j.referenceNumber;}).catch(function(e){shadow.getElementById('sup-result').textContent=(e.errors&&e.errors[0]&&e.errors[0].msg)||'Could not submit support request.';});
  }
  function val(id){var el=shadow.getElementById(id); return el ? el.value : '';}
  fetch(apiBase+'/'+encodeURIComponent(widgetId)+'/config').then(function(r){return r.json().then(function(j){if(!r.ok) throw j; return j;});}).then(function(j){state.config=j; render();}).catch(function(){shadow.innerHTML='';});
  render();
})();`;
  res.type("application/javascript").send(script);
};

exports.auditAccess = async (req, res) => {
  try {
    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "chatbot.module.viewed",
      entityType: "chatbot_entitlement",
      entityId: req.chatbotEntitlement?.id,
      metadata: { phase: "phase-6-enquiry-capture-human-handover" },
    });
    res.json({ message: "Website AI Chatbot access verified." });
  } catch (error) {
    console.error("Audit chatbot access error:", error);
    return sendErrorResponse(res, 500, "Failed to write Website AI Chatbot audit.");
  }
};
