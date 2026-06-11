const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const LandingPageSetup = db.landingPageSetup;

// Utility functions
const removeFileIfExists = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getAbsoluteUploadPath = (relativePath) => {
  return path.join(process.cwd(), relativePath);
};

const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch (err) {
    return fallback;
  }
};

// Get Landing Page Setup - PUBLIC
exports.getAllLandingPageSetup = async (req, res) => {
  const org_id = req.query.org_id;

  if (!org_id) {
    return res
      .status(400)
      .json({ message: "org_id query parameter is required" });
  }

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      return res.status(404).json({ message: "Landing page setup not found" });
    }

    const transformed = {
      ...setup.toJSON(),
      trusted_logos: parseJSON(setup.trusted_logos, []),
      services: parseJSON(setup.services, []),
      approach_steps: parseJSON(setup.approach_steps, []),
      works: parseJSON(setup.works, []),
      testimonials: parseJSON(setup.testimonials, []),
      problems_list: parseJSON(setup.problems_list, []),
      customer_notice_list: parseJSON(setup.customer_notice_list, []),
      trust_points: parseJSON(setup.trust_points, []),
    };

    res.status(200).json(transformed);
  } catch (err) {
    console.error("Get Landing Page Setup Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch landing page setup");
  }
};

// Update Landing Page Setup - FULL COVERAGE
exports.updateLandingPageSetup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => removeFileIfExists(file.path));
    }
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;

  try {
    const files = req.files || {};

    // Handle new uploaded files
    const newTrustedLogos = (files.trusted_logos || []).map(
      (f) => `/uploads/landing/${f.filename}`
    );

    const newServiceIcons = (files.service_icon || []).reduce((acc, f, i) => {
      acc[i] = `/uploads/landing/${f.filename}`;
      return acc;
    }, {});

    const newWorkImages = (files.work_image || []).reduce((acc, f, i) => {
      acc[i] = `/uploads/landing/${f.filename}`;
      return acc;
    }, {});

    const newTestimonialImages = (files.testimonial_image || []).reduce(
      (acc, f, i) => {
        acc[i] = `/uploads/landing/${f.filename}`;
        return acc;
      },
      {}
    );

    let newHeroImagePath = null;
    if (files.hero_image && files.hero_image[0]) {
      newHeroImagePath = `/uploads/landing/${files.hero_image[0].filename}`;
    }

    let newExpertiseImagePath = null;
    if (files.expertise_image && files.expertise_image[0]) {
      newExpertiseImagePath = `/uploads/landing/${files.expertise_image[0].filename}`;
    }

    const oldSetup = await LandingPageSetup.findOne({ where: { org_id } });

    // Delete old hero image if replaced
    if (newHeroImagePath && oldSetup?.hero_image) {
      removeFileIfExists(getAbsoluteUploadPath(oldSetup.hero_image));
    }

    // Delete old expertise image if replaced
    if (newExpertiseImagePath && oldSetup?.expertise_image) {
      removeFileIfExists(getAbsoluteUploadPath(oldSetup.expertise_image));
    }

    // Parse existing JSON fields (for fallback image paths)
    const currentTrustedLogos = parseJSON(oldSetup?.trusted_logos, []);
    const currentServices = parseJSON(oldSetup?.services, []);
    const currentWorks = parseJSON(oldSetup?.works, []);
    const currentTestimonials = parseJSON(oldSetup?.testimonials, []);

    // === FIXED: Parse incoming text data from frontend ===
    const incomingServices = parseJSON(req.body.services, []);
    const incomingWorks = parseJSON(req.body.works, []);
    const incomingTestimonials = parseJSON(req.body.testimonials, []);

    // Update trusted logos (append new ones)
    const updatedTrustedLogos = [...currentTrustedLogos, ...newTrustedLogos];

    // Merge: Use latest text from frontend + preserve old image if no new upload
    const updatedServices = incomingServices.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: newServiceIcons[i] || currentServices[i]?.icon || null,
    }));

    const updatedWorks = incomingWorks.map((w, i) => ({
      title: w.title,
      description: w.description,
      image: newWorkImages[i] || currentWorks[i]?.image || null,
    }));

    const updatedTestimonials = incomingTestimonials.map((t, i) => ({
      name: t.name,
      role: t.role,
      company: t.company,
      quote: t.quote,
      image: newTestimonialImages[i] || currentTestimonials[i]?.image || null,
    }));

    // Full update data including ALL editable fields
    const updateData = {
      org_id,

      // Hero Section
      hero_headline: req.body.hero_headline,
      hero_subtext: req.body.hero_subtext,
      hero_image: newHeroImagePath || oldSetup?.hero_image || null,

      // Expertise Section
      expertise_title: req.body.expertise_title,
      expertise_description: req.body.expertise_description,
      expertise_image: newExpertiseImagePath || oldSetup?.expertise_image || null,

      // Trusted Logos
      trusted_logos: updatedTrustedLogos,

      // Services Section
      services_desc: req.body.services_desc,
      services: updatedServices,

      // About Us Section
      about_hero_title: req.body.about_hero_title,
      about_hero_desc: req.body.about_hero_desc,

      problems_title: req.body.problems_title,
      problems_list: parseJSON(
        req.body.problems_list,
        oldSetup?.problems_list || []
      ),

      approach_steps: parseJSON(
        req.body.approach_steps,
        oldSetup?.approach_steps || []
      ),

      customer_notice_title: req.body.customer_notice_title,
      customer_notice_list: parseJSON(
        req.body.customer_notice_list,
        oldSetup?.customer_notice_list || []
      ),

      trust_title: req.body.trust_title,
      trust_text: req.body.trust_text,
      trust_points: parseJSON(
        req.body.trust_points,
        oldSetup?.trust_points || []
      ),

      about_cta_text: req.body.about_cta_text,

      // Works Section
      works_desc: req.body.works_desc,
      works: updatedWorks,

      // Testimonials Section
      testimonials_title: req.body.testimonials_title,
      testimonials_subtext: req.body.testimonials_subtext,
      testimonials: updatedTestimonials,

      // Stats
      stats_satisfaction: req.body.stats_satisfaction
        ? parseInt(req.body.stats_satisfaction)
        : oldSetup?.stats_satisfaction,
      stats_worldwide: req.body.stats_worldwide
        ? parseInt(req.body.stats_worldwide)
        : oldSetup?.stats_worldwide,
      stats_adoption: req.body.stats_adoption
        ? parseInt(req.body.stats_adoption)
        : oldSetup?.stats_adoption,
    };

    await LandingPageSetup.upsert(updateData, { where: { org_id } });

    res
      .status(200)
      .json({ message: "Landing page setup updated successfully" });
  } catch (err) {
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => removeFileIfExists(file.path));
    }
    console.error("Update Landing Page Setup Error:", err);
    return sendErrorResponse(res, 500, "Failed to update landing page setup");
  }
};

