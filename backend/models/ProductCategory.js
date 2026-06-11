const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define(
    "productCategory",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}product_category`,
    }
  );
  // Association: Many categories belong to one product brand
  ProductCategory.associate = (models) => {
    ProductCategory.belongsTo(models.productBrand, {
      foreignKey: {
        name: "productBrandId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
  };

  return ProductCategory;
};
