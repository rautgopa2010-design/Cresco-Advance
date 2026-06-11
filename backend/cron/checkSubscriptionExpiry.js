const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");

const Register = db.register;

// Return only the date part (00:00:00 local system time)
const getDateOnly = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const updateExpiredSubscriptions = async () => {
  try {
    const today = getDateOnly(new Date());
    console.log(`Subscription Expiry Check → ${today.toDateString()}`);

    const candidates = await Register.findAll({
      where: {
        paymentStatus: "active",
        packageExpiryDate: {
          [Op.lt]: today,   // strictly before today
          [Op.ne]: null     // must not be null
        }
      },
      attributes: [
        "id",
        "company",
        "email",
        "packageExpiryDate",
        "packageDetails"
      ],
    });

    if (candidates.length === 0) {
      console.log("No active subscriptions past their expiry date.");
      return;
    }

    // Filter out provider accounts
    const toExpire = candidates.filter((org) => {
      const details = org.packageDetails;

      // Providers have packageDetails = "provider"
      if (details === "provider") return false;

      // If JSON stored as string – parse it safely
      if (typeof details === "string") {
        try {
          const parsed = JSON.parse(details);
          return parsed && parsed.packageName;
        } catch {
          return false;
        }
      }

      // If already JSON
      return details && details.packageName;
    });

    if (toExpire.length === 0) {
      console.log("No company subscriptions need to expire.");
      return;
    }

    console.log(`Found ${toExpire.length} expired company subscription(s):`);
    toExpire.forEach((org) => {
      console.log(
        ` → ${org.company} (ID: ${org.id}) – expired on ${org.packageExpiryDate.toDateString()}`
      );
    });

    // Mark them as expired
    await Promise.all(
      toExpire.map((org) =>
        org.update({ paymentStatus: "expired" })
      )
    );

    console.log(
      `${toExpire.length} subscription(s) successfully marked as EXPIRED`
    );

  } catch (error) {
    console.error("Subscription expiry cron error:", error);
  }
};

// // PRODUCTION — runs every day at 01:00 AM
cron.schedule("0 1 * * *", updateExpiredSubscriptions);

// // TESTING — runs every minute
// cron.schedule("*/1 * * * *", updateExpiredSubscriptions);
// console.log(
//   "Subscription expiry cron is ACTIVE – running every minute (testing mode)"
// );

module.exports = updateExpiredSubscriptions;
