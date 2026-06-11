const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const TAndCAndDec = db.t_and_c_and_dec;

// Create new entry
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { type, title, content, is_default, status } = req.body;
  const org_id = req.user.org_id;
  const created_by = req.user.id;

  try {
    // If setting as default, remove default from other entries of same type
    if (is_default) {
      await TAndCAndDec.update(
        { is_default: false },
        { where: { org_id, type, is_default: true } }
      );
    }

    const result = await TAndCAndDec.create({
      org_id,
      type,
      title,
      content,
      is_default: is_default || false,
      status: status || 'active',
      created_by,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create T&C/Description Error:", error);
    return sendErrorResponse(res, 500, "Failed to create entry");
  }
};

// Get all entries (with optional type filter)
exports.getAll = async (req, res) => {
  const org_id = req.user.org_id;
  const { type } = req.query;

  try {
    const whereClause = { org_id };
    if (type) {
      whereClause.type = type;
    }

    const entries = await TAndCAndDec.findAll({
      where: whereClause,
      order: [['type', 'ASC'], ['is_default', 'DESC'], ['createdAt', 'DESC']],
    });

    res.status(200).json(entries);
  } catch (error) {
    console.error("Get T&C/Description Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch entries");
  }
};

// Get default entry by type
exports.getDefaultByType = async (req, res) => {
  const org_id = req.user.org_id;
  const { type } = req.params;

  try {
    const entry = await TAndCAndDec.findOne({
      where: { org_id, type, is_default: true, status: 'active' },
    });

    res.status(200).json(entry);
  } catch (error) {
    console.error("Get Default T&C/Description Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch default entry");
  }
};

// Get single entry by ID
exports.getById = async (req, res) => {
  const org_id = req.user.org_id;
  const { id } = req.params;

  try {
    const entry = await TAndCAndDec.findOne({
      where: { id, org_id },
    });

    if (!entry) {
      return sendErrorResponse(res, 404, "Entry not found");
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("Get T&C/Description By ID Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch entry");
  }
};

// Update entry
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { type, title, content, is_default, status } = req.body;
  const org_id = req.user.org_id;

  try {
    const entry = await TAndCAndDec.findOne({ where: { id, org_id } });
    if (!entry) {
      return sendErrorResponse(res, 404, "Entry not found");
    }

    // If setting as default, remove default from other entries of same type
    if (is_default && !entry.is_default) {
      await TAndCAndDec.update(
        { is_default: false },
        { where: { org_id, type, is_default: true, id: { [db.Sequelize.Op.ne]: id } } }
      );
    }

    await entry.update({
      type,
      title,
      content,
      is_default: is_default || false,
      status: status || entry.status,
    });

    res.status(200).json({ message: "Updated successfully", entry });
  } catch (error) {
    console.error("Update T&C/Description Error:", error);
    return sendErrorResponse(res, 500, "Failed to update entry");
  }
};

// Delete entry
exports.delete = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const entry = await TAndCAndDec.findOne({ where: { id, org_id } });
    if (!entry) {
      return sendErrorResponse(res, 404, "Entry not found");
    }

    await entry.destroy();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete T&C/Description Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete entry");
  }
};