const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotFaq = sequelize.define(
    "chatbotFaq",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      question: { type: DataTypes.TEXT, allowNull: false },
      answer: { type: DataTypes.TEXT("long"), allowNull: false },
      category: { type: DataTypes.STRING, allowNull: true },
      language: { type: DataTypes.STRING, allowNull: false, defaultValue: "English" },
      status: { type: DataTypes.ENUM("Draft", "Active", "Archived"), allowNull: false, defaultValue: "Active" },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_faqs`,
      timestamps: true,
    }
  );

  return ChatbotFaq;
};
