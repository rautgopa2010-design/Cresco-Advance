const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/orderPayment.controller");
const auth = require("../middleware/auth.middleware");

const paymentValidation = [
  check("paymentId", "Payment schedule ID is required").notEmpty(),
  check("payMode", "Payment mode is required").notEmpty(),
  check("payDate", "Payment date is required").notEmpty(),
  check("amount", "Amount is required").notEmpty(),
];

router.post("/add/:orderId", auth, paymentValidation, controller.addOrderPayment);
router.get("/get/:orderId", auth, controller.getOrderPayments);

module.exports = router;
