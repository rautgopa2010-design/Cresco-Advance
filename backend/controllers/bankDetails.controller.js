const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const BankDetails = db.bankDetails;

exports.createBank = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const {
    bankName,
    branchName,
    customerName,
    accountNumber,
    cifNumber,
    ifsc,
    micr,
    accountType,
    customerPan,
    address,
  } = req.body;

  try {
    const bank = await BankDetails.create({
      org_id: req.user.org_id,
      bankName,
      branchName,
      customerName,
      accountNumber,
      cifNumber,
      ifsc,
      micr,
      accountType,
      customerPan,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: bank,
    });
  } catch (error) {
    console.error("Create bank error:", error);
    return sendErrorResponse(res, 500, "Failed to add bank account");
  }
};

exports.getBanks = async (req, res) => {
  try {
    const banks = await BankDetails.findAll({
      where: { org_id: req.user.org_id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: banks,
    });
  } catch (error) {
    console.error("Get banks error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch bank accounts");
  }
};

exports.getBankById = async (req, res) => {
  try {
    const bank = await BankDetails.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });

    if (!bank) {
      return sendErrorResponse(res, 404, "Bank account not found");
    }

    return res.status(200).json({
      success: true,
      data: bank,
    });
  } catch (error) {
    console.error("Get bank by id error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch bank account");
  }
};

exports.updateBank = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const {
    bankName,
    branchName,
    customerName,
    accountNumber,
    cifNumber,
    ifsc,
    micr,
    accountType,
    customerPan,
    address,
  } = req.body;

  try {
    const bank = await BankDetails.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });

    if (!bank) {
      return sendErrorResponse(res, 404, "Bank account not found");
    }

    await bank.update({
      bankName,
      branchName,
      customerName,
      accountNumber,
      cifNumber,
      ifsc,
      micr,
      accountType,
      customerPan,
      address,
    });

    return res.status(200).json({
      success: true,
      message: "Bank account updated successfully",
      data: bank,
    });
  } catch (error) {
    console.error("Update bank error:", error);
    return sendErrorResponse(res, 500, "Failed to update bank account");
  }
};

exports.deleteBank = async (req, res) => {
  try {
    const bank = await BankDetails.findOne({
      where: { id: req.params.id, org_id: req.user.org_id },
    });

    if (!bank) {
      return sendErrorResponse(res, 404, "Bank account not found");
    }

    await bank.destroy(); // Hard delete

    return res.status(200).json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Delete bank error:", error);
    return sendErrorResponse(res, 500, "Failed to delete bank account");
  }
};