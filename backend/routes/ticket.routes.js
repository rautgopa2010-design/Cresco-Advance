const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/ticket.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

const allowProvider = (req, res, next) => {
  if (req.user?.user_type === "provider") {
    return next();
  }
  next();
};

// Validation rules
const ticketValidation = [
  check("createdDate", "Created date is required").notEmpty(),
  check("dueDate", "Due date is required").notEmpty(),
  check("title", "Ticket title is required").notEmpty(),
  check("service", "Service is required").notEmpty(),
  check("priority", "Priority is required").notEmpty(),
  check("description", "Description is required").notEmpty(),
  check("assignedTo", "At least one assigned employee is required").isArray({
    min: 1,
  }),
];

// Routes with permission checks similar to customer module
router.post(
  "/create",
  auth,
  checkPermission("tickets_create"),
  ticketValidation,
  controller.createTicket
);

router.get(
  "/",
  auth,
  allowProvider,
  checkPermission("tickets_view"),
  controller.getAllTickets
);

router.put(
  "/edit/:id",
  auth,
  checkPermission("tickets_edit"),
  ticketValidation,
  controller.updateTicket
);

router.patch(
  "/status/:id",
  auth,
  checkPermission("tickets_edit"),
  [check("status", "Status is required").notEmpty()],
  controller.updateTicketStatus
);

router.delete(
  "/:id",
  auth,
  checkPermission("tickets_delete"),
  controller.deleteTicket
);

router.post(
  "/escalate/:id",
  auth,
  checkPermission("tickets_edit"),
  controller.escalateTicket
);

router.patch(
  "/provider/update/:id",
  auth,
  allowProvider,
  (req, res, next) => {
    if (req.user.user_type !== "provider") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
  controller.updateTicketByProvider
);

module.exports = router;