// Remove trusted logo
exports.removeTrustedLogo = async (req, res) => {
  const { index } = req.params;
  const org_id = req.user.org_id;
  const idx = parseInt(index);

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) return res.status(404).json({ message: "Setup not found" });

    const logos = parseJSON(setup.trusted_logos, []);
    if (idx < 0 || idx >= logos.length)
      return res.status(400).json({ message: "Invalid index" });

    const removedPath = logos[idx];
    removeFileIfExists(getAbsoluteUploadPath(removedPath));

    logos.splice(idx, 1);
    await setup.update({ trusted_logos: logos });

    res.status(200).json({ message: "Logo removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove logo" });
  }
};

// Remove service
exports.removeService = async (req, res) => {
  const { index } = req.params;
  const org_id = req.user.org_id;
  const idx = parseInt(index);

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) return res.status(404).json({ message: "Setup not found" });

    const services = parseJSON(setup.services, []);
    if (idx < 0 || idx >= services.length)
      return res.status(400).json({ message: "Invalid index" });

    const iconPath = services[idx].icon;
    if (iconPath) removeFileIfExists(getAbsoluteUploadPath(iconPath));

    services.splice(idx, 1);
    await setup.update({ services });

    res.status(200).json({ message: "Service removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove service" });
  }
};

// Remove work
exports.removeWork = async (req, res) => {
  const { index } = req.params;
  const org_id = req.user.org_id;
  const idx = parseInt(index);

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) return res.status(404).json({ message: "Setup not found" });

    const works = parseJSON(setup.works, []);
    if (idx < 0 || idx >= works.length)
      return res.status(400).json({ message: "Invalid index" });

    const imagePath = works[idx].image;
    if (imagePath) removeFileIfExists(getAbsoluteUploadPath(imagePath));

    works.splice(idx, 1);
    await setup.update({ works });

    res.status(200).json({ message: "Work removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove work" });
  }
};

// Remove testimonial
exports.removeTestimonial = async (req, res) => {
  const { index } = req.params;
  const org_id = req.user.org_id;
  const idx = parseInt(index);

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) return res.status(404).json({ message: "Setup not found" });

    const testimonials = parseJSON(setup.testimonials, []);
    if (idx < 0 || idx >= testimonials.length)
      return res.status(400).json({ message: "Invalid index" });

    const imagePath = testimonials[idx].image;
    if (imagePath) removeFileIfExists(getAbsoluteUploadPath(imagePath));

    testimonials.splice(idx, 1);
    await setup.update({ testimonials });

    res.status(200).json({ message: "Testimonial removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove testimonial" });
  }
};

