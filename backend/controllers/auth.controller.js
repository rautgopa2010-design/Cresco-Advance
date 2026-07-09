const { validationResult } = require("express-validator");
const Razorpay = require("razorpay");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { createDefaultModules } = require("../utility/createDefaultModules");
const { Op } = require("sequelize");
const crypto = require("crypto");
const PackageModules = db.packageModules;
const {
  register: Register,
  users: Users,
  roles: Roles,
  rolePermissions: RolePermissions,
  permissions: Permissions,
  modules: Modules,
  employee: Employee,
  companySetup: CompanySetup,
  profile: Profile,
  payment: Payment,
  currency: Currency,
} = db;

const brevoEmail = require("../utility/brevoEmail");

const { sendWelcomeEmail } = require("../utility/employeeEmail");
const { createNotification } = require("../utility/createNotification");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const loginAttempts = new Map();
const MAX_ATTEMPTS_BEFORE_EMAIL = 3;
const EMAIL_COOLDOWN_MINUTES = 10;

const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    if (typeof value === "object") return value;
    return fallback;
  } catch {
    return fallback;
  }
};

exports.registerCompanyByProvider = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { company, firstName, middleName, lastName, mobile, email, password } =
    req.body;
  const providerUser = req.user; // Logged in provider

  const t = await db.sequelize.transaction();

  try {
    // check existing records
    const [
      existingEmailUser,
      existingMobileRegister,
      existingEmailEmployee,
      existingMobileEmployee,
    ] = await Promise.all([
      Users.findOne({ where: { email } }),
      Register.findOne({ where: { mobile } }),
      Employee.findOne({ where: { email } }),
      Employee.findOne({ where: { mobile } }),
    ]);

    if (existingEmailUser || existingEmailEmployee)
      return sendErrorResponse(res, 400, "Email already in use");
    if (existingMobileRegister || existingMobileEmployee)
      return sendErrorResponse(res, 400, "Mobile already in use");

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔎 Resolve provider org id (seeded Super Provider Admin)
    const providerRole = await Roles.findOne({
      where: { role_name: "Super Provider Admin" },
      order: [["id", "ASC"]],
      transaction: t,
    });
    const providerOrgId = providerRole ? providerRole.org_id : null;

    // 1️⃣ Register (org)
    const org = await Register.create(
      {
        providerId: providerOrgId,
        company,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        expiry: null,
        packageDetails: null,
        password: hashedPassword,
        accountActivity: "Activate",
      },
      { transaction: t }
    );

    // 2️⃣ Role
    const [role] = await Roles.findOrCreate({
      where: { org_id: org.id, role_name: "Super Admin" },
      defaults: { org_id: org.id, role_name: "Super Admin" },
      transaction: t,
    });

    // 3️⃣ User
    const user = await Users.create(
      {
        org_id: org.id,
        role_id: role.id,
        providerId: providerOrgId,
        email,
        mobile,
        password: hashedPassword,
      },
      { transaction: t }
    );

    await user.reload({ transaction: t });

    const fullName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ");

    await sendWelcomeEmail(email, fullName, "Super Admin", company, password);

    // 4️⃣ Employee
    await Employee.create(
      {
        org_id: org.id,
        role_id: role.id,
        user_id: user.id,
        providerId: providerOrgId,
        salutation: null,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        password: hashedPassword,
        street: null,
        state: null,
        country: null,
        city: null,
        pincode: null,
        altStreet: null,
        altState: null,
        altCountry: null,
        altCity: null,
        altPincode: null,
        reportTo: null,
      },
      { transaction: t }
    );

    // 5️⃣ Company Setup
    await CompanySetup.create(
      {
        org_id: org.id,
        role_id: role.id,
        user_id: user.id,
        providerId: providerOrgId,
        companyName: company,
        gstinNumber: null,
        salutation: null,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        supportedMobile: null,
        supportedEmail: null,
        permanantStreet: null,
        permanantCity: null,
        permanantState: null,
        permanantPincode: null,
        permanantCountry: null,
        alternateStreet: null,
        alternateCity: null,
        alternateState: null,
        alternatePincode: null,
        alternateCountry: null,
        companyLogo: null,
      },
      { transaction: t }
    );

    // 6️⃣ Profile
    await Profile.create(
      {
        org_id: org.id,
        role_id: role.id,
        user_id: user.id,
        providerId: providerOrgId,
        companyName: company,
        gstinNumber: null,
        salutation: null,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        permanantStreet: null,
        permanantCity: null,
        permanantState: null,
        permanantPincode: null,
        permanantCountry: null,
        alternateStreet: null,
        alternateCity: null,
        alternateState: null,
        alternatePincode: null,
        alternateCountry: null,
        profileImage: null,
        password: hashedPassword,
      },
      { transaction: t }
    );

    // commit
    await t.commit();

    // ========== NOTIFICATIONS ==========
    // Notify the new company's Super Admin
    await createNotification({
      org_id: org.id,
      user_id: user.id,
      type: "account_activated",
      title: "🎉 Welcome to CRESCO!",
      message: `Your company "${company}" has been registered by your provider. Welcome aboard!`,
      data: {
        company,
        email,
        providerId: providerOrgId,
        registeredBy: providerUser?.email || "Provider",
      },
    });

    // Notify the provider about successful registration
    if (providerUser) {
      await createNotification({
        org_id: providerUser.org_id,
        user_id: providerUser.id,
        type: "customer_created",
        title: "✅ Company Registered Successfully",
        message: `Company "${company}" has been successfully registered.`,
        data: {
          company,
          email,
          org_id: org.id,
          registeredAt: new Date().toISOString(),
        },
      });
    }
    // ===================================

    return res
      .status(201)
      .json({ message: "Company registered successfully." });
  } catch (error) {
    await t.rollback();
    console.error("Registration Error:", error);
    return sendErrorResponse(res, 500, "Registration failed");
  }
};

