const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const path = require("path");
const fs = require("fs");
const { getParentRoles } = require("../utility/roleHelper");
const { Op } = require("sequelize");
const {
  NOTIFICATION_TYPES,
  notifyAssignedEmployees,
} = require("../utility/notificationHelper");

const Lead = db.lead;
const LeadProduct = db.leadProduct;
const Followup = db.followup;
const Country = db.country;
const Employee = db.employee;
const APILead = db.apiLead;
const Customer = db.customer;

// Helper to get normalized file path
const normalizeFilePath = (filePath) =>
  filePath.replace(/\\/g, "/").startsWith("/")
    ? filePath.replace(/\\/g, "/")
    : "/" + filePath.replace(/\\/g, "/");

exports.createLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files?.length) {
      for (const file of req.files) {
        const fullPath = path.join("uploads", "leads", file.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  let parsedData;
  try {
    parsedData = JSON.parse(req.body.data);
  } catch (err) {
    if (req.files?.length) {
      for (const file of req.files) {
        const fullPath = path.join("uploads", "leads", file.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }
    return sendErrorResponse(res, 400, "Invalid request data format");
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;
  const {
    date,
    assignedTo,
    companyName,
    gstinNo,
    customerPerson,
    mobile,
    email,
    leadSource,
    leadStage,
    leadStatus,
    expectedAmount,
    description,
    expectedClosingDate,
    followupDate,
    billingAddress,
    shippingAddress,
    productDetails,
    apiLeadId,
  } = parsedData;

  try {
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo.map((emp) => (typeof emp === "object" ? emp.id : emp))
      : [];

    let assignedRoleIds = [];
    if (assignedToArray.length > 0) {
      const employees = await Employee.findAll({
        where: { id: assignedToArray, org_id },
      });
      assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);
    }

    const billingCountryName = billingAddress?.country
      ? (await Country.findByPk(billingAddress.country))?.country || ""
      : "";
    const shippingCountryName = shippingAddress?.country
      ? (await Country.findByPk(shippingAddress.country))?.country || ""
      : "";

    const uploadedFiles =
      req.files?.map((file) =>
        normalizeFilePath(`/uploads/leads/${file.filename}`)
      ) || [];

    const lead = await Lead.create({
      org_id,
      user_id,
      date,
      assignedTo: assignedToArray,
      assignedRoleIds,
      companyName,
      gstinNo,
      customerPerson,
      mobile,
      email,
      leadSource,
      leadStage,
      leadStatus,
      expectedAmount,
      description,
      expectedClosingDate,
      billingStreet: billingAddress?.street || "",
      billingCity: billingAddress?.city || "",
      billingState: billingAddress?.state || "",
      billingPincode: billingAddress?.pincode || "",
      billingCountry: billingCountryName,
      billingZone: billingAddress?.zone || "",
      shippingStreet: shippingAddress?.street || "",
      shippingCity: shippingAddress?.city || "",
      shippingState: shippingAddress?.state || "",
      shippingPincode: shippingAddress?.pincode || "",
      shippingCountry: shippingCountryName,
      shippingZone: shippingAddress?.zone || "",
      uploadedFiles,
    });

    if (Array.isArray(productDetails)) {
      for (const p of productDetails) {
        await LeadProduct.create({
          lead_id: lead.id,
          productBrand: String(p.productBrand || ""),
          productCategory: String(p.productCategory || ""),
          productSubCategory: String(p.productSubCategory || ""),
          product: Array.isArray(p.product)
            ? p.product[0]
            : String(p.product || ""),
          hsnCode: p.hsnCode ? String(p.hsnCode) : null,
          unit: p.unit ? String(p.unit) : null,
          description: p.description ? String(p.description) : null,
        });
      }
    }

    await Followup.create({
      lead_id: lead.id,
      leadStage,
      leadStatus,
      followup_date: followupDate,
      nextFollowUpDate: followupDate,
      followup_desc: description,
      assignedTo: assignedToArray,
    });

    if (apiLeadId) {
      await APILead.destroy({ where: { id: apiLeadId, org_id } });
    }

    await lead.reload({
      include: [
        { model: LeadProduct, as: "products" },
        { model: Followup, as: "followups" },
      ],
    });

    // Send creation email to assigned employees
    if (assignedToArray.length > 0) {
      const { sendLeadCreatedEmail } = require("../utility/leadEmails");
      await sendLeadCreatedEmail(lead, user_id, assignedToArray);
    }

    return res.status(201).json({
      message: "Lead and follow-up created successfully",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    if (req.files?.length) {
      for (const file of req.files) {
        const fullPath = path.join("uploads", "leads", file.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }
    return sendErrorResponse(res, 500, "Failed to create lead");
  }
};

// // old
// exports.getAllLeads = async (req, res) => {
//   try {
//     const { org_id, id: userId, role_id: userRoleId } = req.user;

//     // Step 1: Get all leads in the org
//     const allLeads = await Lead.findAll({
//       where: { org_id },
//       include: [
//         { model: LeadProduct, as: "products" },
//         { model: Followup, as: "followups", order: [["id", "ASC"]] },
//       ],
//       order: [["id", "DESC"]],
//     });

//     // Step 2: Filter leads based on visibility
//     const visibleLeads = [];
//     for (const lead of allLeads) {
//       let isVisible = false;

//       // 1️⃣ Created by user
//       if (lead.user_id === userId) {
//         isVisible = true;
//       }

//       // 2️⃣ Directly assigned
//       const assignedIds = Array.isArray(lead.assignedTo)
//         ? lead.assignedTo
//         : typeof lead.assignedTo === "string"
//         ? JSON.parse(lead.assignedTo)
//         : [];
//       if (!isVisible && assignedIds.includes(userId)) {
//         isVisible = true;
//       }

//       // 3️⃣ Role-based: parent roles of assignedRoleIds
//       if (!isVisible) {
//         const leadAssignedRoles = Array.isArray(lead.assignedRoleIds)
//           ? lead.assignedRoleIds
//           : typeof lead.assignedRoleIds === "string"
//           ? JSON.parse(lead.assignedRoleIds)
//           : [];

//         for (const roleId of leadAssignedRoles) {
//           const parentRoles = await getParentRoles(roleId, org_id);
//           // Only parent roles, exclude the assigned role itself
//           if (parentRoles.includes(userRoleId)) {
//             isVisible = true;
//             break;
//           }
//         }
//       }

//       if (isVisible) visibleLeads.push(lead);
//     }

//     // Step 3: Enrich leads with assignedTo names and latest followup
//     const enrichedLeads = await Promise.all(
//       visibleLeads.map(async (lead) => {
//         let assignedToNames = [];
//         const assignedIds = Array.isArray(lead.assignedTo)
//           ? lead.assignedTo
//           : typeof lead.assignedTo === "string"
//           ? JSON.parse(lead.assignedTo)
//           : [];

//         if (assignedIds.length > 0) {
//           const employees = await Employee.findAll({
//             where: { id: assignedIds },
//           });

//           assignedToNames = employees.map((emp) =>
//             [emp.salutation, emp.firstName, emp.middleName, emp.lastName]
//               .filter(Boolean)
//               .join(" ")
//           );
//         }

//         const leadJSON = lead.toJSON();
//         if (
//           Array.isArray(leadJSON.followups) &&
//           leadJSON.followups.length > 0
//         ) {
//           const latestFollowup = leadJSON.followups.reduce((latest, current) =>
//             current.id > latest.id ? current : latest
//           );
//           leadJSON.followups = [latestFollowup];
//         }

//         const uploadedFiles = Array.isArray(lead.uploadedFiles)
//           ? lead.uploadedFiles
//           : typeof lead.uploadedFiles === "string"
//           ? JSON.parse(lead.uploadedFiles)
//           : [];

//         return {
//           ...leadJSON,
//           assignedTo: assignedToNames,
//           uploadedFiles: uploadedFiles,
//         };
//       })
//     );

//     res.status(200).json(enrichedLeads);
//   } catch (error) {
//     console.error("Get All Leads Error:", error);
//     return sendErrorResponse(res, 500, "Failed to fetch leads");
//   }
// };

exports.getAllLeads = async (req, res) => {
  try {
    const { org_id, id: userId, role_id: userRoleId } = req.user;

    // Step 1: Get all leads in the org
    const allLeads = await Lead.findAll({
      where: { org_id },
      include: [
        { model: LeadProduct, as: "products" },
        { model: Followup, as: "followups", order: [["id", "ASC"]] },
      ],
      order: [["id", "DESC"]],
    });

    // Step 2: Filter leads based on visibility
    const visibleLeads = [];
    for (const lead of allLeads) {
      let isVisible = false;

      // 1️⃣ Created by user
      if (lead.user_id === userId) {
        isVisible = true;
      }

      // 2️⃣ Directly assigned
      const assignedIds = Array.isArray(lead.assignedTo)
        ? lead.assignedTo
        : typeof lead.assignedTo === "string"
        ? JSON.parse(lead.assignedTo)
        : [];
      if (!isVisible && assignedIds.includes(userId)) {
        isVisible = true;
      }

      // 3️⃣ Role-based: parent roles of assignedRoleIds
      if (!isVisible) {
        const leadAssignedRoles = Array.isArray(lead.assignedRoleIds)
          ? lead.assignedRoleIds
          : typeof lead.assignedRoleIds === "string"
          ? JSON.parse(lead.assignedRoleIds)
          : [];

        for (const roleId of leadAssignedRoles) {
          const parentRoles = await getParentRoles(roleId, org_id);
          // Only parent roles, exclude the assigned role itself
          if (parentRoles.includes(userRoleId)) {
            isVisible = true;
            break;
          }
        }
      }

      if (isVisible) visibleLeads.push(lead);
    }

    // Step 3: Enrich leads with assignedTo names, latest followup, and customer contacts
    const enrichedLeads = await Promise.all(
      visibleLeads.map(async (lead) => {
        let assignedToNames = [];
        const assignedIds = Array.isArray(lead.assignedTo)
          ? lead.assignedTo
          : typeof lead.assignedTo === "string"
          ? JSON.parse(lead.assignedTo)
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

        const leadJSON = lead.toJSON();
        if (
          Array.isArray(leadJSON.followups) &&
          leadJSON.followups.length > 0
        ) {
          const latestFollowup = leadJSON.followups.reduce((latest, current) =>
            current.id > latest.id ? current : latest
          );
          leadJSON.followups = [latestFollowup];
        }

        const uploadedFiles = Array.isArray(lead.uploadedFiles)
          ? lead.uploadedFiles
          : typeof lead.uploadedFiles === "string"
          ? JSON.parse(lead.uploadedFiles)
          : [];

        // Find the customer associated with this lead
        let customerContacts = [];
        try {
          // Try to find customer by email, mobile, or company name
          let customer = null;

          // Search by email if available
          if (lead.email) {
            customer = await Customer.findOne({
              where: {
                org_id,
                email: lead.email,
              },
            });
          }

          // If not found by email, try by mobile
          if (!customer && lead.mobile) {
            customer = await Customer.findOne({
              where: {
                org_id,
                mobile: lead.mobile,
              },
            });
          }

          // If still not found, try by company name
          if (!customer && lead.companyName) {
            customer = await Customer.findOne({
              where: {
                org_id,
                companyName: lead.companyName,
              },
            });
          }

          // If customer found, get their contacts
          if (customer) {
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
            customerContacts = contacts.map((c) => c.toJSON());
          }
        } catch (err) {
          console.error(
            "Error fetching customer contacts for lead:",
            lead.id,
            err
          );
          // Continue without contacts if there's an error
        }

        return {
          ...leadJSON,
          assignedTo: assignedToNames,
          uploadedFiles: uploadedFiles,
          customerContacts, // Add the customer contacts array
        };
      })
    );

    res.status(200).json(enrichedLeads);
  } catch (error) {
    console.error("Get All Leads Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch leads");
  }
};

exports.updateLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files?.length) {
      for (const file of req.files) {
        const fullPath = path.join("uploads", "leads", file.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  let parsedData;
  try {
    parsedData = JSON.parse(req.body.data);
  } catch (err) {
    if (req.files?.length) {
      for (const file of req.files) {
        const fullPath = path.join("uploads", "leads", file.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }
    return sendErrorResponse(res, 400, "Invalid request data format");
  }

  const leadId = req.params.lead_id;
  const org_id = req.user.org_id;
  const user_id = req.user.id;

  const {
    date,
    assignedTo,
    companyName,
    gstinNo,
    customerPerson,
    mobile,
    email,
    leadSource,
    leadStage,
    leadStatus,
    expectedAmount,
    description,
    expectedClosingDate,
    followupDate,
    billingAddress,
    shippingAddress,
    productDetails,
    removedFiles = [],
  } = parsedData;

  try {
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      if (req.files?.length) {
        for (const file of req.files) {
          const fullPath = path.join("uploads", "leads", file.filename);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      }
      return sendErrorResponse(res, 404, "Lead not found");
    }

    let previousAssignedTo = Array.isArray(lead.assignedTo)
      ? lead.assignedTo
      : typeof lead.assignedTo === "string"
      ? JSON.parse(lead.assignedTo)
      : [];

    // Normalize assigned employees
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo.map((emp) => (typeof emp === "object" ? emp.id : emp))
      : [];

    // Fetch assigned role IDs
    let assignedRoleIds = [];
    if (assignedToArray.length > 0) {
      const employees = await Employee.findAll({
        where: { id: assignedToArray, org_id },
      });
      assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);
    }

    // Fetch country names
    const billingCountryName = billingAddress?.country
      ? (await Country.findByPk(billingAddress.country))?.country || ""
      : "";
    const shippingCountryName = shippingAddress?.country
      ? (await Country.findByPk(shippingAddress.country))?.country || ""
      : "";

    // Handle uploaded files
    const newFiles =
      req.files?.map((file) =>
        normalizeFilePath(`/uploads/leads/${file.filename}`)
      ) || [];

    // Merge existing files
    let existingFiles = Array.isArray(lead.uploadedFiles)
      ? lead.uploadedFiles
      : typeof lead.uploadedFiles === "string"
      ? JSON.parse(lead.uploadedFiles)
      : [];

    const updatedFiles = existingFiles
      .filter((file) => !removedFiles.includes(path.basename(file)))
      .concat(newFiles);

    // Delete removed files from disk
    for (const filename of removedFiles) {
      const fullPath = path.join("uploads", "leads", filename);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    // Update the lead
    await lead.update({
      org_id,
      user_id,
      date,
      assignedTo: assignedToArray,
      assignedRoleIds,
      companyName,
      gstinNo,
      customerPerson,
      mobile,
      email,
      leadSource,
      leadStage,
      leadStatus,
      expectedAmount,
      description,
      expectedClosingDate,
      billingStreet: billingAddress?.street || "",
      billingCity: billingAddress?.city || "",
      billingState: billingAddress?.state || "",
      billingPincode: billingAddress?.pincode || "",
      billingCountry: billingCountryName,
      billingZone: billingAddress?.zone || "",
      shippingStreet: shippingAddress?.street || "",
      shippingCity: shippingAddress?.city || "",
      shippingState: shippingAddress?.state || "",
      shippingPincode: shippingAddress?.pincode || "",
      shippingCountry: shippingCountryName,
      shippingZone: shippingAddress?.zone || "",
      uploadedFiles: updatedFiles,
    });

    // Replace product details
    if (Array.isArray(productDetails)) {
      await LeadProduct.destroy({ where: { lead_id: leadId } });
      for (const p of productDetails) {
        await LeadProduct.create({
          lead_id: leadId,
          productBrand: String(p.productBrand || ""),
          productCategory: String(p.productCategory || ""),
          productSubCategory: String(p.productSubCategory || ""),
          product: Array.isArray(p.product)
            ? p.product[0]
            : String(p.product || ""),
          hsnCode: p.hsnCode ? String(p.hsnCode) : null,
          unit: p.unit ? String(p.unit) : null,
          description: p.description ? String(p.description) : null,
        });
      }
    }

    // Update or create follow-up (like in createLead)
    const existingFollowup = await Followup.findOne({
      where: { lead_id: leadId },
    });
    if (existingFollowup) {
      await existingFollowup.update({
        leadStage,
        leadStatus,
        followup_date: followupDate,
        nextFollowUpDate: followupDate,
        followup_desc: description,
        assignedTo: assignedToArray,
      });
    } else {
      await Followup.create({
        lead_id: leadId,
        leadStage,
        leadStatus,
        followup_date: followupDate,
        nextFollowUpDate: followupDate,
        followup_desc: description,
        assignedTo: assignedToArray,
      });
    }

    await lead.reload();

    const { sendLeadAssignedEmail } = require("../utility/leadEmails");

    if (assignedToArray.length > 0) {
      const { sendLeadUpdatedEmail } = require("../utility/leadEmails");
      await sendLeadUpdatedEmail(lead, user_id, assignedToArray);
    }

    await sendLeadAssignedEmail(lead, assignedToArray, previousAssignedTo);

    return res.status(200).json({
      message: "Lead and follow-up updated successfully",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);

    // Clean up new files if failed
    if (req.files?.length) {
      for (const file of req.files) {
        const fullPath = path.join("uploads", "leads", file.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }

    return sendErrorResponse(res, 500, "Failed to update lead");
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const { lead_id } = req.params;

    const lead = await Lead.findByPk(lead_id);
    if (!lead) return sendErrorResponse(res, 404, "Lead not found");

    const uploadedFiles = Array.isArray(lead.uploadedFiles)
      ? lead.uploadedFiles
      : typeof lead.uploadedFiles === "string"
      ? JSON.parse(lead.uploadedFiles)
      : [];

    for (const filePath of uploadedFiles) {
      const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ""));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await Followup.destroy({ where: { lead_id } });
    await LeadProduct.destroy({ where: { lead_id } });
    await Lead.destroy({ where: { id: lead_id } });

    res.status(200).json({ message: "Lead and related data deleted" });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete lead");
  }
};

exports.deleteLeadFile = async (req, res) => {
  const { lead_id, filename } = req.params;

  try {
    const lead = await Lead.findByPk(lead_id);
    if (!lead) return sendErrorResponse(res, 404, "Lead not found");

    let uploadedFiles = Array.isArray(lead.uploadedFiles)
      ? lead.uploadedFiles
      : typeof lead.uploadedFiles === "string"
      ? JSON.parse(lead.uploadedFiles)
      : [];

    const fileIndex = uploadedFiles.findIndex(
      (filePath) => path.basename(filePath) === filename
    );

    if (fileIndex === -1)
      return sendErrorResponse(res, 404, "File not found in lead");

    const filePath = path.join(
      process.cwd(),
      uploadedFiles[fileIndex].replace(/^\//, "")
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    uploadedFiles.splice(fileIndex, 1);
    await lead.update({ uploadedFiles });

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete Lead File Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete lead file");
  }
};

exports.addFollowup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendErrorResponse(res, 400, errors.array()[0].msg);

  const {
    lead_id,
    leadStage,
    leadStatus,
    nextFollowUpDate,
    followup_desc,
    assignedTo,
    communicatedWith,
    additionalProducts,
  } = req.body;
  const org_id = req.user.org_id;
  const userId = req.user.id;

  try {
    // Get current (previous) lead state BEFORE any change
    const currentLead = await Lead.findByPk(lead_id, {
      attributes: ["leadStage", "leadStatus"],
    });
    if (!currentLead) return sendErrorResponse(res, 404, "Lead not found");

    const prevStage = currentLead.leadStage;
    const prevStatus = currentLead.leadStatus;

    // Normalize assignedTo array
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo.map((emp) => (typeof emp === "object" ? emp.id : emp))
      : [];

    // Get assignedRoleIds like in createLead
    let assignedRoleIds = [];
    if (assignedToArray.length > 0) {
      const employees = await Employee.findAll({
        where: { id: assignedToArray, org_id },
      });
      assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);
    }

    // Create new follow-up entry
    const followup = await Followup.create({
      lead_id,
      leadStage,
      leadStatus,
      followup_date: nextFollowUpDate, // ✅ assign explicitly
      nextFollowUpDate,
      followup_desc,
      assignedTo: assignedToArray,
      communicatedWith,
      additionalProducts,
    });

    // ✅ Update Lead with new follow-up details, status, and stage
    await Lead.update(
      {
        leadStage,
        leadStatus,
        followupDate: nextFollowUpDate, // ✅ Add follow-up date update
        assignedTo: assignedToArray,
        assignedRoleIds,
      },
      { where: { id: lead_id } }
    );

    // Fetch the updated lead instance
    const updatedLead = await Lead.findByPk(lead_id);

    const stageChanged = prevStage !== leadStage;
    const statusChanged = prevStatus !== leadStatus;

    if (stageChanged || statusChanged) {
      const { sendLeadStatusChangedEmail } = require("../utility/leadEmails");
      await sendLeadStatusChangedEmail(updatedLead, userId, assignedToArray);
    }

    // send followup scheduled email
    const { sendFollowupScheduledEmail } = require("../utility/leadEmails");
    await sendFollowupScheduledEmail(followup, updatedLead, assignedToArray);

    res.status(201).json({ message: "Follow-up added successfully", followup });
  } catch (error) {
    console.error("Add Followup Error:", error);
    return sendErrorResponse(res, 500, "Failed to add follow-up");
  }
};

exports.getFollowupsByLead = async (req, res) => {
  const { lead_id } = req.params;

  try {
    // Step 1: Fetch followups for the lead
    const followups = await Followup.findAll({
      where: { lead_id },
      order: [["id", "ASC"]],
    });

    // Step 2: Enrich followups with assignedTo names
    const enrichedFollowups = await Promise.all(
      followups.map(async (followup) => {
        let assignedToNames = [];
        const assignedIds = Array.isArray(followup.assignedTo)
          ? followup.assignedTo
          : typeof followup.assignedTo === "string"
          ? JSON.parse(followup.assignedTo)
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

        const followupJSON = followup.toJSON();
        return { ...followupJSON, assignedTo: assignedToNames };
      })
    );

    res.status(200).json(enrichedFollowups);
  } catch (error) {
    console.error("Fetch Followups Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch followups");
  }
};

exports.updateFollowup = async (req, res) => {
  const { id } = req.params;
  const {
    leadStage,
    leadStatus,
    followup_desc,
    nextFollowUpDate,
    assignedTo,
    communicatedWith,
    additionalProducts,
  } = req.body;
  const org_id = req.user.org_id;
  const userId = req.user.id;

  try {
    const followup = await Followup.findByPk(id);
    if (!followup) return sendErrorResponse(res, 404, "Follow-up not found");

    // Get current (previous) lead state BEFORE update
    const currentLead = await Lead.findByPk(followup.lead_id, {
      attributes: ["leadStage", "leadStatus"],
    });
    if (!currentLead) return sendErrorResponse(res, 404, "Lead not found");

    const prevStage = currentLead.leadStage;
    const prevStatus = currentLead.leadStatus;

    // Normalize assignedTo
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo.map((emp) => (typeof emp === "object" ? emp.id : emp))
      : [];

    // Fetch assignedRoleIds like in addFollowup
    let assignedRoleIds = [];
    if (assignedToArray.length > 0) {
      const employees = await Employee.findAll({
        where: { id: assignedToArray, org_id },
      });
      assignedRoleIds = employees.map((e) => e.role_id).filter(Boolean);
    }

    // ✅ Update followup fields (both followup_date & nextFollowUpDate)
    await followup.update({
      leadStage,
      leadStatus,
      followup_desc,
      followup_date: nextFollowUpDate, // keep consistency with addFollowup
      nextFollowUpDate,
      assignedTo: assignedToArray,
      communicatedWith,
      additionalProducts,
    });

    // ✅ Update the corresponding Lead as well
    await Lead.update(
      {
        leadStage,
        leadStatus,
        followupDate: nextFollowUpDate, // keep in sync with latest followup
        assignedTo: assignedToArray,
        assignedRoleIds,
      },
      { where: { id: followup.lead_id } }
    );

    // Fetch updated lead
    const updatedLead = await Lead.findByPk(followup.lead_id);

    const stageChanged = prevStage !== leadStage;
    const statusChanged = prevStatus !== leadStatus;

    if (stageChanged || statusChanged) {
      const { sendLeadStatusChangedEmail } = require("../utility/leadEmails");
      await sendLeadStatusChangedEmail(updatedLead, userId, assignedToArray);
    }

    // Also good to notify about followup update
    const { sendFollowupScheduledEmail } = require("../utility/leadEmails");
    await sendFollowupScheduledEmail(followup, updatedLead, assignedToArray);

    res.status(200).json({
      message: "Follow-up and lead updated successfully",
      followup,
    });
  } catch (error) {
    console.error("Update Followup Error:", error);
    return sendErrorResponse(res, 500, "Failed to update follow-up");
  }
};

exports.deleteFollowup = async (req, res) => {
  try {
    const { id } = req.params;
    const followup = await Followup.findByPk(id);
    if (!followup) return sendErrorResponse(res, 404, "Follow-up not found");

    const leadId = followup.lead_id;

    // Check if this is the default follow-up (first created)
    const firstFollowup = await Followup.findOne({
      where: { lead_id: leadId },
      order: [["id", "ASC"]], // earliest first
    });

    if (firstFollowup.id === followup.id) {
      return sendErrorResponse(
        res,
        400,
        "Default follow-up entry cannot be deleted"
      );
    }

    // Delete the follow-up
    await followup.destroy();

    // Fetch remaining follow-ups for this lead
    const remainingFollowups = await Followup.findAll({
      where: { lead_id: leadId },
      order: [["id", "DESC"]], // latest first
    });

    if (remainingFollowups.length > 0) {
      const lastFollowup = remainingFollowups[0];

      // Ensure assignedTo is an array, not string
      let assignedToArray = [];
      if (Array.isArray(lastFollowup.assignedTo)) {
        assignedToArray = lastFollowup.assignedTo;
      } else if (typeof lastFollowup.assignedTo === "string") {
        try {
          assignedToArray = JSON.parse(lastFollowup.assignedTo);
        } catch (e) {
          assignedToArray = [];
        }
      }

      // Update lead based on last follow-up
      await Lead.update(
        {
          assignedTo: assignedToArray,
          leadStage: lastFollowup.leadStage,
          leadStatus: lastFollowup.leadStatus,
          nextFollowUpDate: lastFollowup.nextFollowUpDate,
        },
        { where: { id: leadId } }
      );
    } else {
      // No follow-ups left, reset lead fields
      await Lead.update(
        {
          assignedTo: [],
          leadStage: null,
          leadStatus: null,
          nextFollowUpDate: null,
        },
        { where: { id: leadId } }
      );
    }

    res
      .status(200)
      .json({ message: "Follow-up deleted and lead updated successfully" });
  } catch (error) {
    console.error("Delete Followup Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete follow-up");
  }
};

const getEmployeeName = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId, {
      attributes: ["id", "salutation", "firstName", "middleName", "lastName"],
    });

    if (!employee) {
      return { name: "Unknown User" };
    }

    const fullName = [
      employee.salutation,
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return { name: fullName };
  } catch (error) {
    console.error("Error fetching employee name:", error);
    return { name: "Someone" };
  }
};

exports.markFollowupCompleted = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const userId = req.user.id;

  try {
    const followup = await Followup.findByPk(id, {
      include: [{ model: Lead, as: "lead" }],
    });

    if (!followup) {
      return sendErrorResponse(res, 404, "Follow-up not found");
    }

    if (followup.isCompleted) {
      return sendErrorResponse(res, 400, "Follow-up is already completed");
    }

    // Mark as completed
    await followup.update({
      isCompleted: true,
      completedAt: new Date(),
      completedBy: userId,
    });

    // Check if there are any other incomplete followups for this lead
    const otherIncompleteFollowups = await Followup.findAll({
      where: {
        lead_id: followup.lead_id,
        isCompleted: false,
        id: { [Op.ne]: id }, // exclude current followup
      },
    });

    // If no other incomplete followups, also mark the lead's followup as completed
    if (otherIncompleteFollowups.length === 0) {
      await Lead.update(
        {
          followupCompleted: true,
          followupCompletedAt: new Date(),
        },
        { where: { id: followup.lead_id } }
      );
    }

    // Send notification about completion
    const assignedTo = Array.isArray(followup.assignedTo)
      ? followup.assignedTo
      : JSON.parse(followup.assignedTo || "[]");

    const completerName = await getEmployeeName(userId);

    // Notify assigned employees
    await notifyAssignedEmployees(
      req.user.org_id,
      assignedTo,
      NOTIFICATION_TYPES.FOLLOWUP_COMPLETED,
      "✅ Follow-up Completed",
      `Follow-up for "${
        followup.lead?.companyName || "Lead"
      }" has been marked as completed by ${completerName.name || "Someone"}.`,
      {
        leadId: followup.lead_id,
        followupId: followup.id,
        companyName: followup.lead?.companyName,
        completedBy: completerName.name,
        completedAt: new Date().toISOString(),
      }
    );

    return res.status(200).json({
      message: "Follow-up marked as completed successfully",
      followup,
    });
  } catch (error) {
    console.error("Mark Followup Completed Error:", error);
    return sendErrorResponse(res, 500, "Failed to mark follow-up as completed");
  }
};
