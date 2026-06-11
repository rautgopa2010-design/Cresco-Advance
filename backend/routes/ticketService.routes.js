const express = require("express");
const { check } = require("express-validator");
const ticketServiceController = require("../controllers/ticketService.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, ticketServiceController.getTicketServices);

router.post(
  "/create",
  auth,
  [
    check("ticketService", "Ticket Service is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  ticketServiceController.createTicketService
);

router.put(
  "/edit/:id",
  auth,
  [
    check("ticketService", "Ticket Service is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  ticketServiceController.updateTicketService
);

router.delete("/:id", auth, ticketServiceController.deleteTicketService);

module.exports = router;
