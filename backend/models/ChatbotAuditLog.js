const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotAuditLog = sequelize.define(
    "chatbotAuditLog",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: true },
      providerOrgId: { type: DataTypes.INTEGER, allowNull: true },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      actorType: {
        type: DataTypes.ENUM("provider", "organization"),
        allowNull: false,
        defaultValue: "organization",
      },
      action: { type: DataTypes.STRING, allowNull: false },
      entityType: { type: DataTypes.STRING, allowNull: true },
      entityId: { type: DataTypes.STRING, allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_audit_logs`,
      timestamps: true,
    }
  );

  return ChatbotAuditLog;
};