exports.generateAuthResponse = async (user) => {
  // org info
  const registerData = await Register.findOne({
    where: { id: user.org_id },
  });

  // Get role + permissions
  const role = await Roles.findOne({
    where: { id: user.role_id },
    include: [
      {
        model: RolePermissions,
        as: "rolePermissionList",
        include: [
          {
            model: Permissions,
            as: "permission",
            include: [{ model: Modules, as: "module" }],
          },
        ],
      },
    ],
  });

  // Super admin name
  const superAdminRole = await Roles.findOne({
    where: { org_id: user.org_id, role_name: "Super Admin" },
  });

  let sa_role_id = null;
  let sa_role_name = null;

  if (superAdminRole) {
    const saEmployee = await Employee.findOne({
      where: { org_id: user.org_id, role_id: superAdminRole.id },
      order: [["id", "ASC"]],
    });

    if (saEmployee) {
      const parts = [
        saEmployee.salutation,
        saEmployee.firstName,
        saEmployee.middleName,
        saEmployee.lastName,
      ].filter(Boolean);

      sa_role_name = parts.join(" ");
      sa_role_id = superAdminRole.id;
    }
  }

  // Build permissions map
  const permissionsMap = {};
  const packageModules = await PackageModules.findAll({
    where: { package_id: registerData.packageId },
    attributes: ["id", "module", "package_id"],
  });
  const packageModuleNames = new Set(
    packageModules.map((pkgModule) => pkgModule.module)
  );

  role.rolePermissionList.forEach(({ permission }) => {
    const modName = permission.module.module_name;
    if (
      role.role_name !== "Super Provider Admin" &&
      registerData.packageId &&
      !packageModuleNames.has(modName)
    ) {
      return;
    }
    const type = permission.permission_type;
    if (!permissionsMap[modName]) permissionsMap[modName] = {};
    permissionsMap[modName][type] = true;
  });

  const providerId = user.providerId ?? registerData.providerId ?? null;

  // Provider/company support info
  let supportedEmail = null;
  let supportedMobile = null;

  if (role.role_name === "Super Admin") {
    const providerSetup = await CompanySetup.findOne({
      where: { org_id: providerId },
    });
    if (providerSetup) {
      supportedEmail = providerSetup.supportedEmail;
      supportedMobile = providerSetup.supportedMobile;
    }
  } else {
    const companySetup = await CompanySetup.findOne({
      where: { org_id: user.org_id },
    });
    if (companySetup) {
      supportedEmail = companySetup.supportedEmail;
      supportedMobile = companySetup.supportedMobile;
    }
  }

  // Profile
  const profile = await Profile.findOne({
    where: { user_id: user.id },
    attributes: ["salutation", "firstName", "lastName"],
  });

  const currencyRes = await Currency.findOne({
    where: { org_id: user.org_id },
  });

  // JWT Payload
  const payload = {
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    org_id: user.org_id,
    role_id: user.role_id,
    role_name: role.role_name,
    user_type:
      role.role_name === "Super Provider Admin" ? "provider" : "company",
    providerId,
    pkgUsers: user.pkgUsers,
    currencyCode: currencyRes ? currencyRes.currencyCode : "INR", // Add default INR
    currencySymbol: currencyRes ? currencyRes.symbol : "₹",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    token,
    user: {
      ...payload,
      sa_role_id,
      sa_role_name,
      permissions: permissionsMap,
      packageModules,
      packageId: registerData.packageId || null,
      packageStartDate: registerData.packageStartDate || null,
      packageExpiryDate: registerData.packageExpiryDate || null,
      paymentStatus: registerData.paymentStatus || null,
      packageDetails: parseJSON(registerData.packageDetails, null),
      isFree: registerData.isFree,
      supportedEmail,
      supportedMobile,
      salutation: profile ? profile.salutation : null,
      firstName: profile ? profile.firstName : null,
      lastName: profile ? profile.lastName : null,
    },
  };
};

