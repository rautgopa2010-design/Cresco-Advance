const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");

const Order = db.order;
const OrderPaymentSchedule = db.orderPaymentSchedule;

// Helper: Convert "dd-mm-yyyy" → JS Date (local midnight)
function parseDateString(dateStr) {
  const [dd, mm, yyyy] = dateStr.split("-").map(Number);
  // returns date at local 00:00:00
  return new Date(yyyy, mm - 1, dd);
}

// Helper: normalize a Date to local midnight (zero out time)
function normalizeDate(d) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

const checkAndCancelOverdueSchedules = async () => {
  try {
    // Normalize today's date to local midnight so comparisons are date-only
    const today = normalizeDate(new Date());

    console.log("🔄 Cron Job Running: Checking overdue payment schedules...");

    // Fetch all schedules that are NOT canceled or completed
    const allSchedules = await OrderPaymentSchedule.findAll({
      where: {
        status: { [Op.notIn]: ["Canceled", "Completed"] },
      },
    });

    if (allSchedules.length === 0) {
      console.log("✅ No active schedules found.");
      return;
    }

    // Group schedules by order_id
    const schedulesByOrder = {};
    for (const schedule of allSchedules) {
      if (!schedulesByOrder[schedule.order_id]) {
        schedulesByOrder[schedule.order_id] = [];
      }
      schedulesByOrder[schedule.order_id].push(schedule);
    }

    // Process each order group
    for (const [orderId, schedules] of Object.entries(schedulesByOrder)) {
      const overdueSchedules = schedules.filter((s) => {
        // parse and normalize schedule due date
        const dueDate = normalizeDate(parseDateString(s.dueDate));
        // Only mark overdue if dueDate is strictly before today.
        // This ensures schedules with dueDate === today are NOT considered overdue.
        return dueDate < today && s.dueAmount > 0;
      });

      if (overdueSchedules.length > 0) {
        // Cancel all schedules of that order (update objects in parallel)
        const cancelSchedulePromises = schedules.map((s) => {
          s.status = "Canceled";
          return s.save();
        });
        await Promise.all(cancelSchedulePromises);

        // Cancel the order
        const order = await Order.findOne({ where: { id: orderId } });
        if (order) {
          order.status = "Canceled";
          await order.save();
          console.log(
            `🚫 Order ${orderId} marked as Canceled (All schedules canceled)`
          );
        }
      }
    }

    console.log("✅ Overdue schedule check completed successfully.");
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
};

// Run every day at midnight "0 0 * * *" & for evenry minute "*/1 * * * *"
cron.schedule("0 0 * * *", () => {
  checkAndCancelOverdueSchedules();
});

module.exports = checkAndCancelOverdueSchedules;
