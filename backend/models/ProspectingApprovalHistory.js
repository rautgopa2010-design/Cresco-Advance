const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingApprovalHistory = sequelize.define(
    "prospectingApprovalHistory",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      prospectId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rejectionReason: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_approval_history`,
      timestamps: true,
    }
  );

  return ProspectingApprovalHistory;
};
