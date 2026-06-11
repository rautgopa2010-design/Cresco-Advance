const { validationResult } = require("express-validator");
const db = require("../models");
const Customer = db.customer;
const Employee = db.employee;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { Op } = require("sequelize");
const { getParentRoles } = require("../utility/roleHelper");
const { sendImportSuccessEmail } = require("../utility/bulkImportEmail");

// Create customer
exports.createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const org_id = req.user.org_id;
  const user_id = req.user.id;

  let {
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    customerCategory,
    industry,
    designation,
    leadSource,
    companyName,
    gstinNo,
    billingStreet,
    billingCity,
    billingState,
    billingPincode,
    billingCountry,
    shippingStreet,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingCountry,
    assignedTo,
  } = req.body;

  try {
    // Normalize GSTIN: convert empty string to null
    const normalizedGstinNo =
      gstinNo && gstinNo.trim() !== "" ? gstinNo.trim() : null;

    // Duplicate checks
    const duplicateChecks = [];

    // Only check GSTIN if it's provided and not empty
    if (normalizedGstinNo) {
      duplicateChecks.push(
        Customer.findOne({ where: { org_id, gstinNo: normalizedGstinNo } })
      );
    } else {
      duplicateChecks.push(Promise.resolve(null));
    }

    duplicateChecks.push(
      Customer.findOne({ where: { org_id, mobile } }),
      Customer.findOne({ where: { org_id, email } })
    );

    const [existingGSTIN, existingMobile, existingEmail] = await Promise.all(
      duplicateChecks
    );

    if (existingGSTIN)
      return sendErrorResponse(res, 400, "GSTIN already exists.");
    if (existingMobile)
      return sendErrorResponse(res, 400, "Mobile already exists.");
    if (existingEmail)
      return sendErrorResponse(res, 400, "Email already exists.");

    // Validate assigned employees
    const validEmployees = await Employee.findAll({
      where: { id: assignedTo },
    });
    if (validEmployees.length !== assignedTo.length) {
      return sendErrorResponse(
        res,
        400,
        "One or more assigned employees do not exist."
      );
    }

    const assignedRoleIds = validEmployees
      .map((e) => e.role_id)
      .filter(Boolean);

    const newCustomer = await Customer.create({
      org_id,
      user_id,
      salutation,
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      customerCategory,
      industry,
      designation,
      leadSource,
      companyName,
      gstinNo: normalizedGstinNo, // Save null if empty
      billingStreet,
      billingCity,
      billingState,
      billingPincode,
      billingCountry,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingCountry,
      assignedTo,
      assignedRoleIds,
    });

    res.status(201).json({
      message: "Customer created successfully.",
      customerId: newCustomer.id,
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return sendErrorResponse(res, 500, "Error creating customer.");
  }
};

// Create contact for a customer
exports.createCustomerContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const { customer_id } = req.params;
  const org_id = req.user.org_id;

  const {
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    tag,
    designation,
  } = req.body;

  try {
    // Check that the parent customer exists and belongs to the org
    const customer = await Customer.findOne({
      where: { id: customer_id, org_id },
    });
    if (!customer) return sendErrorResponse(res, 404, "Customer not found.");

    // Duplicate check – mobile & email should be unique across BOTH tables
    const [
      existingContactMobile,
      existingContactEmail,
      existingCustomerMobile,
      existingCustomerEmail,
    ] = await Promise.all([
      db.customerContact.findOne({ where: { org_id, mobile } }),
      db.customerContact.findOne({ where: { org_id, email } }),
      Customer.findOne({ where: { org_id, mobile } }),
      Customer.findOne({ where: { org_id, email } }),
    ]);

    if (existingContactMobile || existingCustomerMobile)
      return sendErrorResponse(res, 400, "Mobile already exists.");
    if (existingContactEmail || existingCustomerEmail)
      return sendErrorResponse(res, 400, "Email already exists.");

    const newContact = await db.customerContact.create({
      org_id,
      customer_id,
      salutation,
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      tag,
      designation,
    });

    res.status(201).json({
      message: "Contact created successfully.",
      contact: newContact,
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    return sendErrorResponse(res, 500, "Error creating contact.");
  }
};

// Get all customers with visibility filter including there contacts
exports.getAllCustomers = async (req, res) => {
  try {
    const { org_id, id: userId, role_id: userRoleId } = req.user;

    const allCustomers = await Customer.findAll({ where: { org_id } });
    const visibleCustomers = [];

    for (const customer of allCustomers) {
      let isVisible = false;

      if (customer.user_id === userId) isVisible = true;

      const assignedIds = Array.isArray(customer.assignedTo)
        ? customer.assignedTo
        : typeof customer.assignedTo === "string"
        ? JSON.parse(customer.assignedTo)
        : [];
      if (!isVisible && assignedIds.includes(userId)) isVisible = true;

      if (!isVisible) {
        const assignedRoleIds = Array.isArray(customer.assignedRoleIds)
          ? customer.assignedRoleIds
          : typeof customer.assignedRoleIds === "string"
          ? JSON.parse(customer.assignedRoleIds)
          : [];

        for (const roleId of assignedRoleIds) {
          const parentRoles = await getParentRoles(roleId, org_id);
          if (parentRoles.includes(userRoleId)) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) visibleCustomers.push(customer);
    }

    // Enrich assignedTo names
    const enrichedCustomers = await Promise.all(
      visibleCustomers.map(async (customer) => {
        let assignedToNames = [];

        const assignedIds = Array.isArray(customer.assignedTo)
          ? customer.assignedTo
          : typeof customer.assignedTo === "string"
          ? JSON.parse(customer.assignedTo)
          : [];

        if (assignedIds.length > 0) {
          const employees = await Employee.findAll({
            where: { id: assignedIds },
          });

          assignedToNames = employees.map((emp) =>
            [emp.salutation, emp.firstName, emp.middleName, emp.lastName]
              .filter(Boolean)
              .join(" ")
          );
        }

        // Fetch contacts for this customer
        const contacts = await db.customerContact.findAll({
          where: { customer_id: customer.id },
          attributes: [
            "id",
            "salutation",
            "firstName",
            "middleName",
            "lastName",
            "mobile",
            "email",
            "tag",
            "designation",
            "createdAt",
          ],
          order: [["createdAt", "DESC"]],
        });

        return {
          ...customer.toJSON(),
          assignedTo: assignedToNames,
          contacts: contacts.map((c) => c.toJSON()),
        };
      })
    );

    res.status(200).json(enrichedCustomers);
  } catch (err) {
    console.error("Get Customers Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch customers");
  }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const { id } = req.params;
  const org_id = req.user.org_id;

  let {
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    customerCategory,
    industry,
    designation,
    leadSource,
    companyName,
    gstinNo,
    billingStreet,
    billingCity,
    billingState,
    billingPincode,
    billingCountry,
    shippingStreet,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingCountry,
    assignedTo,
  } = req.body;

  try {
    const customer = await Customer.findOne({ where: { id, org_id } });
    if (!customer) return sendErrorResponse(res, 404, "Customer not found.");

    // Normalize GSTIN
    const normalizedGstinNo =
      gstinNo && gstinNo.trim() !== "" ? gstinNo.trim() : null;

    // Duplicate checks (exclude current customer)
    const duplicateChecks = [];

    if (normalizedGstinNo) {
      duplicateChecks.push(
        Customer.findOne({
          where: {
            org_id,
            gstinNo: normalizedGstinNo,
            id: { [Op.ne]: id },
          },
        })
      );
    } else {
      duplicateChecks.push(Promise.resolve(null));
    }

    duplicateChecks.push(
      Customer.findOne({ where: { org_id, mobile, id: { [Op.ne]: id } } }),
      Customer.findOne({ where: { org_id, email, id: { [Op.ne]: id } } })
    );

    const [existingGSTIN, existingMobile, existingEmail] = await Promise.all(
      duplicateChecks
    );

    if (existingGSTIN)
      return sendErrorResponse(res, 400, "GSTIN already exists.");
    if (existingMobile)
      return sendErrorResponse(res, 400, "Mobile already exists.");
    if (existingEmail)
      return sendErrorResponse(res, 400, "Email already exists.");

    // Validate assigned employees
    const validEmployees = await Employee.findAll({
      where: { id: assignedTo },
    });
    if (validEmployees.length !== assignedTo.length) {
      return sendErrorResponse(
        res,
        400,
        "One or more assigned employees do not exist."
      );
    }

    const assignedRoleIds = validEmployees
      .map((e) => e.role_id)
      .filter(Boolean);

    // Update customer
    await Customer.update(
      {
        salutation,
        firstName,
        middleName,
        lastName,
        mobile,
        email,
        customerCategory,
        industry,
        designation,
        leadSource,
        companyName,
        gstinNo: normalizedGstinNo, // Save null if empty
        billingStreet,
        billingCity,
        billingState,
        billingPincode,
        billingCountry,
        shippingStreet,
        shippingCity,
        shippingState,
        shippingPincode,
        shippingCountry,
        assignedTo,
        assignedRoleIds,
      },
      { where: { id, org_id } }
    );

    res.status(200).json({ message: "Customer updated successfully." });
  } catch (err) {
    console.error("Update Customer Error:", err);
    return sendErrorResponse(res, 500, "Failed to update customer");
  }
};

// Update contact for a customer
exports.updateCustomerContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const { customer_id, contact_id } = req.params;
  const org_id = req.user.org_id;

  const {
    salutation,
    firstName,
    middleName,
    lastName,
    mobile,
    email,
    tag,
    designation,
  } = req.body;

  try {
    // Verify parent customer exists
    const customer = await Customer.findOne({
      where: { id: customer_id, org_id },
    });
    if (!customer) return sendErrorResponse(res, 404, "Customer not found.");

    // Find the contact
    const contact = await db.customerContact.findOne({
      where: { id: contact_id, customer_id, org_id },
    });
    if (!contact) return sendErrorResponse(res, 404, "Contact not found.");

    // Duplicate check (exclude current contact)
    const [existingMobile, existingEmail] = await Promise.all([
      db.customerContact.findOne({
        where: {
          org_id,
          mobile,
          id: { [Op.ne]: contact_id },
        },
      }),
      db.customerContact.findOne({
        where: {
          org_id,
          email,
          id: { [Op.ne]: contact_id },
        },
      }),
      // Also check against main customers table
      Customer.findOne({ where: { org_id, mobile } }),
      Customer.findOne({ where: { org_id, email } }),
    ]);

    if (existingMobile || existingEmail)
      return sendErrorResponse(
        res,
        400,
        "Mobile or Email already exists in system."
      );

    await contact.update({
      salutation,
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      tag,
      designation,
    });

    res.status(200).json({
      message: "Contact updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("Update Contact Error:", error);
    return sendErrorResponse(res, 500, "Error updating contact.");
  }
};

// ✅ Delete Customer + All Contacts (Cascade)
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  const transaction = await db.sequelize.transaction(); // Use transaction for safety
  try {
    const customer = await Customer.findOne({
      where: { id, org_id },
      transaction,
    });
    if (!customer) {
      await transaction.rollback();
      return sendErrorResponse(res, 404, "Customer not found.");
    }

    // Delete all contacts first
    await db.customerContact.destroy({
      where: { customer_id: id },
      transaction,
    });

    // Then delete the customer
    await Customer.destroy({ where: { id }, transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Enquiry and all its contacts deleted successfully." });
  } catch (err) {
    await transaction.rollback();
    console.error("Delete Customer Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete enquiry");
  }
};

// ✅ Delete single contact
exports.deleteCustomerContact = async (req, res) => {
  const { customer_id, contact_id } = req.params;
  const org_id = req.user.org_id;

  try {
    const contact = await db.customerContact.findOne({
      where: { id: contact_id, customer_id, org_id },
    });

    if (!contact) {
      return sendErrorResponse(res, 404, "Contact not found.");
    }

    await contact.destroy();

    res.status(200).json({ message: "Contact deleted successfully." });
  } catch (err) {
    console.error("Delete Contact Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete contact");
  }
};

// ✅ Bulk Import Customers
exports.importCustomers = async (req, res) => {
  const { customers } = req.body;
  const { org_id, id: user_id, firstName, lastName } = req.user;

  if (!Array.isArray(customers) || customers.length === 0) {
    return sendErrorResponse(res, 400, "No customer data found in file");
  }

  const errors = [];
  const transaction = await db.sequelize.transaction();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatMobileForDb = (raw) => {
    if (!raw) return "";
    const cleaned = raw.toString().trim();
    const match = cleaned.match(/^(\d{1,5})\s(\d{10})$/);
    if (match) {
      return `+${match[1]} ${match[2]}`;
    }
    return cleaned; // we'll reject invalid format later
  };

  // Track seen values **within this import batch**
  const seenMobiles = new Set();
  const seenEmails = new Set();
  const seenGstins = new Set();

  // Get initiator name for email
  const initiatorName = [req.user.salutation, firstName, req.user.middleName, lastName]
    .filter(Boolean)
    .join(" ") || req.user.email;

  // ── PHASE 1: VALIDATE EVERYTHING FIRST (DB + intra-file conflicts) ────────
  for (const [index, row] of customers.entries()) {
    const rowNum = index + 2; // row 1 = header/instruction

    // ── Skip / detect sample row ───────────────────────────────────────────
    const firstName = (row["First Name"] || "").trim().toLowerCase();
    const lastName = (row["Last Name"] || "").trim().toLowerCase();
    const mobileRaw = (row.Mobile || "").toString().trim();
    const email = (row.Email || "").trim().toLowerCase();

    const isLikelySample =
      firstName === "a" ||
      firstName.includes("example") ||
      lastName === "b" ||
      mobileRaw.includes("1111111111") ||
      mobileRaw === "911111111111" ||
      email === "ab@gmail.com" ||
      (email.includes("@gmail.com") && firstName.length < 3);

    if (isLikelySample) {
      errors.push(
        `Row ${rowNum}: Skipped – appears to be sample/instruction row`
      );
      continue;
    }

    // ── Required fields ────────────────────────────────────────────────────
    if (!firstName.trim()) {
      errors.push(`Row ${rowNum}: First Name is required`);
    }
    if (!row["Last Name"]?.trim()) {
      errors.push(`Row ${rowNum}: Last Name is required`);
    }
    if (
      !row.Email?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email.trim())
    ) {
      errors.push(`Row ${rowNum}: Valid Email is required`);
      continue; // no point checking duplicates if email invalid
    }

    const mobile = formatMobileForDb(row.Mobile || "");

    // Mobile format validation
    if (!/^(\+\d{1,5}\s)?\d{10}$/.test(mobile)) {
      errors.push(
        `Row ${rowNum}: Mobile must be 10 digits (optionally with country code + space). Example: 91 9876543210 or 9876543210`
      );
      continue;
    }

    // ── Intra-file duplicate check ─────────────────────────────────────────
    if (seenMobiles.has(mobile)) {
      errors.push(`Row ${rowNum}: Mobile appears multiple times in this file`);
    } else {
      seenMobiles.add(mobile);
    }

    if (seenEmails.has(email)) {
      errors.push(`Row ${rowNum}: Email appears multiple times in this file`);
    } else {
      seenEmails.add(email);
    }

    const gstin = row["GSTIN No"]?.trim() || null;
    if (gstin && seenGstins.has(gstin)) {
      errors.push(`Row ${rowNum}: GSTIN appears multiple times in this file`);
    } else if (gstin) {
      seenGstins.add(gstin);
    }

    // ── Database duplicate check ───────────────────────────────────────────
    const [dupMobile, dupEmail, dupGstin] = await Promise.all([
      Customer.findOne({ where: { org_id, mobile }, transaction }),
      Customer.findOne({ where: { org_id, email }, transaction }),
      gstin
        ? Customer.findOne({ where: { org_id, gstinNo: gstin }, transaction })
        : null,
    ]);

    if (dupMobile) {
      errors.push(`Row ${rowNum}: Mobile already exists in database`);
    }
    if (dupEmail) {
      errors.push(`Row ${rowNum}: Email already exists in database`);
    }
    if (dupGstin) {
      errors.push(`Row ${rowNum}: GSTIN already exists in database`);
    }
  }

  // ── If ANY error → fail everything ───────────────────────────────────────
  if (errors.length > 0) {
    await transaction.rollback();
    return res.status(400).json({
      success: false,
      message: `Import aborted – ${errors.length} validation error${
        errors.length === 1 ? "" : "s"
      } found`,
      errors,
      imported: 0,
      total: customers.length,
    });
  }

  // ── PHASE 2: IMPORT ALL ROWS (now safe) ──────────────────────────────────
  const importedRows = [];

  for (const [index, row] of customers.entries()) {
    const rowNum = index + 2;

    // Skip samples again (redundant but safe)
    if ((row["First Name"] || "").trim().toLowerCase() === "a") continue;

    const mobile = formatMobileForDb(row.Mobile || "");

    const customerData = {
      org_id,
      user_id,
      salutation: row.Salutation?.trim() || null,
      firstName: row["First Name"]?.trim() || null,
      middleName: row["Middle Name"]?.trim() || null,
      lastName: row["Last Name"]?.trim() || null,
      mobile,
      email: row.Email?.trim() || null,
      companyName: row["Company Name"]?.trim() || null,
      customerCategory: row["Customer Category"]?.trim() || null,
      industry: row.Industry?.trim() || null,
      designation: row.Designation?.trim() || null,
      leadSource: row["Lead Source"]?.trim() || null,
      gstinNo: row["GSTIN No"]?.trim() || null,
      billingStreet: row["Billing Street"]?.trim() || null,
      billingCity: row["Billing City"]?.trim() || null,
      billingState: row["Billing State"]?.trim() || null,
      billingPincode: row["Billing Pincode"]?.toString().trim() || null,
      billingCountry: row["Billing Country"]?.trim() || null,
      shippingStreet: row["Shipping Street"]?.trim() || null,
      shippingCity: row["Shipping City"]?.trim() || null,
      shippingState: row["Shipping State"]?.trim() || null,
      shippingPincode: row["Shipping Pincode"]?.toString().trim() || null,
      shippingCountry: row["Shipping Country"]?.trim() || null,
      assignedTo: [user_id],
      assignedRoleIds: [user_id], // adjust if needed
    };

    await Customer.create(customerData, { transaction });
    importedRows.push(rowNum);
  }

  await transaction.commit();

  // ── SEND EMAIL NOTIFICATION TO SUPER ADMIN ───────────────────────────────
  if (importedRows.length > 0) {
    // Non-blocking email send
    sendImportSuccessEmail(
      org_id,
      "customers",
      importedRows.length,
      initiatorName
    ).catch((err) => {
      console.error("Failed to send import success email:", err);
    });
  }

  res.status(200).json({
    success: true,
    imported: importedRows.length,
    total: customers.length,
    message: `Successfully imported ${importedRows.length} customer${
      importedRows.length === 1 ? "" : "s"
    }`,
    errors: undefined,
  });
};

// Bulk assign employees to multiple customers
exports.bulkAssignCustomers = async (req, res) => {
  const { customerIds, employeeIds, mode = "append" } = req.body; // mode: "append" | "replace"
  const { org_id } = req.user;

  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return sendErrorResponse(res, 400, "No customers selected");
  }
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return sendErrorResponse(res, 400, "No employees selected");
  }

  try {
    // Validate all customers belong to org
    const customers = await Customer.findAll({
      where: { id: customerIds, org_id },
    });
    if (customers.length !== customerIds.length) {
      return sendErrorResponse(
        res,
        400,
        "One or more customers not found or access denied"
      );
    }

    // Validate employees exist
    const employees = await Employee.findAll({
      where: { id: employeeIds },
    });
    if (employees.length !== employeeIds.length) {
      return sendErrorResponse(res, 400, "One or more employees do not exist");
    }

    const assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);

    for (const customer of customers) {
      let newAssignedTo = [
        ...(Array.isArray(customer.assignedTo) ? customer.assignedTo : []),
      ];
      let newAssignedRoleIds = [
        ...(Array.isArray(customer.assignedRoleIds)
          ? customer.assignedRoleIds
          : []),
      ];

      if (mode === "replace") {
        newAssignedTo = employeeIds;
        newAssignedRoleIds = assignedRoleIds;
      } else {
        // append (default) – avoid duplicates
        employeeIds.forEach((empId) => {
          if (!newAssignedTo.includes(empId)) {
            newAssignedTo.push(empId);
          }
        });
        assignedRoleIds.forEach((roleId) => {
          if (!newAssignedRoleIds.includes(roleId)) {
            newAssignedRoleIds.push(roleId);
          }
        });
      }

      await customer.update({
        assignedTo: newAssignedTo,
        assignedRoleIds: newAssignedRoleIds,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully assigned to ${customerIds.length} ${
        customerIds.length === 1 ? "enquiry" : "enquiries"
      }`,
    });
  } catch (err) {
    console.error("Bulk Assign Error:", err);
    return sendErrorResponse(res, 500, "Failed to bulk assign");
  }
};