exports.registerCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { company, firstName, middleName, lastName, mobile, email, password } =
    req.body;
  const transaction = await db.sequelize.transaction();

  try {
    // Optimize: Single query to check all existing records
    const [existingUsers, existingRegisters, existingEmployees] =
      await Promise.all([
        Users.findAll({
          where: { email },
          attributes: ["id", "email"],
          limit: 1,
          transaction,
        }),
        Register.findAll({
          where: { mobile },
          attributes: ["id", "mobile"],
          limit: 1,
          transaction,
        }),
        Employee.findAll({
          where: {
            [db.Sequelize.Op.or]: [{ email }, { mobile }],
          },
          attributes: ["id", "email", "mobile"],
          limit: 2,
          transaction,
        }),
      ]);

    // Check for conflicts
    if (
      existingUsers.length > 0 ||
      existingEmployees.some((e) => e.email === email)
    ) {
      await transaction.rollback();
      return sendErrorResponse(res, 400, "Email already in use");
    }
    if (
      existingRegisters.length > 0 ||
      existingEmployees.some((e) => e.mobile === mobile)
    ) {
      await transaction.rollback();
      return sendErrorResponse(res, 400, "Mobile already in use");
    }

    // Optimize: Get provider role with timeout and error handling
    const providerRole = await Promise.race([
      Roles.findOne({
        where: { role_name: "Super Provider Admin" },
        order: [["id", "ASC"]],
        transaction,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Role lookup timeout")), 5000)
      ),
    ]);

    const providerOrgId = providerRole ? providerRole.org_id : null;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Optimize: Batch create operations where possible
    const org = await Register.create(
      {
        providerId: providerOrgId,
        company,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        expiry: null,
        packageDetails: null,
        password: hashedPassword,
        accountActivity: "Activate",
      },
      { transaction }
    );

    // Get or create role
    const [role] = await Roles.findOrCreate({
      where: { org_id: org.id, role_name: "Super Admin" },
      defaults: { org_id: org.id, role_name: "Super Admin" },
      transaction,
    });

    // Create user
    const user = await Users.create(
      {
        org_id: org.id,
        role_id: role.id,
        providerId: providerOrgId,
        email,
        mobile,
        password: hashedPassword,
      },
      { transaction }
    );

    await user.reload({ transaction });

    // Prepare common data for bulk operations
    const commonData = {
      org_id: org.id,
      role_id: role.id,
      user_id: user.id,
      providerId: providerOrgId,
    };

    const fullName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ");

    // Optimize: Use Promise.all for parallel creation of related records
    await Promise.all([
      Employee.create(
        {
          ...commonData,
          salutation: null,
          firstName,
          middleName,
          lastName,
          mobile,
          email,
          password: hashedPassword,
          street: null,
          state: null,
          country: null,
          city: null,
          pincode: null,
          altStreet: null,
          altState: null,
          altCountry: null,
          altCity: null,
          altPincode: null,
          reportTo: null,
        },
        { transaction }
      ),
      CompanySetup.create(
        {
          ...commonData,
          companyName: company,
          gstinNumber: null,
          salutation: null,
          firstName,
          middleName,
          lastName,
          mobile,
          email,
          supportedMobile: null,
          supportedEmail: null,
          permanantStreet: null,
          permanantCity: null,
          permanantState: null,
          permanantPincode: null,
          permanantCountry: null,
          alternateStreet: null,
          alternateCity: null,
          alternateState: null,
          alternatePincode: null,
          alternateCountry: null,
          companyLogo: null,
        },
        { transaction }
      ),
      Profile.create(
        {
          ...commonData,
          companyName: company,
          gstinNumber: null,
          salutation: null,
          firstName,
          middleName,
          lastName,
          mobile,
          email,
          permanantStreet: null,
          permanantCity: null,
          permanantState: null,
          permanantPincode: null,
          permanantCountry: null,
          alternateStreet: null,
          alternateCity: null,
          alternateState: null,
          alternatePincode: null,
          alternateCountry: null,
          profileImage: null,
          password: hashedPassword,
        },
        { transaction }
      ),
    ]);

    // Commit transaction
    await transaction.commit();

    // Send email asynchronously (don't await - let it run in background)
    sendWelcomeEmail(email, fullName, "Super Admin", company, password).catch(
      (err) => console.error("Welcome email failed:", err)
    );

    // ========== NOTIFICATIONS ==========
    // Registration is already committed, so notification failures should not
    // turn a successful signup into an HTTP 500 response.
    try {
    // Send welcome notification to the new Super Admin
    await createNotification({
      org_id: org.id,
      user_id: user.id,
      type: "account_activated",
      title: "🎉 Welcome to CRESCO!",
      message: `Your company "${company}" has been successfully registered. We're excited to have you on board!`,
      data: {
        company,
        email,
        registrationDate: new Date().toISOString(),
      },
    });

    // If provider exists, notify them about new registration
    if (providerOrgId) {
      // Find all provider admins
      const providerUsers = await Users.findAll({
        where: { org_id: providerOrgId },
        include: [
          {
            model: Roles,
            as: "role",
            attributes: [],
            where: { role_name: "Super Provider Admin" },
            required: true,
          },
        ],
      });

      for (const providerUser of providerUsers) {
        await createNotification({
          org_id: providerOrgId,
          user_id: providerUser.id,
          type: "customer_created",
          title: "🏢 New Company Registered",
          message: `New company "${company}" has been registered under your provider account.`,
          data: {
            company,
            email,
            org_id: org.id,
            registeredBy: "Self Registration",
          },
        });
      }
    }
    } catch (notificationError) {
      console.error("Registration notification failed:", notificationError);
    }
    // ===================================

    // Generate auth response
    const authResponse = await exports.generateAuthResponse(user);

    return res.status(201).json({
      message: "Company registered successfully.",
      ...authResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    // Ensure transaction is rolled back
    if (transaction && !transaction.finished) {
      await transaction
        .rollback()
        .catch((err) => console.error("Rollback error:", err));
    }

    // Handle specific error types
    if (error.message === "Role lookup timeout") {
      return sendErrorResponse(res, 504, "Registration service timeout");
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return sendErrorResponse(res, 400, "Duplicate entry detected");
    }

    if (error.name === "SequelizeConnectionError") {
      return sendErrorResponse(res, 503, "Database connection error");
    }

    return sendErrorResponse(res, 500, "Registration failed");
  }
};

exports.signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { email, password } = req.body;

  try {
    const user = await Users.findOne({
      where: { email, isDeleted: false }, // prevent deleted users
      include: [
        {
          model: Register,
          as: "organization",
          attributes: [
            "accountActivity",
            "packageId",
            "packageStartDate",
            "packageExpiryDate",
            "paymentStatus",
            "packageDetails",
            "isFree",
            "providerId",
            "pkgUsers",
            "company",
            "firstName",
          ],
        },
      ],
    });

    if (!user) return sendErrorResponse(res, 404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // ─────── Track failed attempt ───────
      const now = new Date();
      const attemptInfo = loginAttempts.get(email) || {
        count: 0,
        lastAttempt: null,
        lastEmailSent: null,
      };

      // Reset count if last attempt was long ago
      if (
        attemptInfo.lastAttempt &&
        (now - attemptInfo.lastAttempt) / 1000 / 60 > 15
      ) {
        attemptInfo.count = 0;
      }

      attemptInfo.count += 1;
      attemptInfo.lastAttempt = now;

      // Decide whether to send warning email
      let shouldSendEmail = false;

      if (attemptInfo.count >= MAX_ATTEMPTS_BEFORE_EMAIL) {
        // Check cooldown for email
        if (
          !attemptInfo.lastEmailSent ||
          (now - attemptInfo.lastEmailSent) / 1000 / 60 >=
            EMAIL_COOLDOWN_MINUTES
        ) {
          shouldSendEmail = true;
          attemptInfo.lastEmailSent = now;
        }
      }

      // Save back to map
      loginAttempts.set(email, attemptInfo);

      // // Send email if needed (non-blocking)
      // if (shouldSendEmail) {
      //   sendTooManyAttemptsWarningEmail(email, attemptInfo.count).catch(
      //     (err) => {
      //       console.error("Failed to send too-many-attempts email:", err);
      //     }
      //   );
      // }
      // Send email if needed (non-blocking)
      if (shouldSendEmail) {
        // Get company name from user's organization
        const companyName = user.organization?.company || "CRESCO";
        sendTooManyAttemptsWarningEmail(
          email,
          attemptInfo.count,
          companyName
        ).catch((err) => {
          console.error("Failed to send too-many-attempts email:", err);
        });
      }

      return sendErrorResponse(res, 401, "Invalid password");
    }

    // ─────── Successful login ───────
    // Clear tracking for this user
    loginAttempts.delete(email);

    if (user.organization?.accountActivity === "Deactivate") {
      return sendErrorResponse(
        res,
        403,
        "Your account has been deactivated by the provider. Please contact support."
      );
    }

    const authResponse = await exports.generateAuthResponse(user);

    // ========== NOTIFICATION ==========
    // Send login alert notification
    await createNotification({
      org_id: user.org_id,
      user_id: user.id,
      type: "login_alert",
      title: "🔐 New Login Detected",
      message: `New login to your account from ${req.ip || "unknown location"}`,
      data: {
        ip: req.ip || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
        time: new Date().toISOString(),
        email: user.email,
      },
    });
    // ==================================

    return res.status(200).json({
      message: "Login successful",
      ...authResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return sendErrorResponse(res, 500, "Login failed");
  }
};

exports.refreshSession = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { id: req.user.id, isDeleted: false },
    });

    if (!user) return sendErrorResponse(res, 404, "User not found");

    const authResponse = await exports.generateAuthResponse(user);
    return res.status(200).json({
      message: "Session refreshed",
      ...authResponse,
    });
  } catch (error) {
    console.error("Refresh Session Error:", error);
    return sendErrorResponse(res, 500, "Failed to refresh session");
  }
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { email } = req.body;

  try {
    // Find the user in USERS (primary source)
    const user = await Users.findOne({
      where: { email, isDeleted: false },
      include: [
        {
          model: Register,
          as: "organization",
          attributes: ["company", "firstName", "email", "id"],
        },
      ],
    });

    if (!user) {
      return sendErrorResponse(res, 404, "Email not registered!");
    }

    // Generate secure token and 1 hour expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token + expiry on USERS table
    await user.update({
      reset_token: token,
      reset_expiry_token: expiry,
    });

    // Email using organization/company if present else user email/name
    const recipientName =
      user.organization?.company || user.firstName || user.email || "User";

    const frontendBaseUrl = process.env.FRONTEND_URL;

    const resetUrl = `${frontendBaseUrl}/verify-token?email=${encodeURIComponent(
      email
    )}&token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #053054; padding: 20px; text-align: center; }
          .header img { max-width: 150px; height: auto; }
          .content { padding: 40px 30px; text-align: center; }
          .greeting { font-size: 24px; color: #053054; margin-bottom: 10px; }
          .message { font-size: 16px; color: #666666; line-height: 1.5; margin-bottom: 30px; }
          .button { display: inline-block; background-color: #053054; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-bottom: 30px; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://crescosoft.com/assets/logo-xbhi62BW.jpg" alt="Cresco Logo" />
          </div>
          <div class="content">
            <h1 class="greeting">Hello, ${recipientName}!</h1>
            <p class="message">
              It looks like you requested to reset your password. Click the button below to create a new one. This link will expire in 1 hour.
            </p>
            <a href="${resetUrl}" class="button">Reset My Password</a>
            <p class="message">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${
      user.organization?.company || "CRESCO"
    }. All rights reserved.</p>
            <p>If you have any questions, contact us at support@crescosoftcrm.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await brevoEmail.sendEmail({
      to: email,
      toName: recipientName,
      subject: "Reset Your Password",
      htmlContent,
    });

    await createNotification({
      org_id: user.org_id,
      user_id: user.id,
      type: "password_changed",
      title: "🔑 Password Reset Requested",
      message: "A password reset link has been sent to your email.",
      data: {
        email: user.email,
        requestedAt: new Date().toISOString(),
      },
    });

    // console.log("Mailjet response:", request);
    return res.status(200).json({ msg: "success" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return sendErrorResponse(res, 500, "Something went wrong!");
  }
};

exports.verifyResetToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { email, token } = req.body;

  try {
    const user = await Users.findOne({ where: { email, isDeleted: false } });
    if (!user) {
      return sendErrorResponse(res, 404, "Email not registered!");
    }

    if (!user.reset_token || user.reset_token !== token) {
      return sendErrorResponse(res, 400, "Invalid reset token!");
    }

    if (
      user.reset_expiry_token &&
      new Date(user.reset_expiry_token) < new Date()
    ) {
      return sendErrorResponse(res, 400, "Reset token has expired!");
    }

    return res.status(200).json({ msg: "Token is valid" });
  } catch (err) {
    console.error("verifyResetToken error:", err);
    return sendErrorResponse(res, 500, "Something went wrong!");
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { email, token, newPassword } = req.body;

  try {
    const user = await Users.findOne({
      where: { email, isDeleted: false },
      include: [
        {
          model: Register,
          as: "organization",
          attributes: ["id", "email", "company", "firstName"],
        },
      ],
    });

    if (!user) {
      return sendErrorResponse(res, 404, "Email not registered!");
    }

    if (!user.reset_token || user.reset_token !== token) {
      return sendErrorResponse(res, 400, "Invalid reset token!");
    }

    if (
      user.reset_expiry_token &&
      new Date(user.reset_expiry_token) < new Date()
    ) {
      return sendErrorResponse(res, 400, "Reset token has expired!");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update USERS table
    await Users.update(
      {
        password: hashedPassword,
        reset_token: null,
        reset_expiry_token: null,
      },
      {
        where: { id: user.id },
      }
    );

    // Propagate hashed password to other tables:
    // UPDATE register WHERE email = email OR id = user.org_id
    await Register.update(
      { password: hashedPassword },
      {
        where: {
          [Op.or]: [{ email }, { id: user.org_id }],
        },
      }
    );

    // UPDATE employee WHERE email = email OR user_id = user.id
    await Employee.update(
      { password: hashedPassword },
      {
        where: {
          [Op.or]: [{ email }, { user_id: user.id }],
        },
      }
    );

    // UPDATE profile WHERE email = email OR user_id = user.id
    await Profile.update(
      { password: hashedPassword },
      {
        where: {
          [Op.or]: [{ email }, { user_id: user.id }],
        },
      }
    );

    try {
      const recipientName =
        user.organization?.company ||
        user.organization?.firstName ||
        email.split("@")[0] ||
        "User";

      const frontendUrl = process.env.FRONTEND_URL;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Changed Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #053054; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .success { color: #2e7d32; font-size: 22px; margin: 20px 0; }
            .password-box { 
              background: #f5f5f5; 
              padding: 15px; 
              border-radius: 6px; 
              font-size: 18px; 
              font-family: monospace; 
              margin: 20px 0; 
              word-break: break-all;
            }
            .warning { color: #d32f2f; font-size: 15px; margin-top: 25px; }
            .button { 
              display: inline-block; 
              background: #053054; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { background: #f4f4f4; padding: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Password Changed Successfully</h2>
            </div>
            <div class="content">
              <p class="success">Hello ${recipientName},</p>
              <p>Your password has been successfully updated.</p>
              
              <div class="password-box">
                New Password: <strong>${newPassword}</strong>
              </div>

              <p class="warning">
                <strong>Security Recommendation:</strong><br>
                For better security, please log in and change your password to something only you know.
              </p>

              <a href="${frontendUrl}/signin" class="button">Go to Login</a>
            </div>
            <div class="footer">
              <p>If you didn't request this change, contact support immediately.</p>
              <p>© ${new Date().getFullYear()} ${user.organization?.company}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await brevoEmail.sendEmail({
        to: email,
        toName: recipientName,
        subject: "Your Password Has Been Changed",
        htmlContent,
      });

      console.log(`Password changed email sent to ${email}`);
    } catch (emailErr) {
      console.error("Failed to send password changed email:", emailErr);
      // We don't fail the request — just log the error
    }

    await createNotification({
      org_id: user.org_id,
      user_id: user.id,
      type: "password_changed",
      title: "✅ Password Changed Successfully",
      message: "Your password has been successfully changed.",
      data: {
        changedAt: new Date().toISOString(),
      },
    });

    return res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return sendErrorResponse(res, 500, "Something went wrong!");
  }
};

exports.createPaymentOrder = async (req, res) => {
  const { packageId } = req.body;
  const user = req.user;
  console.log("req.body:", req.body);
  try {
    // const { amount, currency = 'INR', userEmail, planName } = req.body;
    const register = await Register.findByPk(user.org_id);
    if (!register) return sendErrorResponse(res, 404, "Organization not found");

    const pkg = await db.package.findByPk(packageId.packageId);
    if (!pkg) return sendErrorResponse(res, 404, "Package not found");

    const options = {
      amount: packageId.totalAmount * 100,
      currency: pkg.currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    await Payment.create({
      org_id: user.org_id,
      orderId: order.id,
      amount: packageId.totalAmount,
      currency: pkg.currency,
      status: "created",
      userEmail: register.email,
      package_id: packageId.packageId,
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packageName: pkg.packageName,
    });
  } catch (error) {
    console.error("Create order error:", error);
    sendErrorResponse(res, 500, "Failed to create order");
  }
};

// // old
// exports.verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       planId, // packageId
//       numUsers,
//       totalAmount, // ← added / make sure frontend sends it
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return sendErrorResponse(res, 400, "Missing payment details");
//     }

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       await Payment.update(
//         { status: "failed" },
//         { where: { orderId: razorpay_order_id } }
//       );
//       return sendErrorResponse(res, 400, "Invalid signature");
//     }

//     // Signature valid → mark payment completed
//     await Payment.update(
//       {
//         paymentId: razorpay_payment_id,
//         status: "completed",
//       },
//       { where: { orderId: razorpay_order_id } }
//     );

//     // Activate package
//     const activationResult = await activatePackage(
//       planId,
//       req.user.org_id,
//       numUsers
//     );

//     if (!activationResult || !activationResult.status) {
//       return sendErrorResponse(res, 500, "Package activation failed");
//     }

//     // ─── Send success email ───────────────────────────────────────
//     try {
//       const register = await Register.findByPk(req.user.org_id);
//       const pkg = await db.package.findByPk(planId);

//       if (register && pkg) {
//         const {
//           sendPaymentSuccessEmail,
//         } = require("../utility/sendPaymentSuccessEmail");

//         await sendPaymentSuccessEmail({
//           toEmail: register.email,
//           toName:
//             register.company ||
//             [register.firstName, register.middleName, register.lastName]
//               .filter(Boolean)
//               .join(" ") ||
//             "Super Admin",
//           companyName: register.company || "Your Company",
//           packageName: pkg.packageName,
//           amount: Number(
//             totalAmount ||
//               pkg.price ||
//               activationResult.package?.packageDetails?.price ||
//               0
//           ),
//           currencySymbol: pkg.symbol || "₹",
//           durationValue: pkg.durationValue,
//           durationType: pkg.durationType || "days",
//           paymentMethod: "Online",
//           transactionId: razorpay_payment_id,
//           paymentDate: new Date().toLocaleDateString("en-IN"),
//         });
//       }
//     } catch (emailErr) {
//       console.error("Payment success email failed (non-blocking):", emailErr);
//     }

//     // ========== NOTIFICATION ==========
//     const register = await Register.findByPk(req.user.org_id);
//     const pkg = await db.package.findByPk(planId);

//     await createNotification({
//       org_id: req.user.org_id,
//       user_id: req.user.id,
//       type: "payment_success",
//       title: "💰 Payment Successful",
//       message: `Your payment of ${pkg?.symbol || "₹"}${
//         totalAmount || pkg?.price || 0
//       } for package "${pkg?.packageName}" has been successfully processed.`,
//       data: {
//         paymentId: razorpay_payment_id,
//         orderId: razorpay_order_id,
//         amount: totalAmount || pkg?.price,
//         currency: pkg?.currency,
//         packageId: planId,
//         packageName: pkg?.packageName,
//         paymentDate: new Date().toISOString(),
//       },
//     });
//     // ==================================

//     // Return fresh auth response (important for frontend to update UI)
//     const freshUser = await Users.findByPk(req.user.id);
//     const authResponse = await exports.generateAuthResponse(freshUser);

//     return res.status(200).json({
//       status: "success",
//       message: "Package activated successfully",
//       ...authResponse,
//     });
//   } catch (error) {
//     console.error("Verify payment error:", error);
//     return sendErrorResponse(res, 500, "Payment verification failed");
//   }
// };

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId, // packageId
      numUsers,
      totalAmount, // ← added / make sure frontend sends it
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendErrorResponse(res, 400, "Missing payment details");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.update(
        { status: "failed" },
        { where: { orderId: razorpay_order_id } }
      );
      return sendErrorResponse(res, 400, "Invalid signature");
    }

    // Signature valid → mark payment completed
    await Payment.update(
      {
        paymentId: razorpay_payment_id,
        status: "completed",
      },
      { where: { orderId: razorpay_order_id } }
    );

    // Activate package
    const activationResult = await activatePackage(
      planId,
      req.user.org_id,
      numUsers
    );

    if (!activationResult || !activationResult.status) {
      return sendErrorResponse(res, 500, "Package activation failed");
    }

    // ─── Send success email ───────────────────────────────────────
    try {
      const register = await Register.findByPk(req.user.org_id);
      const pkg = await db.package.findByPk(planId);

      if (register && pkg) {
        const {
          sendPaymentSuccessEmail,
        } = require("../utility/sendPaymentSuccessEmail");

        await sendPaymentSuccessEmail({
          toEmail: register.email,
          toName:
            register.company ||
            [register.firstName, register.middleName, register.lastName]
              .filter(Boolean)
              .join(" ") ||
            "Super Admin",
          companyName: register.company || "Your Company",
          packageName: pkg.packageName,
          amount: Number(
            totalAmount ||
              pkg.price ||
              activationResult.package?.packageDetails?.price ||
              0
          ),
          currencySymbol: pkg.symbol || "₹",
          durationValue: pkg.durationValue,
          durationType: pkg.durationType || "days",
          paymentMethod: "Online",
          transactionId: razorpay_payment_id,
          paymentDate: new Date().toLocaleDateString("en-IN"),
        });
      }
    } catch (emailErr) {
      console.error("Payment success email failed (non-blocking):", emailErr);
    }

    // ========== NOTIFICATION ==========
    const register = await Register.findByPk(req.user.org_id);
    const pkg = await db.package.findByPk(planId);

    await createNotification({
      org_id: req.user.org_id,
      user_id: req.user.id,
      type: "payment_success",
      title: "💰 Payment Successful",
      message: `Your payment of ${pkg?.symbol || "₹"}${
        totalAmount || pkg?.price || 0
      } for package "${pkg?.packageName}" has been successfully processed.`,
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: totalAmount || pkg?.price,
        currency: pkg?.currency,
        packageId: planId,
        packageName: pkg?.packageName,
        paymentDate: new Date().toISOString(),
      },
    });
    // ==================================

    // Return fresh auth response (important for frontend to update UI)
    const freshUser = await Users.findByPk(req.user.id);
    const authResponse = await exports.generateAuthResponse(freshUser);

    console.log("Payment verification successful, returning:", {
      message: "Package activated successfully",
      hasToken: !!authResponse.token,
      hasUser: !!authResponse.user,
    });

    return res.status(200).json({
      status: "success",
      message: "Package activated successfully",
      ...authResponse,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return sendErrorResponse(res, 500, "Payment verification failed");
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { orderId: req.params.orderId },
    });
    if (!payment) {
      return sendErrorResponse(res, 500, "Payment not found!");
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment status error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch payment status!");
  }
};

