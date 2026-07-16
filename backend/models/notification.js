const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('notification', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(
          'lead_created',
          'lead_updated',
          'lead_assigned',
          'lead_status_changed',
          'followup_scheduled',
          'followup_reminder',
          'todays_followup',
          'missed_followup',
          'followup_completed',
          'employee_created',
          'employee_deleted',
          'employee_role_changed',
          'payment_success',
          'package_assigned',
          'account_activated',
          'account_deactivated',
          'ticket_created',
          'ticket_updated',
          'enquiry_received',
          'landing_enquiry',
          'customer_created',
          'customer_updated',
          'quotation_created',
          'order_created',
          'invoice_created',
          'password_changed',
          'login_alert',
          'stale_deal_alert',
          'auto_stage_suggestion',
          'automation_digest'
        ),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      data: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: `${dbConfig.tablePrefix}notifications`,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  
    return Notification;
  };
