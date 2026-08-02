const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotSupportRequest = sequelize.define(
    "chatbotSupportRequest",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      conversationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      category: { type: DataTypes.STRING, allowNull: true },
      subject: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      referenceNumber: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Closed"), allowNull: false, defaultValue: "Open" },
      assignedTo: { type: DataTypes.INTEGER, allowNull: true },
      consentAcceptedAt: { type: DataTypes.DATE, allowNull: true },
      sourceDomain: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_support_requests`,
      timestamps: true,
    }
  );

  return ChatbotSupportRequest;
};
