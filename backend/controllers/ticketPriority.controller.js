const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const TicketPriority = db.ticketPriority;

// Create a new ticket priority
exports.createTicketPriority = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { ticketPriority, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await TicketPriority.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("ticketPriority")),
            db.Sequelize.fn("LOWER", ticketPriority)
          )
        ]
      }
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This ticket priority already exists for this organization.");
    }

    const result = await TicketPriority.create({ ticketPriority, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Ticket Priority Error:", error);
    return sendErrorResponse(res, 500, "Failed to create ticket priority");
  }
};

// Get all ticket priorities
exports.getTicketPriorities = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const ticketPriorities = await TicketPriority.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(ticketPriorities);
  } catch (error) {
    console.error("Get Ticket Priority Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch ticket Priorities");
  }
};

// Update a ticket Priority
exports.updateTicketPriority = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { ticketPriority, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await TicketPriority.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("ticketPriority")),
            db.Sequelize.fn("LOWER", ticketPriority)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This ticket priority already exists for this organization.");
    }

    const [updated] = await TicketPriority.update(
      { ticketPriority, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Ticket Priority not found");
    }
  } catch (error) {
    console.error("Update Ticket Priority Error:", error);
    return sendErrorResponse(res, 500, "Failed to update ticket priority");
  }
};

// Delete a ticket priority
exports.deleteTicketPriority = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await TicketPriority.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Ticket Priority not found");
    }
  } catch (error) {
    console.error("Delete Ticket Priority Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete ticket priority");
  }
};
