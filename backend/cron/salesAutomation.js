const cron = require("node-cron");
const { runSalesAutomationForAllOrgs } = require("../utility/salesAutomationEngine");

const runAutomation = async () => {
  try {
    console.log("Running CRM automation checks...", new Date().toLocaleString());
    const results = await runSalesAutomationForAllOrgs();
    const notifications = results.reduce((sum, item) => sum + (item.notificationsCreated || 0), 0);
    console.log(`CRM automation completed for ${results.length} org(s). Notifications created: ${notifications}`);
  } catch (error) {
    console.error("CRM automation cron error:", error);
  }
};

cron.schedule("30 9 * * *", runAutomation);

console.log("CRM automation cron scheduled");
