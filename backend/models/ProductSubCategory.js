const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProductSubCategory = sequelize.define(
    "productSubCategory",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productSubCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}product_sub_category`,
    }
  );

  // Association: Many subcategories belong to one product category
  ProductSubCategory.associate = (models) => {
    ProductSubCategory.belongsTo(models.productBrand, {
      foreignKey: {
        name: "productBrandId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });

    ProductSubCategory.belongsTo(models.productCategory, {
      foreignKey: {
        name: "productCategoryId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
  };

  return ProductSubCategory;
};
