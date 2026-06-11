const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const LeadSource = db.leadSource;

// Create a new lead source
exports.createLeadSource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { leadSource, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await LeadSource.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("leadSource")),
            db.Sequelize.fn("LOWER", leadSource)
          )
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This lead source already exists for this organization.");
    }

    const result = await LeadSource.create({ leadSource, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Lead Source Error:", error);
    return sendErrorResponse(res, 500, "Failed to create lead source");
  }
};

// Get all lead sources
exports.getLeadSources = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const leadSources = await LeadSource.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(leadSources);
  } catch (error) {
    console.error("Get Lead Source Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch lead sources");
  }
};

// Update a lead source
exports.updateLeadSource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { leadSource, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await LeadSource.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("leadSource")),
            db.Sequelize.fn("LOWER", leadSource)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This lead source already exists for this organization.");
    }

    const [updated] = await LeadSource.update(
      { leadSource, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Lead Source not found");
    }
  } catch (error) {
    console.error("Update Lead Source Error:", error);
    return sendErrorResponse(res, 500, "Failed to update lead source");
  }
};

// Delete a lead source
exports.deleteLeadSource = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await LeadSource.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Lead Source not found");
    }
  } catch (error) {
    console.error("Delete Lead Source Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete lead source");
  }
};
