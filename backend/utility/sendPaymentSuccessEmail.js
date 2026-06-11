const brevoEmail = require("./brevoEmail");
const {
  createNotification,
  NOTIFICATION_TYPES,
} = require("./notificationHelper");

async function sendPaymentSuccessEmail({
  toEmail,
  toName,
  companyName,
  packageName,
  amount,
  currencySymbol = "₹",
  durationValue,
  durationType = "days",
  paymentMethod = "Online",
  transactionId = "",
  paymentDate = new Date().toISOString().split("T")[0],
}) {
  const recipientName = toName || toEmail.split("@")[0] || "Super Admin";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Successful - ${companyName}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
        .container { max-width: 620px; margin: 25px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #053054; color: white; padding: 25px; text-align: center; }
        .content { padding: 35px 30px; text-align: center; }
        .success { color: #2e7d32; font-size: 26px; margin: 0 0 20px; font-weight: bold; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0; text-align: left; }
        .detail-row { margin: 12px 0; font-size: 16px; }
        .label { font-weight: bold; color: #444; width: 180px; display: inline-block; }
        .value { color: #222; }
        .thanks { font-size: 18px; margin: 30px 0 10px; color: #053054; }
        .support { color: #555; font-size: 15px; margin-top: 30px; }
        .button { display: inline-block; background: #053054; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; font-size: 13px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Payment Received Successfully!</h2>
        </div>
        <div class="content">
          <p class="success">Thank You!</p>
          <p>Your payment for <strong>${packageName}</strong> has been successfully processed.</p>

          <div class="details">
            <div class="detail-row">
              <span class="label">Company:</span>
              <span class="value">${companyName || "Your Company"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Package:</span>
              <span class="value">${packageName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount Paid:</span>
              <span class="value">${currencySymbol}${amount.toLocaleString(
    "en-IN"
  )}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${durationValue} ${durationType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">${paymentMethod}</span>
            </div>
            ${
              transactionId
                ? `<div class="detail-row">
                    <span class="label">Transaction ID:</span>
                    <span class="value">${transactionId}</span>
                  </div>`
                : ""
            }
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${paymentDate}</span>
            </div>
          </div>

          <p class="thanks">We're excited to have you on board!</p>
          <a href="${
            process.env.FRONTEND_URL
          }/dashboard" class="button">Go to Dashboard</a>

          <p class="support">
            If you have any questions, feel free to contact support.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${
    companyName || "Your Company"
  }. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await brevoEmail.sendEmail({
      to: toEmail,
      toName: recipientName,
      subject: `Payment Successful - ${packageName} for ${companyName}`,
      htmlContent,
    });

    console.log(`Payment success email sent to ${toEmail}`);

    // 🔔 PUSHER NOTIFICATION
    if (org_id) {
      await createNotification({
        org_id,
        user_id,
        type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
        title: "💰 Payment Successful",
        message: `Payment of ${currencySymbol}${amount} for package "${packageName}" was successful.`,
        data: {
          amount,
          currencySymbol,
          packageName,
          paymentMethod,
          transactionId,
          paymentDate,
          companyName,
        },
      });
    }
  } catch (err) {
    console.error("Failed to send payment success email:", err);
    // → Do NOT throw — email failure should not fail the API response
  }
}

module.exports = { sendPaymentSuccessEmail };
