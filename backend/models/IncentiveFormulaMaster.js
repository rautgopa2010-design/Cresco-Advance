const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const IncentiveFormulaMaster = sequelize.define(
    "incentive_formula_master",
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
      formula_type: {
        type: DataTypes.ENUM("fixed", "slab", "bonus", "partition"),
        allowNull: false,
      },
      formula_config: {
        type: DataTypes.JSON, // store JSON like {rate:0.05}, {slabs:[]}, {bonus}
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}incentive_formula_master`,
      timestamps: true,
    }
  );

  IncentiveFormulaMaster.associate = (models) => {
    IncentiveFormulaMaster.belongsTo(models.companySetup, {
      foreignKey: "org_id",
      targetKey: "org_id",
      as: "companySetup",
    });
  };

  return IncentiveFormulaMaster;
};
