const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerContact = sequelize.define(
    "customerContact",
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
      salutation: {
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customerContact`,
      timestamps: true,
    }
  );

  CustomerContact.associate = (models) => {
    CustomerContact.belongsTo(models.customer, {
      foreignKey: "customer_id",
      as: "customer",
    });
  };

  return CustomerContact;
};