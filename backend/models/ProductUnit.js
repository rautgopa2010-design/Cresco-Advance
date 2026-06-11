const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProductUnit = sequelize.define(
    "productUnit",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productUnit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}product_unit`,
    }
  );

  return ProductUnit;
};