async function activatePackage(packageId, org_id, numUsers = 0) {
  const t = await db.sequelize.transaction();
  try {
    const register = await Register.findByPk(org_id, { transaction: t });
    const pkg = await db.package.findByPk(packageId);
    if (!register || !pkg) {
      await t.rollback();
      return { status: false, message: "Invalid package or organization" };
    }

    // Use server time + IST offset as you had
    const now = new Date();
    const istOffset = 5.5 * 60;
    const nowIST = new Date(now.getTime() + istOffset * 60 * 1000);

    const expiryDateIST = new Date(nowIST);
    expiryDateIST.setDate(expiryDateIST.getDate() + pkg.durationValue);

    await register.update(
      {
        packageId: pkg.id,
        packageStartDate: nowIST,
        packageExpiryDate: expiryDateIST,
        packageDetails: {
          packageName: pkg.packageName,
          maxUsers: numUsers,
          durationType: pkg.durationType,
          durationValue: pkg.durationValue,
          price: pkg.price,
          currency: pkg.currency,
          symbol: pkg.symbol,
          description: pkg.description,
          isActive: pkg.isActive,
        },
        paymentStatus: "active",
        pkgUsers: numUsers,
        paymentMethod: "Online",
      },
      { transaction: t }
    );

    await register.reload({ transaction: t });

    await t.commit();

    // IMPORTANT: assign modules (this runs AFTER commit)
    // Wait for this to finish before returning so frontend will get ready data
    await createDefaultModules(org_id, packageId);

    // reload register to get updated fields
    const updatedRegister = await Register.findByPk(org_id);

    return {
      status: true,
      message: "Package activated successfully",
      package: {
        packageId: updatedRegister.packageId,
        packageStartDate: updatedRegister.packageStartDate,
        packageExpiryDate: updatedRegister.packageExpiryDate,
        packageDetails: updatedRegister.packageDetails,
        paymentStatus: updatedRegister.paymentStatus,
        isFree: updatedRegister.isFree,
      },
    };
  } catch (error) {
    await t.rollback();
    console.error("Package Activation Error:", error);
    return { status: false, message: "Package activation failed" };
  }
}

