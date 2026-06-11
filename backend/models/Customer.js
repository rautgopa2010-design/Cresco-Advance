const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "customer",
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      salutation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      middleName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerCategory: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      leadSource: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gstinNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingPincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingPincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      assignedTo: {
        type: DataTypes.JSON,
        allowNull: false
      },
      assignedRoleIds: {
        type: DataTypes.JSON,
        allowNull: true,
      }
    },
    {
      tableName: `${dbConfig.tablePrefix}customer`,
      timestamps: true,
    }
  );

  Customer.associate = (models) => {
    Customer.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    Customer.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "createdBy",
    });
  };

  return Customer;
};
