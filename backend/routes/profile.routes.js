const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/profile.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadProfileImage");

const profileValidation = [
  check("companyName", "Company name is required").notEmpty(),
  check("salutation", "Salutation is required").notEmpty(),
  check("firstName", "First name is required").notEmpty(),
  check("lastName", "Last name is required").notEmpty(),
  check("mobile", "Mobile number is required").notEmpty(),
  check("email", "Valid email is required").isEmail(),
];

router.get("/", auth, controller.getAllProfile);

router.put(
  "/edit/:id",
  auth,
  upload.single("profileImage"),
  profileValidation,
  controller.updateProfile
);

router.post(
  "/upload-profile-image",
  auth,
  upload.single("profileImage"),
  controller.uploadProfileImage
);

router.delete("/remove-profile-image", auth, controller.removeProfileImage);

module.exports = router;