exports.selectPackage = async (req, res) => {
  const { packageId } = req.body;
  const User = req.user;
  const t = await db.sequelize.transaction();

  try {
    const register = await Register.findByPk(User.org_id, { transaction: t });
    if (!register) return sendErrorResponse(res, 404, "Organization not found");

    const pkg = await db.package.findByPk(packageId);
    if (!pkg) return sendErrorResponse(res, 404, "Package not found");

    const isFreePackage = pkg.isFree || pkg.price === 0;

    if (isFreePackage && register.isFree) {
      return sendErrorResponse(res, 400, "Free package already used");
    }

    const now = new Date();
    const istOffset = 5.5 * 60;
    const nowIST = new Date(now.getTime() + istOffset * 60 * 1000);

    const expiryDateIST = new Date(nowIST);
    expiryDateIST.setDate(expiryDateIST.getDate() + pkg.durationValue);

    const maxUsersForPackage = pkg.maxUsers || 1;

    await register.update(
      {
        packageId: pkg.id,
        packageStartDate: nowIST,
        packageExpiryDate: expiryDateIST,
        packageDetails: {
          packageName: pkg.packageName,
          maxUsers: maxUsersForPackage,
          durationType: pkg.durationType,
          durationValue: pkg.durationValue,
          price: pkg.price,
          currency: pkg.currency,
          symbol: pkg.symbol,
          description: pkg.description,
          isActive: pkg.isActive,
        },
        paymentStatus: "active",
        isFree: isFreePackage ? true : register.isFree,
        pkgUsers: maxUsersForPackage,
        paymentMethod: isFreePackage ? "Free" : "Online",
      },
      { transaction: t }
    );

    await register.reload({ transaction: t });
    await t.commit();

    // Assign package modules (wait for it)
    await createDefaultModules(User.org_id, packageId);

    // ========== NOTIFICATION ==========
    await createNotification({
      org_id: User.org_id,
      user_id: User.id,
      type: "package_assigned",
      title: "📦 Package Selected Successfully",
      message: `Package "${pkg.packageName}" has been selected for your organization.`,
      data: {
        packageId: pkg.id,
        packageName: pkg.packageName,
        startDate: nowIST,
        expiryDate: expiryDateIST,
        maxUsers: maxUsersForPackage,
        isFree: isFreePackage,
      },
    });
    // ==================================

    // Return fresh auth response for the current user so permissions & packageModules show up immediately
    const freshUser = await Users.findByPk(User.id);
    const authResponse = await exports.generateAuthResponse(freshUser);

    return res.status(200).json({
      message: "Package selected successfully",
      ...authResponse, // contains token + user
    });
  } catch (error) {
    await t.rollback();
    console.error("Package Selection Error:", error);
    return sendErrorResponse(res, 500, "Package selection failed");
  }
};

