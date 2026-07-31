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
        type: DataTypes.ENUM("reviewed", "approved", "rejected", "created_enquiry"),
        allowNull: false,
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_approval_history`,
      timestamps: true,
    }
  );

  return ProspectingApprovalHistory;
};
