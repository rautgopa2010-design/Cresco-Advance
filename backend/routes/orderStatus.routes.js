const express = require("express");
const { check } = require("express-validator");
const orderStatusController = require("../controllers/orderStatus.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, orderStatusController.getOrderStatus);

router.post(
  "/create",
  auth,
  [
    check("orderStatus", "Order Status is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  orderStatusController.createOrderStatus
);

router.put(
  "/edit/:id",
  auth,
  [
    check("orderStatus", "Order Status is required").notEmpty(),
    check("date", "Date is required").notEmpty(),
  ],
  orderStatusController.updateOrderStatus
);

router.delete("/:id", auth, orderStatusController.deleteOrderStatus);

module.exports = router;
