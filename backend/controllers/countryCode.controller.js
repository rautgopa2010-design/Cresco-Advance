const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const CountryCode = db.countryCode;
const Country = db.country;

// Get all country codes
exports.getCountryCodes = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const codes = await CountryCode.findAll({
      where: { org_id },
      include: {
        model: Country,
        attributes: ["id", "country", "date"],
      },
      order: [["id", "DESC"]],
    });

    res.status(200).json(codes);
  } catch (error) {
    console.error("Get Country Codes Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch country codes");
  }
};

// Create country code
exports.createCountryCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { Country: countryName, countryCode, phoneCode, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const country = await Country.findOne({
      where: {
        country: countryName.trim(),
        org_id,
      },
    });

    if (!country) {
      return sendErrorResponse(res, 404, `Country "${countryName}" not found.`);
    }

    const existing = await CountryCode.findOne({
      where: {
        countryId: country.id,
        org_id,
      },
    });

    if (existing) {
      return sendErrorResponse(res, 409, "Country code already added for this country.");
    }

    const newCountryCode = await CountryCode.create({
      countryId: country.id,
      countryCode: countryCode.trim(),
      phoneCode: phoneCode?.trim(),
      date,
      org_id,
    });

    res.status(201).json(newCountryCode);
  } catch (error) {
    console.error("Create Country Code Error:", error);
    return sendErrorResponse(res, 500, "Failed to create country code");
  }
};

// Update country code
exports.updateCountryCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { Country: countryName, countryCode, phoneCode, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const country = await Country.findOne({
      where: {
        country: countryName.trim(),
        org_id,
      },
    });

    if (!country) {
      return sendErrorResponse(res, 404, `Country "${countryName}" not found.`);
    }

    const existing = await CountryCode.findOne({
      where: {
        countryId: country.id,
        org_id,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return sendErrorResponse(res, 409, "Country code already added for this country.");
    }

    const [updated] = await CountryCode.update(
      {
        countryId: country.id,
        countryCode: countryCode.trim(),
        phoneCode: phoneCode?.trim(),
        date,
        org_id,
      },
      { where: { id, org_id } }
    );

    if (!updated) {
      return sendErrorResponse(res, 404, "Country code not found");
    }

    res.status(200).json({ message: "Country code updated successfully" });
  } catch (error) {
    console.error("Update Country Code Error:", error);
    return sendErrorResponse(res, 500, "Failed to update country code");
  }
};

// Delete country code
exports.deleteCountryCode = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await CountryCode.destroy({ where: { id, org_id } });

    if (!deleted) {
      return sendErrorResponse(res, 404, "Country code not found");
    }

    res.status(200).json({ message: "Country code deleted successfully" });
  } catch (error) {
    console.error("Delete Country Code Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete country code");
  }
};
