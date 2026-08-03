const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerPortalUser = sequelize.define(
    "customerPortalUser",
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
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contact_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      portalStatus: {
        type: DataTypes.ENUM("invited", "active", "disabled", "pending_approval"),
        allowNull: false,
        defaultValue: "invited",
      },
      activationStatus: {
        type: DataTypes.ENUM("pending", "activated", "revoked"),
        allowNull: false,
        defaultValue: "pending",
      },
      invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isCustomerAccountAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_portal_users`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["org_id", "email"],
        },
        {
          fields: ["org_id", "customer_id"],
        },
      ],
    }
  );

  CustomerPortalUser.associate = (models) => {
    CustomerPortalUser.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
    CustomerPortalUser.belongsTo(models.customer, {
      foreignKey: "customer_id",
      as: "customer",
      constraints: false,
    });
    CustomerPortalUser.belongsTo(models.customerContact, {
      foreignKey: "contact_id",
      as: "contact",
      constraints: false,
    });
    CustomerPortalUser.belongsTo(models.users, {
      foreignKey: "invitedBy",
      as: "invitedByUser",
      constraints: false,
    });
  };

  return CustomerPortalUser;
};
