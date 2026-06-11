const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProductBrand = sequelize.define(
    "productBrand",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productBrand: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}product_brand`,
    }
  );

  return ProductBrand;
};
