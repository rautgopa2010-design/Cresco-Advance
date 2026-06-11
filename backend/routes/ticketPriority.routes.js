const express = require("express");
const { check } = require("express-validator");
const ticketPriorityController = require("../controllers/ticketPriority.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, ticketPriorityController.getTicketPriorities);

router.post(
  "/create",
  auth,
  [
    check("ticketPriority", "Ticket Priority is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  ticketPriorityController.createTicketPriority
);

router.put(
  "/edit/:id",
  auth,
  [
    check("ticketPriority", "Ticket Priority is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  ticketPriorityController.updateTicketPriority
);

router.delete("/:id", auth, ticketPriorityController.deleteTicketPriority);

module.exports = router;
