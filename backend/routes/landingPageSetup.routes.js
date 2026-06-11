const router = require("express").Router();
const controller = require("../controllers/landingPageSetup.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadLandingImage");

// PUBLIC route - NO auth middleware
router.get("/", controller.getAllLandingPageSetup);

// PROTECTED routes (require authentication)
router.put(
  "/edit",
  auth,
  upload.fields([
    { name: "hero_image", maxCount: 1 },
    { name: "expertise_image", maxCount: 1 },
    { name: "trusted_logos", maxCount: 20 },
    { name: "service_icon", maxCount: 20 },
    { name: "work_image", maxCount: 3 },
    { name: "testimonial_image", maxCount: 20 },
  ]),
  controller.updateLandingPageSetup
);

// Individual removals - protected
router.delete("/trusted-logo/:index", auth, controller.removeTrustedLogo);
router.delete("/service/:index", auth, controller.removeService);
router.delete("/work/:index", auth, controller.removeWork);
router.delete("/testimonial/:index", auth, controller.removeTestimonial);

// Hero image separate - protected
router.post("/upload-hero-image", auth, upload.single("hero_image"), controller.uploadHeroImage);
router.delete("/remove-hero-image", auth, controller.removeHeroImage);

// Expertise image separate - protected
router.post("/upload-expertise-image", auth, upload.single("expertise_image"), controller.uploadExpertiseImage);
router.delete("/remove-expertise-image", auth, controller.removeExpertiseImage);

// About images - upload & remove
router.post("/upload-about-image1", auth, upload.single("about_image1"), controller.uploadAboutImage1);
router.post("/upload-about-image2", auth, upload.single("about_image2"), controller.uploadAboutImage2);
router.post("/upload-about-image3", auth, upload.single("about_image3"), controller.uploadAboutImage3);
router.delete("/remove-about-image/:field", auth, controller.removeAboutImage);

module.exports = router;