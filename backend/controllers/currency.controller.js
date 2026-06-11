const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Currency = db.currency;
const Country = db.country;

// Get all currencies
exports.getCurrencies = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    const currencies = await Currency.findAll({
      where: { org_id },
      include: {
        model: Country,
        attributes: ["id", "country", "date"],
        where: { org_id },
      },
      order: [["id", "DESC"]],
    });

    res.status(200).json(currencies);
  } catch (err) {
    console.error("Get Currencies Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch currencies");
  }
};

// Create currency
exports.createCurrency = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { Country: countryName, currencyCode, symbol, date } = req.body;
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

    const existing = await Currency.findOne({
      where: {
        countryId: country.id,
        org_id,
      },
    });

    if (existing) {
      return sendErrorResponse(res, 409, "Currency already added for this country.");
    }

    const newCurrency = await Currency.create({
      countryId: country.id,
      currencyCode: currencyCode.trim(),
      symbol: symbol.trim(),
      date,
      org_id,
    });

    res.status(201).json(newCurrency);
  } catch (err) {
    console.error("Create Currency Error:", err);
    return sendErrorResponse(res, 500, "Failed to create currency");
  }
};

// Update currency
exports.updateCurrency = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { Country: countryName, currencyCode, symbol, date } = req.body;
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

    const existing = await Currency.findOne({
      where: {
        countryId: country.id,
        org_id,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return sendErrorResponse(res, 409, "Currency already added for this country.");
    }

    const [updated] = await Currency.update(
      {
        countryId: country.id,
        currencyCode: currencyCode.trim(),
        symbol: symbol.trim(),
        date,
        org_id,
      },
      { where: { id, org_id } }
    );

    if (!updated) {
      return sendErrorResponse(res, 404, "Currency not found");
    }

    res.status(200).json({ message: "Currency updated successfully" });
  } catch (err) {
    console.error("Update Currency Error:", err);
    return sendErrorResponse(res, 500, "Failed to update currency");
  }
};

// Delete currency
exports.deleteCurrency = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await Currency.destroy({ where: { id, org_id } });

    if (!deleted) {
      return sendErrorResponse(res, 404, "Currency not found");
    }

    res.status(200).json({ message: "Currency deleted successfully" });
  } catch (err) {
    console.error("Delete Currency Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete currency");
  }
};
