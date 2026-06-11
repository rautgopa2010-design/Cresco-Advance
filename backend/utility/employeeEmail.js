const brevoEmail = require("./brevoEmail");
const {
  createNotification,
  NOTIFICATION_TYPES,
} = require("./notificationHelper");

/**
 * Sends welcome email to newly created user
 * @param {string} toEmail
 * @param {string} fullName
 * @param {string} roleName
 * @param {string} companyName
 * @param {string} [password]
 */
async function sendWelcomeEmail(
  toEmail,
  fullName,
  roleName,
  companyName,
  password = null,
  org_id = null,
  user_id = null
) {
  try {
    const recipientName = fullName || toEmail.split("@")[0] || "User";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; }
          .header { background: #053054; color: white; padding: 25px; text-align: center; }
          .content { padding: 35px 30px; text-align: center; }
          .greeting { font-size: 26px; color: #053054; margin-bottom: 20px; }
          .info { font-size: 16px; color: #333; line-height: 1.6; margin: 20px 0; }
          .highlight { color: #053054; font-weight: bold; }
          .credentials { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 25px 0; 
            text-align: left; 
          }
          .button { 
            display: inline-block; 
            background: #053054; 
            color: white; 
            padding: 14px 35px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-size: 16px; 
            font-weight: bold; 
            margin: 25px 0; 
          }
          .footer { background: #f4f4f4; padding: 20px; font-size: 13px; color: #666; text-align: center; }
          .warning { color: #d32f2f; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to ${companyName}!</h2>
          </div>
          <div class="content">
            <p class="greeting">Hi ${recipientName},</p>
            
            <p class="info">
              Your account has been successfully created in <strong class="highlight">${companyName}</strong>.<br>
              You have been assigned the role of <strong class="highlight">${roleName}</strong>.
            </p>

            <div class="credentials">
              <strong>Login Details:</strong><br><br>
              <strong>Email:</strong> ${toEmail}<br>
              ${
                password
                  ? `<strong>Password:</strong> ${password} <br><br>
                     <span class="warning">Please change your password after first login for security.</span>`
                  : `<strong>Password:</strong> Use the password set during registration / provided by admin<br>`
              }
            </div>

            <p class="info">
              You can now log in to your dashboard and start using the platform.
            </p>

            <a href="${process.env.FRONTEND_URL}/signin" class="button">
              Login Now
            </a>

            <p class="warning" style="margin-top: 40px;">
              <strong>Security Tip:</strong> Never share your login credentials with anyone.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            <p>If you did not expect this email, please contact your administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await brevoEmail.sendEmail({
      to: toEmail,
      toName: recipientName,
      subject: `Welcome to ${companyName} – Your Account is Ready!`,
      htmlContent,
    });

    console.log(`Welcome email sent to ${toEmail} (role: ${roleName})`);

    // 🔔 PUSHER NOTIFICATION
    if (org_id && user_id) {
      await createNotification({
        org_id,
        user_id,
        type: NOTIFICATION_TYPES.EMPLOYEE_CREATED,
        title: "👋 Welcome Aboard!",
        message: `Your account has been created with role: ${roleName}`,
        data: {
          email: toEmail,
          name: fullName,
          role: roleName,
          company: companyName,
        },
      });
    }
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    // Do NOT throw — email failure should not block registration
  }
}

/**
 * Sends notification when user's role is changed
 * @param {string} toEmail
 * @param {string} fullName
 * @param {string} oldRole
 * @param {string} newRole
 * @param {string} companyName
 */
async function sendRoleChangeEmail(
  toEmail,
  fullName,
  oldRole,
  newRole,
  companyName,
  org_id = null,
  user_id = null
) {
  try {
    const recipientName = fullName || toEmail.split("@")[0] || "User";

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Role Update Notification - ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
            .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #053054; color: white; padding: 25px; text-align: center; }
            .content { padding: 35px 30px; text-align: center; }
            .greeting { font-size: 24px; color: #053054; margin-bottom: 20px; }
            .info { font-size: 16px; color: #333; line-height: 1.6; margin: 20px 0; }
            .role-change { 
              background: #fff3cd; 
              padding: 20px; 
              border-radius: 6px; 
              margin: 25px 0; 
              font-size: 18px; 
            }
            .old-role { color: #856404; }
            .new-role { color: #155724; font-weight: bold; }
            .button { 
              display: inline-block; 
              background: #053054; 
              color: white; 
              padding: 14px 35px; 
              text-decoration: none; 
              border-radius: 5px; 
              font-size: 16px; 
              font-weight: bold; 
              margin: 25px 0; 
            }
            .footer { background: #f4f4f4; padding: 20px; font-size: 13px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Role Update Notification</h2>
            </div>
            <div class="content">
              <p class="greeting">Hi ${recipientName},</p>
              
              <p class="info">
                Your role in <strong>${companyName}</strong> has been updated by an administrator.
              </p>
  
              <div class="role-change">
                <strong>Old Role:</strong> <span class="old-role">${oldRole}</span><br><br>
                <strong>New Role:</strong> <span class="new-role">${newRole}</span>
              </div>
  
              <p class="info">
                This change may affect your permissions and access to certain features.<br>
                Please log in to review your updated access.
              </p>
  
              <a href="${process.env.FRONTEND_URL}/signin" class="button">
                Log In Now
              </a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              <p>If you have questions about this change, contact your administrator.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    brevoEmail.sendEmail({
      to: toEmail,
      toName: recipientName,
      subject: `Role Changed: ${oldRole} → ${newRole} in ${companyName}`,
      htmlContent,
    });

    console.log(
      `Role change email sent to ${toEmail} (${oldRole} → ${newRole})`
    );

    // 🔔 PUSHER NOTIFICATION
    if (org_id && user_id) {
      await createNotification({
        org_id,
        user_id,
        type: NOTIFICATION_TYPES.EMPLOYEE_ROLE_CHANGED,
        title: "🔄 Role Updated",
        message: `Your role has been changed from ${oldRole} to ${newRole}`,
        data: {
          email: toEmail,
          name: fullName,
          oldRole,
          newRole,
          company: companyName,
        },
      });
    }
  } catch (err) {
    console.error("Failed to send role change email:", err);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendRoleChangeEmail,
};
