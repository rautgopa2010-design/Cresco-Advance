const fs = require("fs");
const path = require("path");
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

exports.getSummary = async (req, res) => {
  try {
    const org_id = req.user.org_id;
    const { configuration, leadForm } = await ensureSetupRows(org_id);
    const [domains, knowledgeSources, faqs] = await Promise.all([
      db.chatbotAllowedDomain.findAll({ where: { org_id }, order: [["createdAt", "DESC"]] }),
      db.chatbotKnowledgeSource.findAll({ where: { org_id, status: { [Op.ne]: "Archived" } }, order: [["updatedAt", "DESC"]] }),
      db.chatbotFaq.findAll({ where: { org_id, status: { [Op.ne]: "Archived" } }, order: [["sortOrder", "ASC"], ["updatedAt", "DESC"]] }),
    ]);
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
      knowledgeSources,
      faqs,
      validationIssues,
      phase: "phase-3-organization-setup",
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
    const [row] = await db.chatbotAllowedDomain.findOrCreate({
      where: { org_id, domain },
      defaults: { org_id, domain, verifiedAt: new Date() },
    });
    if (!row.isActive) await row.update({ isActive: true, verifiedAt: new Date() });
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

exports.auditAccess = async (req, res) => {
  try {
    await writeAudit({
      req,
      org_id: req.user.org_id,
      action: "chatbot.module.viewed",
      entityType: "chatbot_entitlement",
      entityId: req.chatbotEntitlement?.id,
      metadata: { phase: "phase-2-foundation" },
    });
    res.json({ message: "Website AI Chatbot access verified." });
  } catch (error) {
    console.error("Audit chatbot access error:", error);
    return sendErrorResponse(res, 500, "Failed to write Website AI Chatbot audit.");
  }
};
