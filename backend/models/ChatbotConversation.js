const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotConversation = sequelize.define(
    "chatbotConversation",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      widgetId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      visitorName: { type: DataTypes.STRING, allowNull: true },
      visitorEmail: { type: DataTypes.STRING, allowNull: true },
      visitorPhone: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM("AI Active", "Waiting for Agent", "Assigned", "Agent Active", "Resolved", "Closed"),
        allowNull: false,
        defaultValue: "AI Active",
      },
      sourceDomain: { type: DataTypes.STRING, allowNull: true },
      sessionKey: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_conversations`,
      timestamps: true,
    }
  );

  return ChatbotConversation;
};
