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

// Update Profile
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) removeFileIfExists(req.file.path);
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const role = req.user.role_name; // ✅ role check

  const {
    companyName,
    gstinNumber,
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
  } = req.body;

  try {
    let newProfileImagePath = null;
    if (req.file) {
      newProfileImagePath = `/uploads/profileImage/${req.file.filename}`;
    }

    // Find old profile
    const oldProfile = await Profile.findOne({
      where: { org_id, user_id },
    });

    // 🔹 Always update Users table (per-user)
    await Users.update({ mobile, email }, { where: { org_id, id: user_id } });

    // 🔹 Always update Employee table (per-user)
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

    // 🔹 Always update Profile table (per-user)
    await Profile.update(
      {
        companyName,
        gstinNumber: gstinNumber && gstinNumber.trim() !== "" ? gstinNumber : null,
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
        ...(newProfileImagePath && { profileImage: newProfileImagePath }),
      },
      { where: { org_id, user_id } }
    );

    // 🔹 Extra updates only if role is Super Admin or Super Provider Admin
    if (role === "Super Admin" || role === "Super Provider Admin") {
      // Update Register (org-level)
      await Register.update(
        {
          company: companyName,
          firstName,
          middleName,
          lastName,
          mobile,
          email,
        },
        { where: { id: org_id } }
      );

      // Update CompanySetup (org-level)
      await CompanySetup.update(
        {
          companyName,
          gstinNumber: gstinNumber && gstinNumber.trim() !== "" ? gstinNumber : null,
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
        { where: { org_id } } // ⚠️ company setup is org-wide, so only org_id
      );
    }

    // If new profile image uploaded, remove old one after DB success
    if (newProfileImagePath && oldProfile && oldProfile.profileImage) {
      const oldImagePath = getAbsoluteUploadPath(oldProfile.profileImage);
      removeFileIfExists(oldImagePath);
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    if (req.file) removeFileIfExists(req.file.path); // rollback new profile image
    console.error("Update Profile Error:", err);
    return sendErrorResponse(res, 500, "Failed to profile setup");
  }
};

// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No profile image uploaded" });
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const newProfileImagePath = `/uploads/profileImage/${req.file.filename}`;

  try {
    const profile = await Profile.findOne({ where: { org_id, user_id } });
    if (!profile) {
      removeFileIfExists(req.file.path);
      return res.status(404).json({ message: "Profile not found" });
    }

    // Delete old logo
    if (profile.profileImage) {
      const oldPath = getAbsoluteUploadPath(profile.profileImage);
      removeFileIfExists(oldPath);
    }

    // Save new logo
    await Profile.update(
      { profileImage: newProfileImagePath },
      { where: { org_id, user_id } }
    );

    res
      .status(200)
      .json({ message: "Profile Image uploaded successfully", logo: newProfileImagePath });
  } catch (err) {
    removeFileIfExists(req.file.path);
    console.error("Upload Profile Image Error:", err);
    res
      .status(500)
      .json({ message: "Failed to upload logo", error: err.message });
  }
};

// Remove Profile Image
exports.removeProfileImage = async (req, res) => {
  const org_id = req.user.org_id;
  const user_id = req.user.id;

  try {
    const profile = await Profile.findOne({ where: { org_id, user_id } });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.profileImage) {
      const oldPath = getAbsoluteUploadPath(profile.profileImage);
      removeFileIfExists(oldPath);
    }

    await Profile.update(
      { profileImage: null },
      { where: { org_id, user_id } }
    );

    res.status(200).json({ message: "Profile Image removed successfully" });
  } catch (err) {
    console.error("Remove Profile Image Error:", err);
    res
      .status(500)
      .json({ message: "Failed to remove profile image", error: err.message });
  }
};

// Get Profile
exports.getAllProfile = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    const profile = await Profile.findOne({ where: { org_id, user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: "No profile found" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error("Get Profile Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch profile");
  }
};
