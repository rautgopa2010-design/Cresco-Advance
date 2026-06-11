const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const Prefix = db.prefix;

exports.getPrefix = async (req, res) => {
  const { org_id } = req.user;

  try {
    let prefix = await Prefix.findOne({ where: { org_id } });

    if (!prefix) {
      // Create default if not exists
      prefix = await Prefix.create({
        org_id,
        orderPrefix: "O",
        quotationPrefix: "Q",
        invoicePrefix: "I",
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
    }

    res.status(200).json(prefix);
  } catch (error) {
    console.error("Get Prefix Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch prefix settings");
  }
};

exports.createOrUpdatePrefix = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { org_id } = req.user;
  const { orderPrefix, quotationPrefix, invoicePrefix } = req.body;

  try {
    let prefix = await Prefix.findOne({ where: { org_id } });

    if (prefix) {
      // Update
      await prefix.update({
        orderPrefix: orderPrefix?.trim() || prefix.orderPrefix,
        quotationPrefix: quotationPrefix?.trim() || prefix.quotationPrefix,
        invoicePrefix: invoicePrefix?.trim() || prefix.invoicePrefix,
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
    } else {
      // Create
      prefix = await Prefix.create({
        org_id,
        orderPrefix: orderPrefix?.trim() || "O",
        quotationPrefix: quotationPrefix?.trim() || "Q",
        invoicePrefix: invoicePrefix?.trim() || "I",
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
    }

    res.status(200).json({
      message: prefix.isNewRecord ? "Prefix created" : "Prefix updated",
      prefix,
    });
  } catch (error) {
    console.error("Prefix Save Error:", error);
    return sendErrorResponse(res, 500, "Failed to save prefix settings");
  }
};

exports.deletePrefix = async (req, res) => {
  const { org_id } = req.user;

  try {
    const deleted = await Prefix.destroy({ where: { org_id } });
    if (deleted === 0) {
      return res.status(404).json({ message: "No prefix settings found" });
    }
    res.status(200).json({ message: "Prefix settings reset (defaults will be used)" });
  } catch (error) {
    console.error("Delete Prefix Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete prefix");
  }
};