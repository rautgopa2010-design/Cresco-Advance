const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Salutation = db.salutation;

// Create a new salutation
exports.createSalutation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { salutation, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Salutation.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("salutation")),
            db.Sequelize.fn("LOWER", salutation)
          ),
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This salutation already exists for this organization.");
    }

    const result = await Salutation.create({ salutation, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Salutation Error:", error);
    return sendErrorResponse(res, 500, "Failed to create salutation");
  }
};

// Get all salutations
exports.getSalutations = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const salutations = await Salutation.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(salutations);
  } catch (error) {
    console.error("Get Salutation Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch salutations");
  }
};

// Update a salutation
exports.updateSalutation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { salutation, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Salutation.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("salutation")),
            db.Sequelize.fn("LOWER", salutation)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This salutation already exists for this organization.");
    }

    const [updated] = await Salutation.update(
      { salutation, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Salutation not found");
    }
  } catch (error) {
    console.error("Update Salutation Error:", error);
    return sendErrorResponse(res, 500, "Failed to update salutation");
  }
};

// Delete a salutation
exports.deleteSalutation = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await Salutation.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Salutation not found");
    }
  } catch (error) {
    console.error("Delete Salutation Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete salutation");
  }
};
