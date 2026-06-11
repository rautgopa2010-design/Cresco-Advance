const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

// Register Route
router.post(
  "/register",
  [
    check("company", "Company name is required").notEmpty(),
    check("firstName", "First name is required").notEmpty(),
    check("email", "Invalid email format").isEmail(),
    check("mobile", "Mobile is required").notEmpty(),
    check("password", "Password is required").notEmpty(),
    check("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  authController.registerCompany
);

// Register Route By Provider
router.post(
  "/register-by-provider",
  [
    check("company", "Company name is required").notEmpty(),
    check("firstName", "First name is required").notEmpty(),
    check("email", "Invalid email format").isEmail(),
    check("mobile", "Mobile is required").notEmpty(),
    check("password", "Password is required").notEmpty(),
    check("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  authController.registerCompanyByProvider
);

// Signin Route
router.post(
  "/signin",
  [
    check("email", "Email is required").notEmpty(),
    check("password", "Password is required").notEmpty(),
  ],
  authController.signin
);

// Select Package Route
router.post("/select-package", auth, authController.selectPackage);

router.post("/create-order", auth, authController.createPaymentOrder);

router.post("/verify-payment", auth, authController.verifyPayment);

router.get("/payment-status/:orderId", auth, authController.getPaymentStatus);

router.post(
  "/toggle-account-activity",
  auth,
  authController.toggleAccountActivity
);

// Get Organization Info
router.get("/organization-info", auth, authController.getOrganizationInfo);

router.post(
  "/forgotPassword",
  check("email", "Email is required").notEmpty(),
  authController.forgotPassword
);

router.post("/verifyResetToken", authController.verifyResetToken);

router.post("/resetPassword", authController.resetPassword);

router.post("/assign-package-by-provider", auth, authController.assignPackageByProvider);

module.exports = router;
