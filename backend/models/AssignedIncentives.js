const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const AssignedIncentives = sequelize.define(
    "assigned_incentives",
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
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      selectedProductName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      formula_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      partition_formula_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },      
      date: {
        type: DataTypes.STRING, // store dd-mm-yyyy (frontend is sending this format)
        allowNull: false,
      },
      month: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      targeted_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      eligible_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}assigned_incentives`,
      timestamps: true,
    }
  );

  AssignedIncentives.associate = (models) => {
    AssignedIncentives.belongsTo(models.companySetup, {
      foreignKey: "org_id",
      targetKey: "org_id",
      as: "companySetup",
    });

    AssignedIncentives.belongsTo(models.incentiveFormulaMaster, {
      foreignKey: "formula_id",
      as: "formula",
    });

    AssignedIncentives.belongsTo(models.incentiveFormulaMaster, {
      foreignKey: "partition_formula_id",
      as: "partitionFormula",
    });    

    AssignedIncentives.belongsTo(models.employee, {
      foreignKey: "employee_id",
      as: "employee",
    });

    AssignedIncentives.belongsTo(models.product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return AssignedIncentives;
};
