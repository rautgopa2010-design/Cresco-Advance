const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotEntitlement = sequelize.define(
    "chatbotEntitlement",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      providerOrgId: { type: DataTypes.INTEGER, allowNull: false },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      planId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      status: {
        type: DataTypes.ENUM("trial", "active", "expired", "suspended"),
        allowNull: false,
        defaultValue: "trial",
      },
      startsAt: { type: DataTypes.DATE, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: true },
      monthlyConversationLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      monthlyAiMessageLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      knowledgeSourceLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      documentStorageMbLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      domainLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      agentLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      humanHandoverEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      analyticsEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      extraConversationPacks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      extraAiMessagePacks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      supportedAiProviders: { type: DataTypes.JSON, allowNull: true },
      suspendedReason: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_entitlements`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id"] }],
    }
  );

  ChatbotEntitlement.associate = (models) => {
    ChatbotEntitlement.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
      constraints: false,
    });
    ChatbotEntitlement.belongsTo(models.chatbotPlan, {
      foreignKey: "planId",
      as: "plan",
      constraints: false,
    });
  };

  return ChatbotEntitlement;
};
