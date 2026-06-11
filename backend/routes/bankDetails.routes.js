const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const bankDetailsController = require("../controllers/bankDetails.controller");

// Validation rules
const bankValidation = [
  body("bankName").notEmpty().withMessage("Bank name is required"),
  body("branchName").notEmpty().withMessage("Branch name is required"),
  body("customerName").notEmpty().withMessage("Customer name is required"),
  body("accountNumber").notEmpty().withMessage("Account number is required"),
  body("ifsc").notEmpty().withMessage("IFSC code is required"),
  body("accountType").notEmpty().withMessage("Account type is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

// Routes
router.post("/", auth, bankValidation, bankDetailsController.createBank);
router.get("/", auth, bankDetailsController.getBanks);
router.get("/:id", auth, bankDetailsController.getBankById);
router.put("/:id", auth, bankValidation, bankDetailsController.updateBank);
router.delete("/:id", auth, bankDetailsController.deleteBank);

module.exports = router;