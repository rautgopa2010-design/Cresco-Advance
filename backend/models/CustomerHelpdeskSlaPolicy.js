const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskSlaPolicy = sequelize.define(
    "customerHelpdeskSlaPolicy",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      priority: { type: DataTypes.STRING, allowNull: true },
      category: { type: DataTypes.STRING, allowNull: true },
      firstResponseMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 240 },
      resolutionMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1440 },
      escalationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 720 },
      escalationTeamId: { type: DataTypes.INTEGER, allowNull: true },
      isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_sla_policies`,
      timestamps: true,
      indexes: [{ fields: ["org_id", "isActive"] }],
    }
  );

  return CustomerHelpdeskSlaPolicy;
};
