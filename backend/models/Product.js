const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "product",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hsnCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productSubCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      productUnitName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}product`,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.productBrand, {
      foreignKey: { name: "productBrandId", allowNull: false },
      onDelete: "CASCADE",
    });

    Product.belongsTo(models.productCategory, {
      foreignKey: { name: "productCategoryId", allowNull: false },
      onDelete: "CASCADE",
    });

    Product.belongsTo(models.productSubCategory, {
      foreignKey: { name: "productSubCategoryId", allowNull: false },
      onDelete: "CASCADE",
    });

    Product.belongsTo(models.productUnit, {
      foreignKey: { name: "productUnitId", allowNull: true },
      onDelete: "CASCADE",
    });
  };

  return Product;
};
