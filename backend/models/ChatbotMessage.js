const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotMessage = sequelize.define(
    "chatbotMessage",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      conversationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      senderType: {
        type: DataTypes.ENUM("visitor", "ai", "agent", "system"),
        allowNull: false,
      },
      message: { type: DataTypes.TEXT("long"), allowNull: false },
      confidence: { type: DataTypes.INTEGER, allowNull: true },
      references: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_messages`,
      timestamps: true,
    }
  );

  return ChatbotMessage;
};
