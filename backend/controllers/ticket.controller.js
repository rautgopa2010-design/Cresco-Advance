const { validationResult } = require("express-validator");
const db = require("../models");
const Ticket = db.ticket;
const Employee = db.employee;
const Register = db.register;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { getParentRoles } = require("../utility/roleHelper");

// calculateDelay util (expects dueDate in dd-mm-yyyy)
const calculateDelay = (dueDate, status) => {
  if (status !== "Pending" || !dueDate) return 0;

  // robust parsing
  try {
    const parts = dueDate.split("-");
    if (parts.length !== 3) return 0;
    const [dd, mm, yyyy] = parts;
    const due = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    const today = new Date();
    // normalize to local midnight difference by using UTC time diffs is fine
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch (err) {
    return 0;
  }
};

// Create Ticket
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;

  const {
    createdDate,
    dueDate,
    title,
    assignedTo, // expected array of employee IDs
    service,
    priority,
    status,
    description,
    orderId,
  } = req.body;

  try {
    // validate assignedTo array
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return sendErrorResponse(
        res,
        400,
        "At least one assigned employee is required."
      );
    }

    // check employees exist
    const validEmployees = await Employee.findAll({
      where: { id: assignedTo },
    });
    if (validEmployees.length !== assignedTo.length) {
      return sendErrorResponse(
        res,
        400,
        "One or more assigned employees do not exist."
      );
    }

    // collect role ids from employees (unique)
    const assignedRoleIds = Array.from(
      new Set(validEmployees.map((e) => e.role_id).filter(Boolean))
    );

    const delay = calculateDelay(dueDate, status || "Pending");

    const newTicket = await Ticket.create({
      org_id,
      user_id,
      createdDate,
      dueDate,
      delay,
      title,
      assignedTo,
      assignedRoleIds,
      service,
      priority,
      status: status || "Pending",
      description,
      orderId: orderId ? parseInt(orderId) : null,
    });

    return res.status(201).json({
      message: "Ticket created successfully.",
      ticketId: newTicket.id,
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return sendErrorResponse(res, 500, "Error creating ticket.");
  }
};

// Get All Tickets + visibility + correct provider org name
exports.getAllTickets = async (req, res) => {
  try {
    const { org_id, id: userId, role_id: userRoleId, user_type } = req.user;

    // JOIN Register table ALWAYS for escalated tickets
    const allTickets = await Ticket.findAll({
      where:
        user_type === "provider" ? { escalatedToProvider: true } : { org_id },
      include: [
        {
          model: Register,
          as: "organization",
          attributes: ["company"],
          required: false,
        },
      ],
    });

    // Normalize utility
    const normalize = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return [];
    };

    // FOR PROVIDER → show client company, not Cresco Team
    if (user_type === "provider") {
      const enriched = allTickets.map((ticket) => {
        const delay = calculateDelay(ticket.dueDate, ticket.status);

        return {
          ...ticket.toJSON(),
          assignedTo: [ticket.organization?.company || "Unknown Organization"],
          organization: {
            company: ticket.organization?.company || "Unknown Organization",
          },
          delay,
        };
      });

      return res.status(200).json(enriched.sort((a, b) => b.id - a.id));
    }

    // ORG USERS (normal flow)
    const visibleTickets = [];

    for (const ticket of allTickets) {
      let isVisible = false;

      // 1. Ticket creator
      if (ticket.user_id === userId) isVisible = true;

      // 2. Assigned employee
      const assignedIds = normalize(ticket.assignedTo);
      if (!isVisible && assignedIds.includes(userId)) isVisible = true;

      // 3. Role parent visibility
      const assignedRoleIds = normalize(ticket.assignedRoleIds);
      if (!isVisible && assignedRoleIds.length > 0) {
        for (const r of assignedRoleIds) {
          const parents = await getParentRoles(r, org_id);
          if (parents.includes(userRoleId)) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) visibleTickets.push(ticket);
    }

    // FINAL ENRICH (ORG USERS)
    const enriched = await Promise.all(
      visibleTickets.map(async (ticket) => {
        let assignedNames = [];

        let raw = normalize(ticket.assignedTo);

        if (raw.length > 0) {
          const numeric = raw.every(
            (id) => typeof id === "number" || !isNaN(id)
          );

          if (numeric) {
            const ids = raw.map((id) => parseInt(id));
            const employees = await Employee.findAll({
              where: { id: ids },
              attributes: ["salutation", "firstName", "middleName", "lastName"],
            });

            assignedNames = employees.map((e) =>
              [e.salutation, e.firstName, e.middleName, e.lastName]
                .filter(Boolean)
                .join(" ")
            );
          } else {
            assignedNames = raw;
          }
        }

        const delay = calculateDelay(ticket.dueDate, ticket.status);

        return {
          ...ticket.toJSON(),
          assignedTo: assignedNames,
          delay,
        };
      })
    );

    enriched.sort((a, b) => b.id - a.id);

    return res.status(200).json(enriched);
  } catch (error) {
    console.error("Get Tickets Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch tickets");
  }
};

// Update Ticket
exports.updateTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const { id } = req.params;
  const org_id = req.user.org_id;

  const {
    createdDate,
    dueDate,
    title,
    assignedTo, // optional array
    service,
    priority,
    status,
    description,
    orderId,
  } = req.body;

  try {
    const ticket = await Ticket.findOne({ where: { id, org_id } });
    if (!ticket) return sendErrorResponse(res, 404, "Ticket not found.");

    // if assignedTo provided, validate employees exist and compute assignedRoleIds
    let finalAssignedTo = ticket.assignedTo;
    let assignedRoleIds = ticket.assignedRoleIds || [];

    if (assignedTo !== undefined) {
      if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
        return sendErrorResponse(
          res,
          400,
          "At least one assigned employee is required."
        );
      }

      const validEmployees = await Employee.findAll({
        where: { id: assignedTo },
      });
      if (validEmployees.length !== assignedTo.length) {
        return sendErrorResponse(
          res,
          400,
          "One or more assigned employees do not exist."
        );
      }

      finalAssignedTo = assignedTo;
      assignedRoleIds = Array.from(
        new Set(validEmployees.map((e) => e.role_id).filter(Boolean))
      );
    }

    const finalDueDate = dueDate || ticket.dueDate;
    const finalStatus = status || ticket.status;
    const delay = calculateDelay(finalDueDate, finalStatus);

    await ticket.update({
      createdDate: createdDate ?? ticket.createdDate,
      dueDate: finalDueDate,
      delay,
      title: title ?? ticket.title,
      assignedTo: finalAssignedTo,
      assignedRoleIds,
      service: service ?? ticket.service,
      priority: priority ?? ticket.priority,
      status: finalStatus,
      description: description ?? ticket.description,
      orderId:
        orderId !== undefined
          ? orderId
            ? parseInt(orderId)
            : null
          : ticket.orderId,
    });

    res.status(200).json({ message: "Ticket updated successfully." });
  } catch (error) {
    console.error("Update Ticket Error:", error);
    return sendErrorResponse(res, 500, "Error updating ticket.");
  }
};

