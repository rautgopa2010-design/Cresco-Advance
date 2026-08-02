const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ChatbotWidget = sequelize.define(
    "chatbotWidget",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      widgetIdentifier: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("active", "disabled", "revoked"),
        allowNull: false,
        defaultValue: "active",
      },
      lastUsedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}chatbot_widgets`,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["widgetIdentifier"] },
        { unique: true, fields: ["org_id"] },
      ],
    }
  );

  return ChatbotWidget;
};
