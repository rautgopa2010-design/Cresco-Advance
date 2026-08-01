const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotConfiguration = sequelize.define(
    "chatbotConfiguration",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      chatbotName: { type: DataTypes.STRING, allowNull: false, defaultValue: "AI Assistant" },
      greeting: { type: DataTypes.STRING, allowNull: false, defaultValue: "Hi!" },
      subtitle: { type: DataTypes.STRING, allowNull: false, defaultValue: "How can we help you today?" },
      primaryColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#4f46e5" },
      secondaryColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#0f172a" },
      headerBackground: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
      textColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#0f172a" },
      buttonColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#4f46e5" },
      widgetPosition: { type: DataTypes.ENUM("left", "right"), allowNull: false, defaultValue: "right" },
      borderRadius: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 16 },
      styleMode: { type: DataTypes.ENUM("light", "dark"), allowNull: false, defaultValue: "light" },
      onlineText: { type: DataTypes.STRING, allowNull: false, defaultValue: "Online" },
      offlineText: { type: DataTypes.STRING, allowNull: false, defaultValue: "Away" },
      actionCards: { type: DataTypes.JSON, allowNull: true },
      visibleContactFields: { type: DataTypes.JSON, allowNull: true },
      contactInfo: { type: DataTypes.JSON, allowNull: true },
      responseTone: { type: DataTypes.STRING, allowNull: false, defaultValue: "professional" },
      responseLanguage: { type: DataTypes.STRING, allowNull: false, defaultValue: "English" },
      medicalDisclaimer: { type: DataTypes.TEXT, allowNull: true },
      isConfigured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      validationIssues: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_configurations`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id"] }],
    }
  );

  return ChatbotConfiguration;
};
