const brevoEmail = require("./brevoEmail");
const db = require("../models");

const Register = db.register;
const Employee = db.employee;
const Roles = db.roles;
const CompanySetup = db.companySetup;

/**
 * Send import success notification to Super Admin
 * @param {number} org_id - Organization ID
 * @param {string} importType - 'customers' or 'products'
 * @param {number} count - Number of records imported
 * @param {string} initiatedBy - Name of user who initiated import
 */
exports.sendImportSuccessEmail = async (org_id, importType, count, initiatedBy) => {
  try {
    // Get organization details
    const organization = await Register.findOne({
      where: { id: org_id }
    });

    if (!organization) {
      console.error(`Organization not found for org_id: ${org_id}`);
      return;
    }

    // Find Super Admin role for this organization
    const superAdminRole = await Roles.findOne({
      where: { 
        org_id, 
        role_name: "Super Admin" 
      }
    });

    if (!superAdminRole) {
      console.error(`Super Admin role not found for org_id: ${org_id}`);
      return;
    }

    // Find Super Admin employee
    const superAdmin = await Employee.findOne({
      where: { 
        org_id, 
        role_id: superAdminRole.id 
      },
      order: [["id", "ASC"]]
    });

    if (!superAdmin) {
      console.error(`Super Admin employee not found for org_id: ${org_id}`);
      return;
    }

    // Get company support info
    const companySetup = await CompanySetup.findOne({
      where: { org_id }
    });

    // Format Super Admin name
    const superAdminName = [superAdmin.salutation, superAdmin.firstName, superAdmin.middleName, superAdmin.lastName]
      .filter(Boolean)
      .join(" ");

    // Get current date and time in IST
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    const importDateTime = new Intl.DateTimeFormat("en-GB", options).format(now).replace(/\//g, "-");

    // Prepare email content
    const emailSubject = `${organization.company} - ${importType.charAt(0).toUpperCase() + importType.slice(1)} Import Successful`;
    
    const importTypeLabel = importType === 'customers' ? 'Customer' : 'Product';
    const importTypePlural = importType === 'customers' ? 'customers' : 'products';

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">${importTypeLabel} Import Successful</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="font-size: 16px; color: #333;">Dear <strong>${superAdminName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            This is to inform you that a bulk import of <strong>${importTypePlural}</strong> has been successfully completed for your organization <strong>${organization.company}</strong>.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #4CAF50; margin-top: 0; margin-bottom: 15px;">Import Summary</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 150px;"><strong>Import Type:</strong></td>
                <td style="padding: 8px 0; color: #333;">${importTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Records Imported:</strong></td>
                <td style="padding: 8px 0; color: #333;"><span style="background-color: #4CAF50; color: white; padding: 3px 10px; border-radius: 3px;">${count}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Import Date & Time:</strong></td>
                <td style="padding: 8px 0; color: #333;">${importDateTime} IST</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Initiated By:</strong></td>
                <td style="padding: 8px 0; color: #333;">${initiatedBy}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            All ${importTypePlural} have been successfully added to your system and are now available for use.
          </p>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">
              <strong>Next Steps:</strong> You can view and manage these ${importTypePlural} in your dashboard under the ${importTypeLabel} section.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          
          <p style="font-size: 14px; color: #999; line-height: 1.5;">
            This is an automated notification. If you have any questions or need assistance, please contact your system administrator or support team.
          </p>
          
          ${companySetup?.supportedEmail || companySetup?.supportedMobile ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                <strong>Need help?</strong>
              </p>
              ${companySetup.supportedEmail ? `<p style="font-size: 14px; color: #666; margin: 5px 0;">Email: ${companySetup.supportedEmail}</p>` : ''}
              ${companySetup.supportedMobile ? `<p style="font-size: 14px; color: #666; margin: 5px 0;">Mobile: ${companySetup.supportedMobile}</p>` : ''}
            </div>
          ` : ''}
          
          <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
            &copy; ${new Date().getFullYear()} ${organization.company}. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await brevoEmail.sendEmail({
      to: superAdmin.email,
      toName: superAdminName,
      subject: emailSubject,
      htmlContent: emailHTML,
    });

    console.log(`Import success email sent to Super Admin (${superAdmin.email}) for org_id: ${org_id}`);
    return result;

  } catch (error) {
    console.error("Error sending import success email:", error);
    // Don't throw error - we don't want to fail the import if email fails
  }
};