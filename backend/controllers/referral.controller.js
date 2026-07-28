const db = require("../models");
const Referral = db.referral;
const { Op } = require("sequelize");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Rejected", "Paid"];
const REWARD_STATUSES = ["Not Eligible", "Eligible", "Processing", "Paid"];

const clean = (value) => String(value || "").trim();

const isProviderUser = (user = {}) =>
  user.user_type === "provider" ||
  clean(user.role_name).toLowerCase() === "super provider admin";

const requireProvider = (req, res) => {
  if (isProviderUser(req.user)) return true;
  sendErrorResponse(res, 403, "Only Cresco Super Master can access referrals.");
  return false;
};

exports.createReferral = async (req, res) => {
  const {
    name,
    phone,
    email,
    friendName,
    friendPhone,
    friendEmail,
    company,
    source,
  } = req.body;

  const payload = {
    referrerName: clean(name),
    referrerPhone: clean(phone),
    referrerEmail: clean(email).toLowerCase(),
    refereeName: clean(friendName),
    refereePhone: clean(friendPhone),
    refereeEmail: clean(friendEmail).toLowerCase(),
    refereeCompany: clean(company) || null,
    source: clean(source) || "refer-and-earn",
    ipAddress: req.ip,
  };

  if (
    !payload.referrerName ||
    !payload.referrerPhone ||
    !payload.referrerEmail ||
    !payload.refereeName ||
    !payload.refereePhone ||
    !payload.refereeEmail
  ) {
    return sendErrorResponse(res, 400, "Please fill all required referral details.");
  }

  try {
    const referral = await Referral.create(payload);
    res.status(201).json({
      message: "Referral submitted successfully.",
      referralId: referral.id,
    });
  } catch (error) {
    console.error("Create Referral Error:", error);
    return sendErrorResponse(res, 500, "Failed to submit referral.");
  }
};

exports.getReferrals = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const {
    search = "",
    status = "",
    rewardStatus = "",
    fromDate = "",
    toDate = "",
  } = req.query;

  const where = {};
  const searchText = clean(search);

  if (STATUSES.includes(status)) where.status = status;
  if (REWARD_STATUSES.includes(rewardStatus)) where.rewardStatus = rewardStatus;

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
    if (toDate) where.createdAt[Op.lte] = new Date(`${toDate}T23:59:59.999`);
  }

  if (searchText) {
    where[Op.or] = [
      { referrerName: { [Op.like]: `%${searchText}%` } },
      { referrerPhone: { [Op.like]: `%${searchText}%` } },
      { referrerEmail: { [Op.like]: `%${searchText}%` } },
      { refereeName: { [Op.like]: `%${searchText}%` } },
      { refereePhone: { [Op.like]: `%${searchText}%` } },
      { refereeEmail: { [Op.like]: `%${searchText}%` } },
      { refereeCompany: { [Op.like]: `%${searchText}%` } },
    ];
  }

  try {
    const referrals = await Referral.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const summary = await Promise.all(
      STATUSES.map(async (item) => ({
        status: item,
        count: await Referral.count({ where: { status: item } }),
      }))
    );

    res.status(200).json({ referrals, summary });
  } catch (error) {
    console.error("Get Referrals Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch referrals.");
  }
};

exports.updateReferral = async (req, res) => {
  if (!requireProvider(req, res)) return;

  const { id } = req.params;
  const { status, rewardStatus, notes } = req.body;

  const updates = {};
  if (STATUSES.includes(status)) updates.status = status;
  if (REWARD_STATUSES.includes(rewardStatus)) updates.rewardStatus = rewardStatus;
  if (notes !== undefined) updates.notes = clean(notes) || null;

  try {
    const referral = await Referral.findByPk(id);
    if (!referral) return sendErrorResponse(res, 404, "Referral not found.");

    await referral.update(updates);
    res.status(200).json({ message: "Referral updated successfully.", referral });
  } catch (error) {
    console.error("Update Referral Error:", error);
    return sendErrorResponse(res, 500, "Failed to update referral.");
  }
};
