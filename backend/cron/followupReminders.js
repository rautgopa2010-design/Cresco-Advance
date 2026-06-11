const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require('../models');
const { createNotification, NOTIFICATION_TYPES, notifyAssignedEmployees } = require('../utility/notificationHelper');
const { sendFollowupReminderEmail } = require('../utility/leadEmails');

const Followup = db.followup;
const Lead = db.lead;
const Employee = db.employee;

// Helper to safely parse assignedTo
const parseAssignedTo = (assignedTo) => {
  if (!assignedTo) return [];
  if (Array.isArray(assignedTo)) return assignedTo;
  try {
    return JSON.parse(assignedTo);
  } catch {
    return [];
  }
};

// Helper to get employee emails and user_ids
const getEmployeeDetails = async (employeeIds = []) => {
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) return [];
  try {
    const employees = await Employee.findAll({
      where: { id: employeeIds },
      attributes: ['id', 'email', 'user_id'],
      raw: true
    });
    return employees.filter(e => e.email && e.user_id);
  } catch (err) {
    console.error('getEmployeeDetails error:', err);
    return [];
  }
};

// Main reminder check function
const checkFollowupReminders = async () => {
  console.log('🔍 Running followup reminders check...', new Date().toLocaleString());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  
  try {
    // Get all incomplete followups
    const allFollowups = await Followup.findAll({
      where: {
        isCompleted: false
      },
      include: [{ 
        model: Lead, 
        as: 'lead',
        required: true 
      }]
    });

    console.log(`📊 Found ${allFollowups.length} active incomplete followups`);

    // Group followups by type for better processing
    const todayFollowups = [];
    const twoDayFollowups = [];
    const missedFollowups = [];

    for (const followup of allFollowups) {
      if (!followup.nextFollowUpDate) continue;
      
      // Parse followup date (assuming format DD-MM-YYYY)
      const [day, month, year] = followup.nextFollowUpDate.split('-');
      const followupDate = new Date(`${year}-${month}-${day}`);
      followupDate.setHours(0, 0, 0, 0);
      
      const assignedTo = parseAssignedTo(followup.assignedTo);
      
      // Skip if no assigned users
      if (assignedTo.length === 0) continue;

      // Categorize followups
      if (followupDate.getTime() === today.getTime()) {
        todayFollowups.push({ followup, assignedTo, followupDate });
      } else if (followupDate.getTime() === twoDaysFromNow.getTime()) {
        twoDayFollowups.push({ followup, assignedTo, followupDate });
      } else if (followupDate < today) {
        missedFollowups.push({ followup, assignedTo, followupDate });
      }
    }

    // Process Today's Followups
    console.log(`📅 Processing ${todayFollowups.length} today's followups`);
    for (const item of todayFollowups) {
      const { followup, assignedTo } = item;
      
      // Send email reminders
      await sendFollowupReminderEmail(followup, followup.lead, assignedTo, 'today');
      
      // Send push notifications
      const employeeDetails = await getEmployeeDetails(assignedTo);
      for (const emp of employeeDetails) {
        await createNotification({
          org_id: followup.lead.org_id,
          user_id: emp.user_id,
          type: NOTIFICATION_TYPES.TODAYS_FOLLOWUP,
          title: '📅 Today\'s Follow-up',
          message: `You have a follow-up scheduled today for "${followup.lead.companyName}".`,
          data: {
            leadId: followup.lead.id,
            followupId: followup.id,
            companyName: followup.lead.companyName,
            followupDate: followup.nextFollowUpDate,
            description: followup.followup_desc,
            leadStage: followup.leadStage,
            leadStatus: followup.leadStatus
          }
        });
      }
    }

    // Process 2-day reminders
    console.log(`⏰ Processing ${twoDayFollowups.length} followups in 2 days`);
    for (const item of twoDayFollowups) {
      const { followup, assignedTo } = item;
      
      await sendFollowupReminderEmail(followup, followup.lead, assignedTo, 'upcoming');
      
      const employeeDetails = await getEmployeeDetails(assignedTo);
      for (const emp of employeeDetails) {
        await createNotification({
          org_id: followup.lead.org_id,
          user_id: emp.user_id,
          type: NOTIFICATION_TYPES.FOLLOWUP_REMINDER,
          title: '⏰ Follow-up in 2 Days',
          message: `Follow-up for "${followup.lead.companyName}" is scheduled in 2 days.`,
          data: {
            leadId: followup.lead.id,
            followupId: followup.id,
            companyName: followup.lead.companyName,
            followupDate: followup.nextFollowUpDate,
            description: followup.followup_desc
          }
        });
      }
    }

    // Process Missed Followups
    console.log(`⚠️ Processing ${missedFollowups.length} missed followups`);
    for (const item of missedFollowups) {
      const { followup, assignedTo } = item;
      
      await sendFollowupReminderEmail(followup, followup.lead, assignedTo, 'missed');
      
      const employeeDetails = await getEmployeeDetails(assignedTo);
      for (const emp of employeeDetails) {
        await createNotification({
          org_id: followup.lead.org_id,
          user_id: emp.user_id,
          type: NOTIFICATION_TYPES.MISSED_FOLLOWUP,
          title: '⚠️ Missed Follow-up',
          message: `Follow-up for "${followup.lead.companyName}" was scheduled for ${followup.nextFollowUpDate} and is now overdue.`,
          data: {
            leadId: followup.lead.id,
            followupId: followup.id,
            companyName: followup.lead.companyName,
            scheduledDate: followup.nextFollowUpDate,
            description: followup.followup_desc
          }
        });
      }
    }

    console.log('✅ Followup reminders check completed', new Date().toLocaleString());

  } catch (error) {
    console.error('❌ Followup reminders error:', error);
  }
};

// Run at 8:00 AM every day
cron.schedule('0 8 * * *', checkFollowupReminders);

// // For testing - runs every minute (comment this out in production)
// cron.schedule('* * * * *', checkFollowupReminders);

console.log('✅ Followup reminders cron scheduled');