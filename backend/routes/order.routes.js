const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/order.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

// ✅ Validation rules
const orderValidation = [
  check("customerPerson", "Customer person is required").notEmpty(),
  check("date", "Date is required").notEmpty(),
  check("productOrderDetails", "Product order details are required").notEmpty(),
  check("finalAmt", "Final amount is required").notEmpty(),
];

// ✅ Routes
router.post(
  "/create",
  auth,
  checkPermission("orders_create"),
  orderValidation,
  controller.createOrder
);

router.get(
  "/",
  auth,
  checkPermission("orders_view"),
  controller.getAllOrders
);

router.patch("/:id/status", auth, controller.updateOrderStatus);

router.put(
  "/edit/:id",
  auth,
  checkPermission("orders_edit"),
  orderValidation,
  controller.updateOrder
);

router.delete(
  "/:id",
  auth,
  checkPermission("orders_delete"),
  controller.deleteOrder
);

module.exports = router;
