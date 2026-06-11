const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Industry = db.industry;

// Create a new industry
exports.createIndustry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { industry, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Industry.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("industry")),
            db.Sequelize.fn("LOWER", industry)
          ),
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This industry already exists for this organization.");
    }

    const result = await Industry.create({ industry, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Industry Error:", error);
    return sendErrorResponse(res, 500, "Failed to create industry");
  }
};

// Get all industry
exports.getIndustry = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const industry = await Industry.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(industry);
  } catch (error) {
    console.error("Get Industry Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch industry");
  }
};

// Update a industry
exports.updateIndustry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { industry, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Industry.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("industry")),
            db.Sequelize.fn("LOWER", industry)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This industry already exists for this organization.");
    }

    const [updated] = await Industry.update(
      { industry, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Industry not found");
    }
  } catch (error) {
    console.error("Update Industry Error:", error);
    return sendErrorResponse(res, 500, "Failed to update industry");
  }
};

// Delete a industry
exports.deleteIndustry = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await Industry.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Industry not found");
    }
  } catch (error) {
    console.error("Delete Industry Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete industry");
  }
};
