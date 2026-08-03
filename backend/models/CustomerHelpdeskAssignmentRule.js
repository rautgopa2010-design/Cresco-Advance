const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskAssignmentRule = sequelize.define(
    "customerHelpdeskAssignmentRule",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      conditions: { type: DataTypes.JSON, allowNull: true },
      supportTeamId: { type: DataTypes.INTEGER, allowNull: true },
      assignEmployeeIds: { type: DataTypes.JSON, allowNull: true },
      priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_assignment_rules`,
      timestamps: true,
      indexes: [{ fields: ["org_id", "isActive"] }],
    }
  );

  return CustomerHelpdeskAssignmentRule;
};
