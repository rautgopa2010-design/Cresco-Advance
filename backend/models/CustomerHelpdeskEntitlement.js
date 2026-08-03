const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskEntitlement = sequelize.define(
    "customerHelpdeskEntitlement",
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
      status: {
        type: DataTypes.ENUM("trial", "active", "suspended", "expired"),
        allowNull: false,
        defaultValue: "trial",
      },
      limits: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      startsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      configuredBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_entitlements`,
      timestamps: true,
    }
  );

  CustomerHelpdeskEntitlement.associate = (models) => {
    CustomerHelpdeskEntitlement.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
    CustomerHelpdeskEntitlement.belongsTo(models.users, {
      foreignKey: "configuredBy",
      as: "configuredByUser",
      constraints: false,
    });
  };

  return CustomerHelpdeskEntitlement;
};