// status update
exports.updateTicketStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { status } = req.body;
  const org_id = req.user.org_id;

  try {
    const ticket = await Ticket.findOne({ where: { id, org_id } });
    if (!ticket) {
      return sendErrorResponse(res, 404, "Ticket not found.");
    }

    const delay = calculateDelay(ticket.dueDate, status);

    await ticket.update({
      status,
      delay,
    });

    return res
      .status(200)
      .json({ message: "Ticket status updated successfully." });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    return sendErrorResponse(res, 500, "Error updating ticket status.");
  }
};

// Delete Ticket
exports.deleteTicket = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const ticket = await Ticket.findOne({ where: { id, org_id } });
    if (!ticket) return sendErrorResponse(res, 404, "Ticket not found.");

    await Ticket.destroy({ where: { id } });

    res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Delete Ticket Error:", error);
    return sendErrorResponse(res, 500, "Error deleting ticket.");
  }
};

// Escalate Ticket to CRESCO
exports.escalateTicket = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;
  const user_id = req.user.id;

  try {
    const ticket = await Ticket.findOne({ where: { id, org_id } });
    if (!ticket) return sendErrorResponse(res, 404, "Ticket not found");

    if (ticket.isEscalated)
      return sendErrorResponse(res, 400, "Ticket already escalated");

    // Ensure arrays (avoid storing "[2,5]" string)
    let originalAssignedTo = ticket.assignedTo;
    let originalAssignedRoleIds = ticket.assignedRoleIds;

    // Parse JSON strings if needed
    if (typeof originalAssignedTo === "string") {
      try {
        originalAssignedTo = JSON.parse(originalAssignedTo);
      } catch {}
    }

    if (typeof originalAssignedRoleIds === "string") {
      try {
        originalAssignedRoleIds = JSON.parse(originalAssignedRoleIds);
      } catch {}
    }

    await ticket.update({
      isEscalated: true,
      escalatedToProvider: true,
      escalatedAt: new Date(),
      escalatedBy: user_id,
      status: "Escalated",
      // 🚀 Save CLEAN arrays, not strings
      assignedToBeforeEscalation: originalAssignedTo,
      assignedRoleIdsBeforeEscalation: originalAssignedRoleIds,
      // Overwrite visible assignees
      assignedTo: ["Cresco Team"],
      assignedRoleIds: [],
    });

    return res
      .status(200)
      .json({ message: "Ticket escalated to Cresco successfully" });
  } catch (error) {
    console.error("Escalate Error:", error);
    return sendErrorResponse(res, 500, "Failed to escalate ticket");
  }
};

