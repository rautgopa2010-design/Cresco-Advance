const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Zones = db.zones;
const Country = db.country;

// Create zones
exports.createZones = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { countryId, zones, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Zones.findOne({ where: { countryId, org_id } });
    if (existing) {
      return sendErrorResponse(res, 400, "Zones already exist for this country.");
    }

    const zonesStr = zones.map(z => z.trim()).join(", ");
    const entry = await Zones.create({ countryId, zones: zonesStr, date, org_id });

    res.status(201).json(entry);
  } catch (err) {
    console.error("Create Zones Error:", err);
    return sendErrorResponse(res, 500, "Failed to create zones.");
  }
};

// Get all zones
exports.getAllZones = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const result = await Zones.findAll({
      where: { org_id },
      include: [{ model: Country, where: { org_id }, attributes: ["id", "country", "date"] }],
      order: [["id", "ASC"]],
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Get Zones Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch zones.");
  }
};

// Update zones
exports.updateZones = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { countryId, zones, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await Zones.findOne({
      where: {
        countryId,
        org_id,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "Zones already exist for this country.");
    }

    const zonesStr = zones.map(z => z.trim()).join(", ");
    const updated = await Zones.update(
      { countryId, zones: zonesStr, date },
      { where: { id, org_id } }
    );

    if (updated[0] === 0) {
      return sendErrorResponse(res, 404, "Zones not found");
    }

    res.status(200).json({ message: "Zones updated successfully" });
  } catch (err) {
    console.error("Update Zones Error:", err);
    return sendErrorResponse(res, 500, "Failed to update zones.");
  }
};

// Delete zones
exports.deleteZones = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await Zones.destroy({ where: { id, org_id } });
    if (deleted) {
      res.status(200).json({ message: "Zones deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Zones not found");
    }
  } catch (err) {
    console.error("Delete Zones Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete zones.");
  }
};
