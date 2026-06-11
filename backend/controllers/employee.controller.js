const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Register = db.register;
const Users = db.users;
const Employee = db.employee;
const Profile = db.profile;
const CompanySetup = db.companySetup;
const Roles = db.roles;
const { Op } = require("sequelize");
const {
  sendWelcomeEmail,
  sendRoleChangeEmail,
} = require("../utility/employeeEmail");

// Create employee
exports.createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const reqProviderId = req.user.providerId ?? null;
  const {
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    password,
    reportTo,
    role,
    permanentAddress,
    alternateAddress,
  } = req.body;

  try {
    // 🔹 Get company info from register table
    const orgDetails = await Register.findOne({ where: { id: org_id } });
    if (!orgDetails) {
      return sendErrorResponse(res, 404, "Organization not found.");
    }

    const [userEmail, userMobile, empEmail, empMobile] = await Promise.all([
      Users.findOne({ where: { email } }),
      Users.findOne({ where: { mobile } }),
      Employee.findOne({ where: { org_id, email } }),
      Employee.findOne({ where: { org_id, mobile } }),
    ]);
    const countUsers = await Users.count({ where: { org_id } });
    // console.log(orgDetails.packageDetails);
    let packageDetails;
    if (typeof orgDetails.packageDetails === "string") {
      try {
        packageDetails = JSON.parse(orgDetails.packageDetails);
      } catch (error) {
        // Handle parsing error if needed, e.g., keep as string or throw
        packageDetails = orgDetails.packageDetails; // Fallback to original
        console.error("Failed to parse packageDetails:", error);
      }
    } else {
      packageDetails = orgDetails.packageDetails;
    }
    if (packageDetails && packageDetails.maxUsers <= countUsers) {
      return sendErrorResponse(
        res,
        400,
        "You've reached the maximum number of users for your current package. Upgrade to add more!"
      );
    }
    // console.log(countUsers, packageDetails);
    // return;

    if (userEmail || empEmail)
      return sendErrorResponse(res, 400, "Email already exists.");
    if (userMobile || empMobile)
      return sendErrorResponse(res, 400, "Mobile already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!role?.id) {
      return sendErrorResponse(res, 400, "Role ID is required");
    }

    const roleRecord = await Roles.findOne({
      where: {
        id: role.id,
        org_id: org_id, // security: role must belong to this org
      },
      attributes: ["id", "role_name"],
    });

    if (!roleRecord) {
      return sendErrorResponse(
        res,
        400,
        "Invalid role ID or role not found in this organization"
      );
    }

    const roleName = roleRecord.role_name;

    // Create user
    const newUser = await Users.create({
      org_id,
      role_id: role.id,
      providerId: reqProviderId,
      mobile,
      email,
      password: hashedPassword,
    });

    // Create employee
    const newEmployee = await Employee.create({
      org_id,
      role_id: role.id,
      user_id: newUser.id,
      providerId: reqProviderId,
      salutation,
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      password: hashedPassword,
      street: permanentAddress.street,
      state: permanentAddress.state,
      country: permanentAddress.country,
      city: permanentAddress.city,
      pincode: permanentAddress.pincode,
      altStreet: alternateAddress?.street || null,
      altState: alternateAddress?.state || null,
      altCountry: alternateAddress?.country || null,
      altCity: alternateAddress?.city || null,
      altPincode: alternateAddress?.pincode || null,
      reportTo: reportTo || null,
    });

    const fullName = [salutation, firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ");

    await sendWelcomeEmail(
      email,
      fullName,
      roleName,
      orgDetails.company,
      password,
      org_id,
      newUser.id
    );

    // Create profile (🔹 companyName and gstinNumber from Register table)
    const newProfile = await Profile.create({
      org_id,
      role_id: role.id,
      user_id: newUser.id,
      providerId: reqProviderId,
      companyName: orgDetails.company,
      gstinNumber: orgDetails.gstin,
      salutation,
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      permanantStreet: permanentAddress.street,
      permanantCity: permanentAddress.city,
      permanantState: permanentAddress.state,
      permanantPincode: permanentAddress.pincode,
      permanantCountry: permanentAddress.country,
      alternateStreet: alternateAddress?.street || null,
      alternateCity: alternateAddress?.city || null,
      alternateState: alternateAddress?.state || null,
      alternatePincode: alternateAddress?.pincode || null,
      alternateCountry: alternateAddress?.country || null,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Employee created successfully.",
      employeeId: newEmployee.id,
      userId: newUser.id,
      profileId: newProfile.id,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    return sendErrorResponse(res, 500, "Error creating employee.");
  }
};

// Get Employees
exports.getAllEmployees = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    // const employees = await Employee.findAll({ where: { org_id } });
    const employees = await Employee.findAll({
      where: { org_id, isDeleted: false },
    });
    res.status(200).json(employees);
  } catch (err) {
    console.error("Get Employees Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch employees");
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const org_id = req.user.org_id;

  const {
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    reportTo,
    role, // { id, role_name }
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
    // ----------- VALIDATE EMPLOYEE -------------
    const emp = await Employee.findOne({ where: { id, org_id } });
    if (!emp) return sendErrorResponse(res, 404, "Employee not found");

    // Fetch linked user
    const user = await Users.findOne({ where: { id: emp.user_id } });
    if (!user)
      return sendErrorResponse(res, 500, "User record not found for employee");

    // ----------- SUPER ADMIN ROLE LOCK -------------
    const isSuperAdmin = user.role_name === "Super Admin";

    if (isSuperAdmin) {
      // ❌ No one can downgrade or change SA role
      if (role && role.role_name !== "Super Admin") {
        return sendErrorResponse(
          res,
          403,
          "Role of Super Admin cannot be changed"
        );
      }
    }

    // ----------- Get current role name (before any change) -----------
    const currentRoleRecord = await Roles.findOne({
      where: {
        id: user.role_id,
        org_id: org_id,
      },
      attributes: ["id", "role_name"],
    });

    if (!currentRoleRecord) {
      return sendErrorResponse(res, 500, "Current role not found");
    }

    const oldRoleName = currentRoleRecord.role_name;

    // ----------- Determine new role_id -----------
    let newRoleId = user.role_id; // default: no change
    let newRoleName = oldRoleName;

    if (role && role.id) {
      // Validate that the new role belongs to this organization
      const newRoleRecord = await Roles.findOne({
        where: {
          id: role.id,
          org_id: org_id,
        },
        attributes: ["id", "role_name"],
      });

      if (!newRoleRecord) {
        return sendErrorResponse(
          res,
          400,
          "Invalid role ID or role not found in this organization"
        );
      }

      newRoleId = role.id;
      newRoleName = newRoleRecord.role_name;
    }

    // ----------- Check if role is actually changing -----------
    const roleChanged = newRoleId !== user.role_id;

    // ----------- UNIQUENESS CHECK -------------
    const [userEmail, userMobile, empEmail, empMobile] = await Promise.all([
      Users.findOne({
        where: { email, id: { [Op.ne]: user.id } },
      }),
      Users.findOne({
        where: { mobile, id: { [Op.ne]: user.id } },
      }),
      Employee.findOne({
        where: { org_id, email, id: { [Op.ne]: id } },
      }),
      Employee.findOne({
        where: { org_id, mobile, id: { [Op.ne]: id } },
      }),
    ]);

    if (userEmail || empEmail)
      return sendErrorResponse(res, 400, "Email already exists");
    if (userMobile || empMobile)
      return sendErrorResponse(res, 400, "Mobile already exists");

    // ----------- UPDATE REGISTER TABLE -------------
    await Register.update(
      {
        firstName,
        middleName,
        lastName,
        mobile,
        email,
      },
      {
        where: { id: org_id },
      }
    );

    // ----------- UPDATE USERS (NO PASSWORD CHANGE) -------------
    await Users.update(
      {
        mobile,
        email,
        role_id: isSuperAdmin ? user.role_id : role.id, // lock SA role
      },
      { where: { id: user.id } }
    );

    // ----------- UPDATE EMPLOYEE -------------
    await Employee.update(
      {
        role_id: isSuperAdmin ? user.role_id : role.id,
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
        reportTo: reportTo || null,
      },
      { where: { id } }
    );

    // ----------- UPDATE PROFILE -------------
    await Profile.update(
      {
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
        role_id: isSuperAdmin ? user.role_id : role.id,
      },
      { where: { user_id: user.id, org_id } }
    );

    // ----------- UPDATE COMPANY SETUP -------------
    await CompanySetup.update(
      {
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
        role_id: isSuperAdmin ? user.role_id : role.id,
      },
      { where: { user_id: user.id, org_id } }
    );

    if (roleChanged) {
      const companyName =
        (
          await Register.findOne({
            where: { id: org_id },
            attributes: ["company"],
          })
        )?.company || "Your Company";

      const recipientName =
        [salutation, firstName, middleName, lastName]
          .filter(Boolean)
          .join(" ") ||
        email.split("@")[0] ||
        "User";

      // Send email in background (no await - don't block response)
      sendRoleChangeEmail(
        email,
        recipientName,
        oldRoleName,
        newRoleName,
        companyName,
        org_id,
        user.id
      ).catch((err) => {
        console.error("Failed to send role change email:", err);
      });
    }

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err);
    return sendErrorResponse(res, 500, "Failed to update employee");
  }
};