exports.toggleAccountActivity = async (req, res) => {
  const { orgId, status } = req.body; // status: "Activate" or "Deactivate"
  const user = req.user;

  if (
    user.user_type !== "provider" ||
    user.role_name !== "Super Provider Admin"
  ) {
    return sendErrorResponse(res, 403, "Access denied");
  }

  const t = await db.sequelize.transaction();

  try {
    const targetOrg = await Register.findByPk(orgId);
    if (!targetOrg || targetOrg.providerId !== user.providerId) {
      return sendErrorResponse(res, 404, "Organization not found");
    }

    if (targetOrg.id === user.providerId) {
      return sendErrorResponse(
        res,
        400,
        "Cannot deactivate your own provider account"
      );
    }

    await targetOrg.update({ accountActivity: status });

    await t.commit();

    try {
      const action = status === "Activate" ? "activated" : "deactivated";
      const subject = `Your Account Has Been ${
        status === "Activate" ? "Activated" : "Deactivated"
      }`;

      const recipientName =
        targetOrg.company ||
        targetOrg.firstName ||
        targetOrg.email.split("@")[0] ||
        "Customer";
      const recipientEmail = targetOrg.email;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Account Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #053054; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .status { 
              font-size: 22px; 
              font-weight: bold; 
              color: ${status === "Activate" ? "#2e7d32" : "#d32f2f"}; 
              margin: 20px 0;
            }
            .info { font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px; }
            .button { 
              display: inline-block; 
              background: #053054; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { background: #f4f4f4; padding: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Account Status Update</h2>
            </div>
            <div class="content">
              <p class="status">Your account has been ${action}!</p>
              
              <p class="info">
                Dear ${recipientName},<br><br>
                We wanted to inform you that your company account 
                <strong>${
                  targetOrg.company || "associated with " + recipientName
                }</strong> 
                has been <strong>${action}</strong> by the provider.<br><br>
                ${
                  status === "Activate"
                    ? "You can now log in and continue using the platform."
                    : "Your access to the platform has been suspended. Please contact your provider for more information."
                }
              </p>

              ${
                status === "Deactivate"
                  ? '<p class="info" style="color: #d32f2f;"><strong>Note:</strong> For more details or to reactivate, please reach out to your provider.</p>'
                  : ""
              }

              <a href="${process.env.FRONTEND_URL}/signin" class="button">
                ${status === "Activate" ? "Log In Now" : "Contact Provider"}
              </a>
            </div>
            <div class="footer">
              <p>If this change was unexpected, please contact your provider immediately.</p>
              <p>© ${new Date().getFullYear()} ${targetOrg.company}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await brevoEmail.sendEmail({
        to: recipientEmail,
        toName: recipientName,
        subject: subject,
        htmlContent,
      });

      console.log(`Account ${action} email sent to ${recipientEmail}`);
    } catch (emailError) {
      console.error(
        `Failed to send account ${status.toLowerCase()} email to ${
          targetOrg.email
        }:`,
        emailError
      );
      // Do NOT rollback — email failure should not affect the status update
    }

    // ========== NOTIFICATIONS ==========
    // Notify the organization
    await createNotification({
      org_id: orgId,
      type: status === "Activate" ? "account_activated" : "account_deactivated",
      title:
        status === "Activate"
          ? "✅ Account Activated"
          : "⚠️ Account Deactivated",
      message: `Your account has been ${status.toLowerCase()}d by the provider.`,
      data: {
        status,
        providerId: user.providerId,
        providerName: user.email,
        actionDate: new Date().toISOString(),
      },
      broadcast_to: "org",
    });

    // Notify the provider that action was completed
    await createNotification({
      org_id: user.org_id,
      user_id: user.id,
      type: status === "Activate" ? "account_activated" : "account_deactivated",
      title:
        status === "Activate"
          ? "✅ Account Activated"
          : "⚠️ Account Deactivated",
      message: `You have successfully ${status.toLowerCase()}d account for "${
        targetOrg.company || targetOrg.email
      }".`,
      data: {
        targetOrgId: orgId,
        targetOrgName: targetOrg.company || targetOrg.email,
        status,
        actionDate: new Date().toISOString(),
      },
    });
    // ==================================

    return res.status(200).json({
      message: `Account ${
        status === "Deactivate" ? "deactivated" : "activated"
      } successfully`,
      accountActivity: status,
    });
  } catch (error) {
    console.error("Toggle Account Activity Error:", error);
    return sendErrorResponse(res, 500, "Failed to update account status");
  }
};

