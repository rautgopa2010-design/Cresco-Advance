const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const TicketService = db.ticketService;

// Create a new ticket service
exports.createTicketService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { ticketService, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await TicketService.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("ticketService")),
            db.Sequelize.fn("LOWER", ticketService)
          )
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This ticket service already exists for this organization.");
    }

    const result = await TicketService.create({ ticketService, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Ticket Service Error:", error);
    return sendErrorResponse(res, 500, "Failed to create ticket service");
  }
};

// Get all ticket services
exports.getTicketServices = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const ticketServices = await TicketService.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(ticketServices);
  } catch (error) {
    console.error("Get Ticket Service Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch ticket Services");
  }
};

// Update a ticket Service
exports.updateTicketService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { ticketService, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await TicketService.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("ticketService")),
            db.Sequelize.fn("LOWER", ticketService)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This ticket service already exists for this organization.");
    }

    const [updated] = await TicketService.update(
      { ticketService, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Ticket Service not found");
    }
  } catch (error) {
    console.error("Update Ticket Service Error:", error);
    return sendErrorResponse(res, 500, "Failed to update ticket service");
  }
};

// Delete a ticket service
exports.deleteTicketService = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await TicketService.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Ticket Service not found");
    }
  } catch (error) {
    console.error("Delete Ticket Service Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete ticket service");
  }
};
