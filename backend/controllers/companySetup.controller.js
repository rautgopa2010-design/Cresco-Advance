const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Register = db.register;
const Users = db.users;
const Employee = db.employee;
const Profile = db.profile;
const CompanySetup = db.companySetup;
const IncentiveFormulaMaster = db.incentiveFormulaMaster;

// Utility: remove file if exists
const removeFileIfExists = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Build absolute path to uploads root (always project root)
const getAbsoluteUploadPath = (relativePath) => {
  return path.join(process.cwd(), relativePath);
};

// Update Company Setup
exports.updateCompanySetup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) removeFileIfExists(req.file.path);
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const { fixedRate, slabs, bonusAmount, incentivePartition } = req.body; // ✅ Added incentivePartition

  const {
    companyName,
    gstinNumber,
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    supportedMobile,
    supportedEmail,
    permanantStreet,
    permanantCity,
    permanantState,
    permanantPincode,
    permanantCountry,
    alternateStreet,
    alternateCity,
    alternateState,
    alternatePincode,
    alternateCountry,
  } = req.body;

  try {
    let newLogoPath = null;
    if (req.file) {
      newLogoPath = `/uploads/companyLogo/${req.file.filename}`;
    }

    const oldCompany = await CompanySetup.findOne({
      where: { org_id, user_id },
    });

    // ✅ Standard updates (no change)
    await Register.update(
      { company: companyName, firstName, middleName, lastName, mobile, email },
      { where: { id: org_id } }
    );
    await Users.update({ mobile, email }, { where: { org_id, id: user_id } });
    await Employee.update(
      {
        salutation,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        street: permanantStreet,
        state: permanantState,
        country: permanantCountry,
        city: permanantCity,
        pincode: permanantPincode,
        altStreet: alternateStreet,
        altState: alternateState,
        altCountry: alternateCountry,
        altCity: alternateCity,
        altPincode: alternatePincode,
      },
      { where: { org_id, user_id } }
    );
    await Profile.update(
      {
        companyName,
        gstinNumber:
          gstinNumber && gstinNumber.trim() !== "" ? gstinNumber : null,
        salutation,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        permanantStreet,
        permanantCity,
        permanantState,
        permanantPincode,
        permanantCountry,
        alternateStreet,
        alternateCity,
        alternateState,
        alternatePincode,
        alternateCountry,
      },
      { where: { org_id, user_id } }
    );

    // Helper to generate company slug
    const generateCompanySlug = (companyName, orgId) => {
      if (!companyName || !orgId) return null;
      const cleaned = companyName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing -
      return `${cleaned}-${orgId}`;
    };

    await CompanySetup.update(
      {
        companyName,
        gstinNumber:
          gstinNumber && gstinNumber.trim() !== "" ? gstinNumber : null,
        salutation,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        supportedMobile,
        supportedEmail,
        permanantStreet,
        permanantCity,
        permanantState,
        permanantPincode,
        permanantCountry,
        alternateStreet,
        alternateCity,
        alternateState,
        alternatePincode,
        alternateCountry,
        ...(newLogoPath && { companyLogo: newLogoPath }),
        companySlug: generateCompanySlug(companyName, org_id),
      },
      { where: { org_id, user_id } }
    );

    if (newLogoPath && oldCompany && oldCompany.companyLogo) {
      const oldImagePath = getAbsoluteUploadPath(oldCompany.companyLogo);
      removeFileIfExists(oldImagePath);
    }

    // ✅ FORMULAS (for Super Admin only)
    if (
      req.user.role_name === "Super Admin" &&
      req.user.user_type === "company"
    ) {
      // --- Auto-create LandingPageSetup with default values if not exists ---
      const existingLandingSetup = await db.landingPageSetup.findOne({
        where: { org_id },
      });

      if (!existingLandingSetup) {
        await db.landingPageSetup.create({
          org_id,
          // All other fields will use model-defined defaultValues automatically
        });
        console.log(
          `LandingPageSetup created with defaults for org_id: ${org_id}`
        );
      }

      // --- Fixed ---
      if (fixedRate) {
        const existing = await IncentiveFormulaMaster.findOne({
          where: { org_id, formula_type: "fixed" },
        });
        if (existing)
          await existing.update({
            formula_config: { rate: Number(fixedRate) / 100 },
          });
        else
          await IncentiveFormulaMaster.create({
            org_id,
            formula_type: "fixed",
            formula_config: { rate: Number(fixedRate) / 100 },
          });
      }

      // --- Slab ---
      let parsedSlabs = [];
      if (slabs) {
        try {
          parsedSlabs = typeof slabs === "string" ? JSON.parse(slabs) : slabs;
        } catch (err) {
          console.error("Invalid slabs JSON:", slabs);
        }

        if (parsedSlabs.length > 0) {
          const existing = await IncentiveFormulaMaster.findOne({
            where: { org_id, formula_type: "slab" },
          });
          if (existing)
            await existing.update({ formula_config: { slabs: parsedSlabs } });
          else
            await IncentiveFormulaMaster.create({
              org_id,
              formula_type: "slab",
              formula_config: { slabs: parsedSlabs },
            });
        }
      }

      // --- Bonus ---
      if (bonusAmount) {
        const existing = await IncentiveFormulaMaster.findOne({
          where: { org_id, formula_type: "bonus" },
        });
        if (existing)
          await existing.update({
            formula_config: { bonus: Number(bonusAmount) },
          });
        else
          await IncentiveFormulaMaster.create({
            org_id,
            formula_type: "bonus",
            formula_config: { bonus: Number(bonusAmount) },
          });
      }

      // --- Partition (NEW) ---
      if (incentivePartition) {
        let parsedPartition;
        try {
          parsedPartition =
            typeof incentivePartition === "string"
              ? JSON.parse(incentivePartition)
              : incentivePartition;

          if (
            !parsedPartition ||
            typeof parsedPartition !== "object" ||
            Array.isArray(parsedPartition)
          ) {
            return sendErrorResponse(
              res,
              400,
              "Invalid incentive partition format"
            );
          }
        } catch (err) {
          console.error("Invalid partition JSON:", incentivePartition);
          return sendErrorResponse(
            res,
            400,
            "Invalid incentive partition format"
          );
        }

        // Validate each role's sum = 100%
        for (let roleName in parsedPartition) {
          const row = parsedPartition[roleName];
          const total = Object.values(row)
            .map((v) => Number(v) || 0)
            .reduce((a, b) => a + b, 0);
          if (total !== 100) {
            return sendErrorResponse(
              res,
              400,
              `Incentive partition for role "${roleName}" must sum to 100%`
            );
          }
        }

        // Save in DB directly as object
        const existing = await IncentiveFormulaMaster.findOne({
          where: { org_id, formula_type: "partition" },
        });
        if (existing)
          await existing.update({ formula_config: parsedPartition });
        else
          await IncentiveFormulaMaster.create({
            org_id,
            formula_type: "partition",
            formula_config: parsedPartition,
          });
      }
    }

    res.status(200).json({ message: "Company setup updated successfully" });
  } catch (err) {
    if (req.file) removeFileIfExists(req.file.path);
    console.error("Update Company Setup Error:", err);
    return sendErrorResponse(res, 500, "Failed to update company setup");
  }
};