// Soft delete employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    // 🔹 CHECK IF LOGGED-IN USER IS SUPER ADMIN
    const loggedInRole = req.user.role_name?.trim();

    if (loggedInRole !== "Super Admin") {
      return sendErrorResponse(
        res,
        403,
        "Only Super Admin can delete employees"
      );
    }

    // Find employee
    const emp = await Employee.findOne({ where: { id, org_id } });
    if (!emp) return sendErrorResponse(res, 404, "Employee not found");

    // Find user
    const user = await Users.findOne({ where: { id: emp.user_id } });
    if (!user)
      return sendErrorResponse(res, 500, "User record not found for employee");

    // FETCH ROLE FROM ROLES TABLE (CORRECT WAY)
    const role = await Roles.findOne({
      where: {
        id: user.role_id,
        org_id: user.org_id,
      },
    });

    if (!role)
      return sendErrorResponse(res, 500, "Role not found for this user");

    // ROLE VALIDATION
    const roleName = role.role_name?.trim();

    if (roleName === "Super Admin" || roleName === "Super Provider Admin") {
      return sendErrorResponse(res, 403, `${roleName} cannot be deleted`);
    }

    // Soft delete - Users, Employee, Profile
    await Users.update({ isDeleted: true }, { where: { id: emp.user_id } });

    await Employee.update({ isDeleted: true }, { where: { id } });

    await Profile.update(
      { isDeleted: true },
      { where: { user_id: emp.user_id } }
    );

    return res.status(200).json({
      message: "Employee deleted successfully (soft delete).",
    });
  } catch (err) {
    console.error("Soft Delete Employee Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete employee");
  }
};
