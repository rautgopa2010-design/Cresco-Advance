const brevoEmail = require("./brevoEmail");
const { Op } = require("sequelize");
const db = require("../models");
const {
  createNotification,
  NOTIFICATION_TYPES,
  notifyAssignedEmployees,
} = require("./notificationHelper");
const Employee = db.employee;

const sendEmail = async ({ to, subject, html, text = "" }) => {
  try {
    await brevoEmail.sendEmail({
      to: to,
      toName: to.split("@")[0] || "User",
      subject: subject,
      htmlContent: html,
      textContent: text,
    });
    return true;
  } catch (err) {
    console.error("Email error:", err?.message || err);
    return false;
  }
};

const getEmployeeEmails = async (employeeIds = []) => {
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) return [];
  try {
    const employees = await Employee.findAll({
      where: { id: employeeIds },
      attributes: ["email", "user_id"],
      raw: true,
    });
    return employees
      .map((e) => ({ email: e.email, user_id: e.user_id }))
      .filter((e) => e.email);
  } catch (err) {
    console.error("getEmployeeEmails error:", err);
    return [];
  }
};

const getEmployeeName = async (userId) => {
  if (!userId) return "System";
  try {
    const emp = await Employee.findOne({
      where: { user_id: userId },
      attributes: ["salutation", "firstName", "middleName", "lastName"],
      raw: true,
    });
    if (!emp) return "Unknown";
    return {
      name:
        [emp.salutation, emp.firstName, emp.middleName, emp.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "Unknown",
      org_id: emp.org_id,
    };
  } catch (err) {
    console.error("getEmployeeName error:", err);
    return { name: "System", org_id: null };
  }
};

// ─── 1. Lead Created ────────────────────────────────────────
const sendLeadCreatedEmail = async (lead, createdByUserId, assignedToIds) => {
  const creator = await getEmployeeName(createdByUserId);
  const employees = await getEmployeeEmails(assignedToIds);
  const emails = employees.map((e) => e.email);
  if (!emails.length) return;

  const subject = `New Lead: ${lead.companyName || "Unnamed Lead"}`;

  const html = `
    <h2>New Lead Created</h2>
    <p><b>Company:</b> ${lead.companyName || "—"}</p>
    <p><b>Customer Person:</b> ${lead.customerPerson || "—"}</p>
    <p><b>Created by:</b> ${creator.name || creator}</p>
    <p><b>Assigned To Email:</b> ${emails}</p>
    <p><b>Stage:</b> ${lead.leadStage || "—"}</p>
    <p><b>Status:</b> ${lead.leadStatus || "—"}</p>
    <p><b>Expected Amount:</b> ${lead.expectedAmount || "—"}</p>
    <p><b>Next Follow-up:</b> ${lead.date || "Not set"}</p>
    <p><b>Description:</b> ${lead.description || "Not set"}</p>
    <br><p>Please review in the system.</p>
  `;

  for (const email of emails) {
    await sendEmail({ to: email, subject, html });
  }

  // 🔔 PUSHER NOTIFICATION
  for (const emp of employees) {
    if (emp.user_id) {
      await createNotification({
        org_id: lead.org_id,
        user_id: emp.user_id,
        type: NOTIFICATION_TYPES.LEAD_CREATED,
        title: "📋 New Lead Created",
        message: `New lead "${
          lead.companyName || "Unnamed"
        }" has been created and assigned to you.`,
        data: {
          leadId: lead.id,
          companyName: lead.companyName,
          customerPerson: lead.customerPerson,
          createdBy: creator.name || creator,
          leadStage: lead.leadStage,
          leadStatus: lead.leadStatus,
          expectedAmount: lead.expectedAmount,
          followupDate: lead.date,
        },
      });
    }
  }
};

// ─── 2. Lead Updated ────────────────────────────────────────
const sendLeadUpdatedEmail = async (lead, updatedByUserId, assignedToIds) => {
  const updatedBy = await getEmployeeName(updatedByUserId);
  const employees = await getEmployeeEmails(assignedToIds);
  const emails = employees.map((e) => e.email);
  if (!emails.length) return;

  const subject = `Lead Updated: ${lead.companyName || "Lead"}`;

  const html = `
      <h2>Lead Has Been Updated</h2>
      <p><b>Company:</b> ${lead.companyName || "—"}</p>
      <p><b>Customer Person:</b> ${lead.customerPerson || "—"}</p>
    <p><b>Assigned To Email:</b> ${emails}</p>
      <p><b>Stage:</b> ${lead.leadStage || "—"}</p>
      <p><b>Status:</b> ${lead.leadStatus || "—"}</p>
      <p><b>Expected Amount:</b> ${lead.expectedAmount || "—"}</p>
      <p><b>Next Follow-up:</b> ${lead.date || "—"}</p>
      <p><b>Description:</b> ${lead.description || "Not set"}</p>
       <p><b>Updated by:</b> ${updatedBy.name || updatedBy}</p>
      <br>
      <p>The lead details or assignments have changed. Please review the latest information in the system.</p>
    `;

  for (const email of emails) {
    await sendEmail({ to: email, subject, html });
  }

  // 🔔 PUSHER NOTIFICATION
  for (const emp of employees) {
    if (emp.user_id) {
      await createNotification({
        org_id: lead.org_id,
        user_id: emp.user_id,
        type: NOTIFICATION_TYPES.LEAD_UPDATED,
        title: "✏️ Lead Updated",
        message: `Lead "${lead.companyName || "Unnamed"}" has been updated.`,
        data: {
          leadId: lead.id,
          companyName: lead.companyName,
          updatedBy: updatedBy.name || updatedBy,
          leadStage: lead.leadStage,
          leadStatus: lead.leadStatus,
          followupDate: lead.date,
        },
      });
    }
  }
};

// ─── 3. Lead Assigned ───────────────────────────────────────
const sendLeadAssignedEmail = async (
  lead,
  newAssignedIds,
  previousAssignedIds = []
) => {
  const newEmployees = await getEmployeeEmails(newAssignedIds);
  const oldEmployees = await getEmployeeEmails(previousAssignedIds);

  const newlyAssigned = newEmployees.filter(
    (e) => !oldEmployees.some((old) => old.user_id === e.user_id)
  );
  if (!newlyAssigned.length) return;

  const subject = `Lead Assigned: ${lead.companyName || "Lead"}`;

  const html = `
    <h2>You've been assigned a lead</h2>
    <p><b>Company:</b> ${lead.companyName || "—"}</p>
    <p><b>Stage:</b> ${lead.leadStage || "—"}</p>
    <p><b>Status:</b> ${lead.leadStatus || "—"}</p>
    <p><b>Next Follow-up:</b> ${lead.followupDate || "—"}</p>
    <br><p>Please take action.</p>
  `;

  for (const email of newlyAssigned) {
    await sendEmail({ to: email, subject, html });

    // 🔔 PUSHER NOTIFICATION
    if (emp.user_id) {
      await createNotification({
        org_id: lead.org_id,
        user_id: emp.user_id,
        type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
        title: "👤 Lead Assigned To You",
        message: `Lead "${
          lead.companyName || "Unnamed"
        }" has been assigned to you.`,
        data: {
          leadId: lead.id,
          companyName: lead.companyName,
          leadStage: lead.leadStage,
          leadStatus: lead.leadStatus,
          followupDate: lead.followupDate,
        },
      });
    }
  }
};

// ─── 4. Status / Stage Changed ──────────────────────────────
const sendLeadStatusChangedEmail = async (
  lead,
  changedByUserId,
  assignedToIds
) => {
  const changedBy = await getEmployeeName(changedByUserId);
  const employees = await getEmployeeEmails(assignedToIds);
  const emails = employees.map((e) => e.email);
  if (!emails.length) return;

  const subject = `Lead Status or Stage Updated: ${lead.companyName || "Lead"}`;

  const html = `
    <h2>Lead Status or Stage Updated</h2>
    <p><b>Company:</b> ${lead.companyName || "—"}</p>
    <p><b>Stage:</b> ${lead.leadStage || "—"}</p>
    <p><b>Status:</b> ${lead.leadStatus || "—"}</p>
    <p><b>Changed by:</b> ${changedBy.name || changedBy}</p>
    <p><b>Next Follow-up:</b> ${lead.followupDate || "—"}</p>
    <br><p>Please review.</p>
  `;

  for (const email of emails) {
    await sendEmail({ to: email, subject, html });
  }
  // 🔔 PUSHER NOTIFICATION
  for (const emp of employees) {
    if (emp.user_id) {
      await createNotification({
        org_id: lead.org_id,
        user_id: emp.user_id,
        type: NOTIFICATION_TYPES.LEAD_STATUS_CHANGED,
        title: "🔄 Lead Status Updated",
        message: `Lead "${
          lead.companyName || "Unnamed"
        }" status/stage has been changed.`,
        data: {
          leadId: lead.id,
          companyName: lead.companyName,
          changedBy: changedBy.name || changedBy,
          leadStage: lead.leadStage,
          leadStatus: lead.leadStatus,
          followupDate: lead.followupDate,
        },
      });
    }
  }
};

// ─── 5. Follow-up Scheduled / Updated ───────────────────────
const sendFollowupScheduledEmail = async (followup, lead, assignedToIds) => {
  const employees = await getEmployeeEmails(assignedToIds);
  const emails = employees.map((e) => e.email);
  if (!emails.length) return;

  const subject = `Follow-up: ${lead.companyName || "Lead"} - ${
    followup.nextFollowUpDate || "?"
  }`;

  const html = `
    <h2>Follow-up Scheduled</h2>
    <p><b>Company:</b> ${lead.companyName || "—"}</p>
    <p><b>Date:</b> ${followup.nextFollowUpDate || "—"}</p>
    <p><b>Description:</b> ${followup.followup_desc || "No description"}</p>
    <p><b>Stage:</b> ${followup.leadStage || "—"}</p>
    <p><b>Status:</b> ${followup.leadStatus || "—"}</p>
    <br><p>Please prepare.</p>
  `;

  for (const email of emails) {
    await sendEmail({ to: email, subject, html });
  }

  // 🔔 PUSHER NOTIFICATION
  for (const emp of employees) {
    if (emp.user_id) {
      await createNotification({
        org_id: lead.org_id,
        user_id: emp.user_id,
        type: NOTIFICATION_TYPES.FOLLOWUP_SCHEDULED,
        title: "📅 Follow-up Scheduled",
        message: `Follow-up scheduled for lead "${
          lead.companyName || "Unnamed"
        }" on ${followup.nextFollowUpDate || "soon"}.`,
        data: {
          leadId: lead.id,
          followupId: followup.id,
          companyName: lead.companyName,
          followupDate: followup.nextFollowUpDate,
          description: followup.followup_desc,
          leadStage: followup.leadStage,
          leadStatus: followup.leadStatus,
        },
      });
    }
  }
};

// 6) Followup reminder (i.e. if two date remaning on that date when followup date is there i.e. if followupdate is 04-01-2026 so give email of reminder on 02-02-2026 and still not solved then also give until 04-01-2026 )

// 7) Todays Followup Reminder (i.e. only new entry todays followup okay means if one todays followup is solved and shedued another then dont calcuae that on todays followup)

// 8) Missed Followup Reminder (i.e. only new entry missed followup okay means if one missed followup is solved and shedued another then dont calcuae that on missed followup)

const sendFollowupReminderEmail = async (followup, lead, assignedToIds, type = 'upcoming') => {
  const employees = await getEmployeeEmails(assignedToIds);
  const emails = employees.map(e => e.email);
  
  if (!emails.length) return;

  let subject, html;
  
  if (type === 'today') {
    subject = `⏰ Today's Follow-up: ${lead.companyName}`;
    html = `
      <h2>Follow-up Reminder - Today</h2>
      <p><b>Company:</b> ${lead.companyName || "—"}</p>
      <p><b>Follow-up Date:</b> ${followup.nextFollowUpDate}</p>
      <p><b>Description:</b> ${followup.followup_desc || "No description"}</p>
      <p><b>Stage:</b> ${followup.leadStage || "—"}</p>
      <p><b>Status:</b> ${followup.leadStatus || "—"}</p>
      <br><p>This follow-up is scheduled for today. Please complete it.</p>
    `;
  } else if (type === 'missed') {
    subject = `⚠️ Missed Follow-up: ${lead.companyName}`;
    html = `
      <h2>Follow-up Reminder - Missed</h2>
      <p><b>Company:</b> ${lead.companyName || "—"}</p>
      <p><b>Scheduled Date:</b> ${followup.nextFollowUpDate}</p>
      <p><b>Description:</b> ${followup.followup_desc || "No description"}</p>
      <p><b>Stage:</b> ${followup.leadStage || "—"}</p>
      <p><b>Status:</b> ${followup.leadStatus || "—"}</p>
      <br><p>This follow-up is overdue. Please take action.</p>
    `;
  } else {
    subject = `⏰ Upcoming Follow-up: ${lead.companyName}`;
    html = `
      <h2>Follow-up Reminder</h2>
      <p><b>Company:</b> ${lead.companyName || "—"}</p>
      <p><b>Scheduled Date:</b> ${followup.nextFollowUpDate}</p>
      <p><b>Description:</b> ${followup.followup_desc || "No description"}</p>
      <p><b>Stage:</b> ${followup.leadStage || "—"}</p>
      <p><b>Status:</b> ${followup.leadStatus || "—"}</p>
      <br><p>Please prepare for this upcoming follow-up.</p>
    `;
  }

  for (const email of emails) {
    await sendEmail({ to: email, subject, html });
  }
};

// Landing Page Welcome Email
const sendLandingPageWelcomeEmail = async (leadData) => {
  const { name, email, leadSource, companyName, mobile, companySlug, org_id } =
    leadData;

  if (!email) {
    console.log("No email provided for landing page lead");
    return false;
  }

  const subject = `Welcome to ${
    companyName || "Our Company"
  } - Thank You for Your Enquiry`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 5px 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .welcome-message {
          font-size: 18px;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f0f8ff;
          border-left: 4px solid #4CAF50;
          border-radius: 3px;
        }
        .details {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .details table {
          width: 100%;
          border-collapse: collapse;
        }
        .details td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .details td:first-child {
          font-weight: bold;
          width: 120px;
          color: #555;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #777;
          font-size: 14px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
        .button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${companyName || "Our Company"}!</h1>
        </div>
        <div class="content">
          <div class="welcome-message">
            <h3>Hello ${name},</h3>
            <p>Thank you for reaching out to us! We have received your enquiry and our team will get back to you shortly.</p>
          </div>
          
          <h3>Your Enquiry Details:</h3>
          <div class="details">
            <table>
              <tr>
                <td>Name:</td>
                <td>${name}</td>
              </tr>
              ${
                companyName
                  ? `
              <tr>
                <td>Company:</td>
                <td>${companyName}</td>
              </tr>
              `
                  : ""
              }
              <tr>
                <td>Email:</td>
                <td>${email}</td>
              </tr>
              <tr>
                <td>Mobile:</td>
                <td>${mobile}</td>
              </tr>
              ${
                leadSource
                  ? `
              <tr>
                <td>Lead Source:</td>
                <td>${leadSource}</td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul style="margin-left: 20px; color: #555;">
            <li>Our team will review your enquiry within 24-48 hours</li>
            <li>You will receive a follow-up call or email from our representative</li>
            <li>We'll discuss your requirements and provide you with the best solution</li>
          </ul>
          
          <p style="margin-top: 20px;">If you have any urgent questions, please don't hesitate to contact us.</p>
          
          <div style="text-align: center;">
            <a href="mailto:support@crescosoft.com" class="button">Contact Support</a>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The ${companyName || "CRESCO"} Team</p>
            <p style="font-size: 12px; margin-top: 10px;">
              This is an automated message, please do not reply directly to this email.<br>
              &copy; ${new Date().getFullYear()} ${
    companyName || "CRESCO"
  }. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to ${companyName || "Our Company"}!

Hello ${name},

Thank you for reaching out to us! We have received your enquiry and our team will get back to you shortly.

Your Enquiry Details:
- Name: ${name}
${companyName ? `- Company: ${companyName}` : ""}
- Email: ${email}
- Mobile: ${mobile}
${leadSource ? `- Lead Source: ${leadSource}` : ""}

What happens next?
- Our team will review your enquiry within 24-48 hours
- You will receive a follow-up call or email from our representative
- We'll discuss your requirements and provide you with the best solution

If you have any urgent questions, please don't hesitate to contact us at support@crescosoft.com.

Best regards,
The ${companyName || "CRESCO"} Team
  `;

  const result = await sendEmail({ to: email, subject, html, text });

  // 🔔 PUSHER NOTIFICATION (to organization admins)
  if (org_id) {
    await createNotification({
      org_id,
      type: NOTIFICATION_TYPES.LANDING_ENQUIRY,
      title: "📩 New Landing Page Enquiry",
      message: `New enquiry received from ${name} (${email})`,
      data: {
        name,
        email,
        mobile,
        companyName,
        leadSource,
        companySlug,
      },
      broadcast_to: "org",
    });
  }

  return result;
};

module.exports = {
  sendLeadCreatedEmail,
  sendLeadUpdatedEmail,
  sendLeadAssignedEmail,
  sendLeadStatusChangedEmail,
  sendFollowupScheduledEmail,
  sendLandingPageWelcomeEmail,
  sendFollowupReminderEmail,
};
