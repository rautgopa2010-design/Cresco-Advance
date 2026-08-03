const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskCategory = sequelize.define(
    "customerHelpdeskCategory",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_categories`,
      timestamps: true,
      indexes: [{ fields: ["org_id", "isActive"] }],
    }
  );

  return CustomerHelpdeskCategory;
};