exports.getOrganizationInfo = async (req, res) => {
  try {
    const { role_name, user_type, providerId } = req.user;

    if (!(role_name === "Super Provider Admin" && user_type === "provider")) {
      return sendErrorResponse(res, 403, "Access denied");
    }

    if (!providerId) {
      return sendErrorResponse(res, 400, "Provider ID missing in token");
    }

    // Main provider organization
    const mainProvider = await Register.findOne({
      where: { id: providerId },
      attributes: {
        exclude: ["password", "reset_token", "reset_expiry_token"],
      },
    });

    if (!mainProvider) {
      return sendErrorResponse(res, 404, "Main provider not found");
    }

    // Child organizations (customers registered by this provider)
    const childOrgs = await Register.findAll({
      where: { providerId, id: { [Op.ne]: providerId } },
      attributes: {
        exclude: ["password", "reset_token", "reset_expiry_token"],
      },
      order: [["id", "ASC"]],
    });

    // Helper to get full customer name from Employee table (Super Admin)
    const getCustomerName = async (org_id) => {
      const emp = await Employee.findOne({
        where: { org_id },
        order: [["id", "ASC"]],
      });
      if (!emp) return "";
      return [emp.salutation, emp.firstName, emp.middleName, emp.lastName]
        .filter(Boolean)
        .join(" ");
    };

    // Get customer name for main provider
    const mainCustomerName = await getCustomerName(mainProvider.id);

    // All org IDs for fetching payments
    const allOrgIds = [mainProvider.id, ...childOrgs.map((x) => x.id)];

    // Fetch all payments related to provider and its customers
    const allPayments = await Payment.findAll({
      where: { org_id: allOrgIds },
      order: [["createdAt", "DESC"]],
    });

    // Parse packageDetails safely
    const parsePackageDetails = (details) => parseJSON(details, {});

    // Build full organizations list with ALL fields
    const organizations = await Promise.all(
      childOrgs.map(async (org) => {
        const packageDetails = parsePackageDetails(org.packageDetails);
        const customerName = await getCustomerName(org.id);

        return {
          // All direct fields from Register (safe ones)
          id: org.id,
          providerId: org.providerId,
          company: org.company,
          firstName: org.firstName,
          middleName: org.middleName,
          lastName: org.lastName,
          mobile: org.mobile,
          email: org.email,
          packageId: org.packageId,
          packageStartDate: org.packageStartDate,
          packageExpiryDate: org.packageExpiryDate,
          paymentStatus: org.paymentStatus,
          packageDetails: packageDetails,
          isFree: org.isFree,
          accountActivity: org.accountActivity,
          pkgUsers: org.pkgUsers,
          packageActivatedBy: org.packageActivatedBy,
          paymentMethod: org.paymentMethod,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,

          // Helpful derived fields (kept for backward compatibility & UI)
          customerName,
          package: packageDetails.packageName || null,
          status: org.paymentStatus,
          startDate: org.packageStartDate,
          expiryDate: org.packageExpiryDate,
        };
      })
    );

    // Main provider info (also with full details)
    const mainPackageDetails = parsePackageDetails(mainProvider.packageDetails);

    return res.status(200).json({
      // Main provider full info
      id: mainProvider.id,
      providerId: mainProvider.providerId,
      company: mainProvider.company,
      firstName: mainProvider.firstName,
      middleName: mainProvider.middleName,
      lastName: mainProvider.lastName,
      mobile: mainProvider.mobile,
      email: mainProvider.email,
      packageId: mainProvider.packageId,
      packageStartDate: mainProvider.packageStartDate,
      packageExpiryDate: mainProvider.packageExpiryDate,
      paymentStatus: mainProvider.paymentStatus,
      packageDetails: mainPackageDetails,
      isFree: mainProvider.isFree,
      accountActivity: mainProvider.accountActivity,
      pkgUsers: mainProvider.pkgUsers,
      packageActivatedBy: mainProvider.packageActivatedBy,
      paymentMethod: mainProvider.paymentMethod,
      createdAt: mainProvider.createdAt,
      updatedAt: mainProvider.updatedAt,
      customerName: mainCustomerName,
      package: mainPackageDetails.packageName || null,
      status: mainProvider.paymentStatus,

      // List of customer organizations
      organizations,

      // All payments (provider + customers)
      payments: allPayments,
    });
  } catch (error) {
    console.error("Get Organization Info Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch organizations");
  }
};

