const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotKnowledgeSource = sequelize.define(
    "chatbotKnowledgeSource",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      sourceType: {
        type: DataTypes.ENUM("manual_text", "document", "url", "product_service"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Draft", "Processing", "Active", "Failed", "Archived"),
        allowNull: false,
        defaultValue: "Draft",
      },
      language: { type: DataTypes.STRING, allowNull: false, defaultValue: "English" },
      url: { type: DataTypes.TEXT, allowNull: true },
      filePath: { type: DataTypes.TEXT, allowNull: true },
      fileName: { type: DataTypes.STRING, allowNull: true },
      fileMimeType: { type: DataTypes.STRING, allowNull: true },
      fileSize: { type: DataTypes.INTEGER, allowNull: true },
      contentText: { type: DataTypes.TEXT("long"), allowNull: true },
      processedSummary: { type: DataTypes.TEXT, allowNull: true },
      errorDetails: { type: DataTypes.TEXT, allowNull: true },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
      lastIndexedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_knowledge_sources`,
      timestamps: true,
    }
  );

  return ChatbotKnowledgeSource;
};
