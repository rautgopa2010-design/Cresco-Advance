const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    "package",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      packageName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      maxUsers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      durationType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      durationValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      total_package_amount: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}package`,
      timestamps: true,
    }
  );

  Package.associate = (models) => {
    Package.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "createdBy",
      constraints: false,
    });
    Package.hasMany(models.packageModules, {
      foreignKey: "package_id",
      as: "modules",
      constraints: false,
    });
  };

  return Package;
};
