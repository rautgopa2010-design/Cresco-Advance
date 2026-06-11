const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerCategory = sequelize.define(
    "customerCategory",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customerCategory`,
    }
  );

  return CustomerCategory;
};
