const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Country = db.country;

// Create a new country
exports.createCountry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { country, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Country.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("country")),
            db.Sequelize.fn("LOWER", country)
          )
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This country already exists for this organization.");
    }

    const result = await Country.create({ country, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Country Error:", error);
    return sendErrorResponse(res, 500, "Failed to create country");
  }
};

// Get all countries
exports.getCountries = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const countries = await Country.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(countries);
  } catch (error) {
    console.error("Get Country Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch countries");
  }
};

// Update a country
exports.updateCountry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { country, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Country.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("country")),
            db.Sequelize.fn("LOWER", country)
          ),
          { id: { [db.Sequelize.Op.ne]: id } }
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This country already exists for this organization.");
    }

    const [updated] = await Country.update(
      { country, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Country not found");
    }
  } catch (error) {
    console.error("Update Country Error:", error);
    return sendErrorResponse(res, 500, "Failed to update country");
  }
};

// Delete a country
exports.deleteCountry = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await Country.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Country not found");
    }
  } catch (error) {
    console.error("Delete Country Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete country");
  }
};