exports.updateTicketByProvider = async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;   // ← accept remark

  if (!["Pending", "Completed", "Canceled"].includes(status)) {
    return sendErrorResponse(res, 400, "Invalid status");
  }

  try {
    const ticket = await Ticket.findOne({
      where: { id, escalatedToProvider: true },
    });

    if (!ticket) {
      return sendErrorResponse(res, 404, "Escalated ticket not found");
    }

    const delay = calculateDelay(ticket.dueDate, status);

    const updates = {
      status,
      delay,
      remark: remark?.trim() || null,   // store remark (null if empty)
    };

    // ----- PENDING -----
    if (status === "Pending") {
      updates.escalatedToProvider = true;
      updates.isEscalated = true;
      updates.assignedTo = ["Cresco Team"];
      updates.assignedRoleIds = [];
    }

    // ----- COMPLETED / CANCELED -----
    if (status === "Completed" || status === "Canceled") {
      updates.escalatedToProvider = false;
      updates.isEscalated = false;

      let assignedToOriginal = ticket.assignedToBeforeEscalation;
      if (typeof assignedToOriginal === "string") {
        try { assignedToOriginal = JSON.parse(assignedToOriginal); } catch {}
      }

      let assignedRoleIdsOriginal = ticket.assignedRoleIdsBeforeEscalation;
      if (typeof assignedRoleIdsOriginal === "string") {
        try { assignedRoleIdsOriginal = JSON.parse(assignedRoleIdsOriginal); } catch {}
      }

      updates.assignedTo = assignedToOriginal || [];
      updates.assignedRoleIds = assignedRoleIdsOriginal || [];

      updates.escalatedAt = null;
      updates.escalatedBy = null;
      updates.assignedToBeforeEscalation = null;
      updates.assignedRoleIdsBeforeEscalation = null;
    }

    await ticket.update(updates);

    res.status(200).json({
      message: `Ticket ${status.toLowerCase()} successfully by Cresco team`,
    });
  } catch (error) {
    console.error("Provider Update Error:", error);
    return sendErrorResponse(res, 500, "Update failed");
  }
};