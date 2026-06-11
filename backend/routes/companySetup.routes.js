const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/companySetup.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadCompanyLogo");

const companySetupValidation = [
  check("companyName", "Company name is required").notEmpty(),
  check("salutation", "Salutation is required").notEmpty(),
  check("firstName", "First name is required").notEmpty(),
  check("lastName", "Last name is required").notEmpty(),
  check("mobile", "Mobile number is required").notEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("supportedMobile", "Support mobile is required").notEmpty(),
  check("supportedEmail", "Valid support email is required").isEmail(),
];

router.get("/", auth, controller.getAllCompanySetup);

router.put(
  "/edit/:id",
  auth,
  upload.single("companyLogo"),
  companySetupValidation,
  controller.updateCompanySetup
);

router.post(
  "/upload-logo",
  auth,
  upload.single("companyLogo"),
  controller.uploadCompanyLogo
);

router.delete("/remove-logo", auth, controller.removeCompanyLogo);

router.get("/public/:companySlug", controller.getPublicCompanySetup);
module.exports = router;
