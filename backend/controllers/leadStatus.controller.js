const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const LeadStatus = db.leadStatus;

// Create a new lead status
exports.createLeadStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { leadStatus, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await LeadStatus.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("leadStatus")),
            db.Sequelize.fn("LOWER", leadStatus)
          )
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This lead status already exists for this organization.");
    }

    const result = await LeadStatus.create({ leadStatus, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create LeadStatus Error:", error);
    return sendErrorResponse(res, 500, "Failed to create lead status");
  }
};

// Get all lead statuses
exports.getLeadStatuses = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const leadStatuses = await LeadStatus.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(leadStatuses);
  } catch (error) {
    console.error("Get Lead Status Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch lead statuses");
  }
};

// Update a lead status
exports.updateLeadStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { leadStatus, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await LeadStatus.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("leadStatus")),
            db.Sequelize.fn("LOWER", leadStatus)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This lead status already exists for this organization.");
    }

    const [updated] = await LeadStatus.update(
      { leadStatus, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Lead Status not found");
    }
  } catch (error) {
    console.error("Update LeadStatus Error:", error);
    return sendErrorResponse(res, 500, "Failed to update lead status");
  }
};

// Delete a lead status
exports.deleteLeadStatus = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await LeadStatus.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Lead Status not found");
    }
  } catch (error) {
    console.error("Delete LeadStatus Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete lead status");
  }
};
