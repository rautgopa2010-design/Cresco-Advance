const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerPortal = sequelize.define(
    "customerPortal",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      publicKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      portalSlug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      selfRegistrationEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approvalMode: {
        type: DataTypes.ENUM("manual", "auto_verified_match"),
        allowNull: false,
        defaultValue: "manual",
      },
      branding: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_portals`,
      timestamps: true,
    }
  );

  CustomerPortal.associate = (models) => {
    CustomerPortal.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
  };

  return CustomerPortal;
};