// Upload Company Logo
exports.uploadCompanyLogo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No logo uploaded" });
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const newLogoPath = `/uploads/companyLogo/${req.file.filename}`;

  try {
    const company = await CompanySetup.findOne({ where: { org_id, user_id } });
    if (!company) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Company not found" });
    }

    // Delete old logo
    if (company.companyLogo) {
      const oldPath = getAbsoluteUploadPath(company.companyLogo);
      removeFileIfExists(oldPath);
    }

    // Save new logo
    await CompanySetup.update(
      { companyLogo: newLogoPath },
      { where: { org_id, user_id } }
    );

    res
      .status(200)
      .json({ message: "Logo uploaded successfully", logo: newLogoPath });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error("Upload Logo Error:", err);
    res
      .status(500)
      .json({ message: "Failed to upload logo", error: err.message });
  }
};

// Remove Company Logo
exports.removeCompanyLogo = async (req, res) => {
  const org_id = req.user.org_id;
  const user_id = req.user.id;

  try {
    const company = await CompanySetup.findOne({ where: { org_id, user_id } });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.companyLogo) {
      const oldPath = getAbsoluteUploadPath(company.companyLogo);
      removeFileIfExists(oldPath);
    }

    await CompanySetup.update(
      { companyLogo: null },
      { where: { org_id, user_id } }
    );

    res.status(200).json({ message: "Logo removed successfully" });
  } catch (err) {
    console.error("Remove Logo Error:", err);
    res
      .status(500)
      .json({ message: "Failed to remove logo", error: err.message });
  }
};

// ✅ Safe JSON parser
const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    if (typeof value === "object") {
      return value;
    }
    return fallback;
  } catch (err) {
    return fallback;
  }
};

// ✅ Get Company Setups
exports.getAllCompanySetup = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    const companySetup = await CompanySetup.findOne({
      where: { org_id },
      include: [{ model: IncentiveFormulaMaster, as: "formulas" }],
    });

    if (!companySetup) {
      return res.status(404).json({ message: "No company setup found" });
    }

    // 🔥 Ensure formula_config is always an object
    const transformedCompanySetup = {
      ...companySetup.toJSON(),
      formulas: companySetup.formulas.map((formula) => ({
        ...formula.toJSON(),
        formula_config: parseJSON(formula.formula_config, {}),
      })),
    };

    res.status(200).json(transformedCompanySetup);
  } catch (err) {
    console.error("Get Company Setup Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch company setup");
  }
};

// Get Public Company Setup by Slug (PUBLIC - no auth)
exports.getPublicCompanySetup = async (req, res) => {
  const { companySlug } = req.params;

  if (!companySlug) {
    return sendErrorResponse(res, 400, "Company slug is required");
  }

  try {
    const companySetup = await CompanySetup.findOne({
      where: { companySlug },
      include: [{ model: IncentiveFormulaMaster, as: "formulas" }], // if needed later
    });

    if (!companySetup) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Safe parse formulas (same as getAllCompanySetup)
    const transformed = {
      ...companySetup.toJSON(),
      formulas:
        companySetup.formulas?.map((f) => ({
          ...f.toJSON(),
          formula_config: parseJSON(f.formula_config, {}),
        })) || [],
    };

    res.status(200).json(transformed);
  } catch (err) {
    console.error("Get Public Company Setup Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch company setup");
  }
};