exports.assignPackageByProvider = async (req, res) => {
  const {
    targetOrgId, // customer org id
    packageId,
    numUsers,
    totalAmount,
    paymentMethod, // "Online" | "Cash" | "Free"
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = req.body;

  const providerUser = req.user;

  if (
    providerUser.user_type !== "provider" ||
    providerUser.role_name !== "Super Provider Admin"
  ) {
    return sendErrorResponse(
      res,
      403,
      "Access denied – only provider can assign packages"
    );
  }

  const t = await db.sequelize.transaction();

  try {
    const targetOrg = await Register.findByPk(targetOrgId, { transaction: t });
    if (!targetOrg || targetOrg.providerId !== providerUser.org_id) {
      await t.rollback();
      return sendErrorResponse(res, 404, "Customer organization not found");
    }

    const pkg = await db.package.findByPk(packageId, { transaction: t });
    if (!pkg) {
      await t.rollback();
      return sendErrorResponse(res, 404, "Package not found");
    }

    const isFreePackage = pkg.price === 0 || pkg.isFree === true;
    const effectiveMaxUsers = isFreePackage ? pkg.maxUsers || 1 : numUsers || 1;

    // Calculate dates (IST)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffset);
    const expiryDateIST = new Date(nowIST);
    expiryDateIST.setDate(expiryDateIST.getDate() + pkg.durationValue);

    // Update organization package info
    await targetOrg.update(
      {
        packageId: pkg.id,
        packageStartDate: nowIST,
        packageExpiryDate: expiryDateIST,
        packageDetails: {
          packageName: pkg.packageName,
          maxUsers: effectiveMaxUsers,
          durationType: pkg.durationType,
          durationValue: pkg.durationValue,
          price: pkg.price,
          total_package_amount: totalAmount || pkg.price,
          currency: pkg.currency,
          symbol: pkg.symbol,
          description: pkg.description,
          isActive: pkg.isActive,
        },
        paymentStatus: "active",
        pkgUsers: effectiveMaxUsers,
        packageActivatedBy: "provider",
        paymentMethod,
        isFree: targetOrg.isFree === true ? true : isFreePackage,
      },
      { transaction: t }
    );

    let paymentRecord = null;

    if (paymentMethod === "Cash" || isFreePackage) {
      paymentRecord = await Payment.create(
        {
          org_id: targetOrgId,
          orderId: `manual_${paymentMethod.toLowerCase()}_${Date.now()}`,
          paymentId: paymentMethod === "Cash" ? "cash_manual" : "free_manual",
          amount: totalAmount || pkg.price || 0,
          currency: pkg.currency,
          status: "completed",
          userEmail: targetOrg.email,
          package_id: packageId,
        },
        { transaction: t }
      );
    } else if (paymentMethod === "Online") {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        await t.rollback();
        return sendErrorResponse(
          res,
          400,
          "Missing Razorpay details for online payment"
        );
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        await t.rollback();
        return sendErrorResponse(res, 400, "Invalid Razorpay signature");
      }

      paymentRecord = await Payment.create(
        {
          org_id: targetOrgId,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: totalAmount,
          currency: pkg.currency,
          status: "completed",
          userEmail: targetOrg.email,
          package_id: packageId,
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Assign modules
    await createDefaultModules(targetOrgId, packageId);

    // ─── Send success email to the company super admin ───────────────────────
    try {
      const {
        sendPaymentSuccessEmail,
      } = require("../utility/sendPaymentSuccessEmail");

      await sendPaymentSuccessEmail({
        toEmail: targetOrg.email,
        toName:
          targetOrg.company ||
          [targetOrg.firstName, targetOrg.middleName, targetOrg.lastName]
            .filter(Boolean)
            .join(" ") ||
          "Super Admin",
        companyName: targetOrg.company || "Your Company",
        packageName: pkg.packageName,
        amount: Number(totalAmount || pkg.price || 0),
        currencySymbol: pkg.symbol || "₹",
        durationValue: pkg.durationValue,
        durationType: pkg.durationType || "days",
        paymentMethod,
        transactionId: paymentMethod === "Online" ? razorpay_payment_id : "",
        paymentDate: new Date().toLocaleDateString("en-IN"),
      });
    } catch (emailErr) {
      console.error(
        "Payment success email failed (provider assign):",
        emailErr
      );
    }

    // ========== NOTIFICATIONS ==========
    // Find all admins in the target organization
    const targetOrgUsers = await Users.findAll({
      where: {
        org_id: targetOrgId,
        role_name: "Super Admin",
      },
    });

    // Notify all admins in the target organization
    for (const targetUser of targetOrgUsers) {
      await createNotification({
        org_id: targetOrgId,
        user_id: targetUser.id,
        type: "package_assigned",
        title: "📦 Package Assigned",
        message: `Provider has assigned package "${pkg.packageName}" to your organization.`,
        data: {
          packageId: pkg.id,
          packageName: pkg.packageName,
          startDate: nowIST,
          expiryDate: expiryDateIST,
          maxUsers: effectiveMaxUsers,
          paymentMethod,
          assignedBy: providerUser.email,
        },
      });
    }

    // Notify the provider that assignment was successful
    await createNotification({
      org_id: providerUser.org_id,
      user_id: providerUser.id,
      type: "package_assigned",
      title: "✅ Package Assigned Successfully",
      message: `Package "${
        pkg.packageName
      }" has been successfully assigned to "${
        targetOrg.company || targetOrg.email
      }".`,
      data: {
        targetOrgId,
        targetOrgName: targetOrg.company || targetOrg.email,
        packageId: pkg.id,
        packageName: pkg.packageName,
        paymentMethod,
      },
    });

    // If payment was made, send payment notification
    if (paymentMethod === "Online" || paymentMethod === "Cash") {
      for (const targetUser of targetOrgUsers) {
        await createNotification({
          org_id: targetOrgId,
          user_id: targetUser.id,
          type: "payment_success",
          title: "💰 Payment Recorded",
          message: `Payment of ${pkg.symbol || "₹"}${
            totalAmount || pkg.price
          } for package "${pkg.packageName}" has been recorded.`,
          data: {
            amount: totalAmount || pkg.price,
            paymentMethod,
            transactionId: paymentRecord?.paymentId,
            packageName: pkg.packageName,
          },
        });
      }
    }
    // ==================================

    return res.status(200).json({
      message: `Package assigned successfully (${paymentMethod})`,
      payment: paymentRecord ? paymentRecord.toJSON() : null,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("assignPackageByProvider error:", error);
    return sendErrorResponse(res, 500, "Failed to assign package");
  }
};

async function sendTooManyAttemptsWarningEmail(
  userEmail,
  attemptCount,
  companyName = "CRESCO"
) {
  try {
    const recipientName = userEmail.split("@")[0] || "User";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login Security Notice</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; }
          .header { background: #053054; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; text-align: center; }
          .alert { color: #d32f2f; font-size: 18px; margin: 20px 0; }
          .info { font-size: 16px; color: #333; line-height: 1.6; }
          .button { display: inline-block; background: #053054; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f4f4f4; padding: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Security Notice</h2>
          </div>
          <div class="content">
            <p class="alert">Multiple failed login attempts detected</p>
            <p class="info">
              We noticed <strong>${attemptCount}</strong> unsuccessful login attempts to your account (${userEmail}).<br><br>
              If this was you, please make sure you're using the correct password.<br>
              If this wasn't you, we strongly recommend resetting your password right away.
            </p>
            <a href="${
              process.env.FRONTEND_URL
            }/forgot-password" class="button">
              Reset Password
            </a>
          </div>
          <div class="footer">
            <p>If you need assistance, contact support.</p>
            <p>&copy; ${new Date().getFullYear()} ${companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await brevoEmail.sendEmail({
      to: userEmail,
      toName: recipientName,
      subject: "Security Alert: Multiple Failed Login Attempts",
      htmlContent,
    });

    console.log(
      `Too many login attempts email sent to ${userEmail} (attempts: ${attemptCount})`
    );
  } catch (err) {
    console.error("Error sending too-many-attempts email:", err);
  }
}
