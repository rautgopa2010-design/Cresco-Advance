const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskPriority = sequelize.define(
    "customerHelpdeskPriority",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#64748b",
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_priorities`,
      timestamps: true,
      indexes: [{ fields: ["org_id", "isActive"] }],
    }
  );

  return CustomerHelpdeskPriority;
};
