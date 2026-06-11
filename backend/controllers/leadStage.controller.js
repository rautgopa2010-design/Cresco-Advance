const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const LeadStage = db.leadStage;

// Create a new lead stage
exports.createLeadStage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { leadStage, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await LeadStage.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("leadStage")),
            db.Sequelize.fn("LOWER", leadStage)
          )
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This lead stage already exists for this organization.");
    }

    const result = await LeadStage.create({ leadStage, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Lead Stage Error:", error);
    return sendErrorResponse(res, 500, "Failed to create lead stage");
  }
};

// Get all lead stages
exports.getLeadStages = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const leadStages = await LeadStage.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(leadStages);
  } catch (error) {
    console.error("Get Lead Stage Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch lead stages");
  }
};

// Update a lead stage
exports.updateLeadStage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { leadStage, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await LeadStage.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("leadStage")),
            db.Sequelize.fn("LOWER", leadStage)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This lead stage already exists for this organization.");
    }

    const [updated] = await LeadStage.update(
      { leadStage, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Lead Stage not found");
    }
  } catch (error) {
    console.error("Update Lead Stage Error:", error);
    return sendErrorResponse(res, 500, "Failed to update lead stage");
  }
};

// Delete a lead stage
exports.deleteLeadStage = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await LeadStage.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Lead Stage not found");
    }
  } catch (error) {
    console.error("Delete Lead Stage Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete lead stage");
  }
};