// Upload Hero Image Separately
exports.uploadHeroImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const org_id = req.user.org_id;
  const newImagePath = `/uploads/landing/${req.file.filename}`;

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Landing page setup not found" });
    }

    if (setup.hero_image) {
      removeFileIfExists(getAbsoluteUploadPath(setup.hero_image));
    }

    await setup.update({ hero_image: newImagePath });

    res.status(200).json({
      message: "Hero image uploaded successfully",
      hero_image: newImagePath,
    });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error("Upload Hero Image Error:", err);
    res.status(500).json({ message: "Failed to upload hero image" });
  }
};

// Remove Hero Image
exports.removeHeroImage = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      return res.status(404).json({ message: "Landing page setup not found" });
    }

    if (setup.hero_image) {
      removeFileIfExists(getAbsoluteUploadPath(setup.hero_image));
    }

    await setup.update({ hero_image: null });

    res.status(200).json({ message: "Hero image removed successfully" });
  } catch (err) {
    console.error("Remove Hero Image Error:", err);
    res.status(500).json({ message: "Failed to remove hero image" });
  }
};

// Upload Expertise Image Separately
exports.uploadExpertiseImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }
  const org_id = req.user.org_id;
  const newImagePath = `/uploads/landing/${req.file.filename}`;

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Landing page setup not found" });
    }
    if (setup.expertise_image) {
      removeFileIfExists(getAbsoluteUploadPath(setup.expertise_image));
    }
    await setup.update({ expertise_image: newImagePath });
    res.status(200).json({
      message: "Expertise image uploaded successfully",
      expertise_image: newImagePath,
    });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error("Upload Expertise Image Error:", err);
    res.status(500).json({ message: "Failed to upload expertise image" });
  }
};

// Remove Expertise Image
exports.removeExpertiseImage = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      return res.status(404).json({ message: "Landing page setup not found" });
    }
    if (setup.expertise_image) {
      removeFileIfExists(getAbsoluteUploadPath(setup.expertise_image));
    }
    await setup.update({ expertise_image: null });
    res.status(200).json({ message: "Expertise image removed successfully" });
  } catch (err) {
    console.error("Remove Expertise Image Error:", err);
    res.status(500).json({ message: "Failed to remove expertise image" });
  }
};

// Upload About Image 1
exports.uploadAboutImage1 = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const org_id = req.user.org_id;
  const newPath = `/uploads/landing/${req.file.filename}`;

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Setup not found" });
    }

    if (setup.about_image1) {
      removeFileIfExists(getAbsoluteUploadPath(setup.about_image1));
    }

    await setup.update({ about_image1: newPath });
    res.json({ message: "About image 1 uploaded", about_image1: newPath });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// Upload About Image 2
exports.uploadAboutImage2 = async (req, res) => {
  // Same as above, just change field name
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const org_id = req.user.org_id;
  const newPath = `/uploads/landing/${req.file.filename}`;

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Setup not found" });
    }

    if (setup.about_image2) {
      removeFileIfExists(getAbsoluteUploadPath(setup.about_image2));
    }

    await setup.update({ about_image2: newPath });
    res.json({ message: "About image 2 uploaded", about_image2: newPath });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// Upload About Image 3
exports.uploadAboutImage3 = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const org_id = req.user.org_id;
  const newPath = `/uploads/landing/${req.file.filename}`;

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Setup not found" });
    }

    if (setup.about_image3) {
      removeFileIfExists(getAbsoluteUploadPath(setup.about_image3));
    }

    await setup.update({ about_image3: newPath });
    res.json({ message: "About image 3 uploaded", about_image3: newPath });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// Remove About Images (generic or separate)
exports.removeAboutImage = async (req, res) => {
  const { field } = req.params; // '1', '2', or '3'
  const org_id = req.user.org_id;

  const fieldMap = {
    1: "about_image1",
    2: "about_image2",
    3: "about_image3",
  };

  const dbField = fieldMap[field];
  if (!dbField) return res.status(400).json({ message: "Invalid image field" });

  try {
    const setup = await LandingPageSetup.findOne({ where: { org_id } });
    if (!setup || !setup[dbField]) {
      return res.status(404).json({ message: "Image not found" });
    }

    removeFileIfExists(getAbsoluteUploadPath(setup[dbField]));
    await setup.update({ [dbField]: null });

    res.json({ message: `About image ${field} removed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove image" });
  }
};
