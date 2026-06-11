const dbConfig = require("../../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const LeadProduct = sequelize.define(
    "leadProduct",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productBrand: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productSubCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hsnCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}lead_product`,
      timestamps: false,
    }
  );

  LeadProduct.associate = (models) => {
    LeadProduct.belongsTo(models.lead, {
      foreignKey: "lead_id",
      as: "lead",
    });
  };

  return LeadProduct;
};
