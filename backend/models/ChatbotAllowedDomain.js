const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotAllowedDomain = sequelize.define(
    "chatbotAllowedDomain",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      domain: { type: DataTypes.STRING, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      verifiedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_allowed_domains`,
      timestamps: true,
      indexes: [{ unique: true, fields: ["org_id", "domain"] }],
    }
  );

  return ChatbotAllowedDomain;
};
