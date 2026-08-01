const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotPlan = sequelize.define(
    "chatbotPlan",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      providerOrgId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      monthlyConversationLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      monthlyAiMessageLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      knowledgeSourceLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      documentStorageMbLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      domainLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      agentLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      humanHandoverEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      analyticsEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      trialDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      overageRules: { type: DataTypes.JSON, allowNull: true },
      supportedAiProviders: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_plans`,
      timestamps: true,
    }
  );

  ChatbotPlan.associate = (models) => {
    ChatbotPlan.belongsTo(models.register, {
      foreignKey: "providerOrgId",
      as: "providerOrganization",
      constraints: false,
    });
    ChatbotPlan.hasMany(models.chatbotEntitlement, {
      foreignKey: "planId",
      as: "entitlements",
    });
  };

  return ChatbotPlan;
};
