const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskAuditLog = sequelize.define(
    "customerHelpdeskAuditLog",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      ticketId: { type: DataTypes.INTEGER, allowNull: true },
      actorType: {
        type: DataTypes.ENUM("employee", "customer_portal", "system", "provider"),
        allowNull: false,
      },
      actorUserId: { type: DataTypes.INTEGER, allowNull: true },
      actorPortalUserId: { type: DataTypes.INTEGER, allowNull: true },
      action: { type: DataTypes.STRING, allowNull: false },
      entityType: { type: DataTypes.STRING, allowNull: false },
      entityId: { type: DataTypes.INTEGER, allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
      userAgent: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_audit_logs`,
      timestamps: true,
      indexes: [
        { fields: ["org_id", "ticketId"] },
        { fields: ["org_id", "action"] },
      ],
    }
  );

  CustomerHelpdeskAuditLog.associate = (models) => {
    CustomerHelpdeskAuditLog.belongsTo(models.customerHelpdeskTicket, {
      foreignKey: "ticketId",
      as: "ticket",
      constraints: false,
    });
  };

  return CustomerHelpdeskAuditLog;
};
