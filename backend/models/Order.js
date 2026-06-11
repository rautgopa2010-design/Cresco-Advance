const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assignedRoleIds: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      selectedCompany: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerPerson: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.STRING, // "dd-mm-yyyy"
        allowNull: false,
      },
      billingAddress: {
        type: DataTypes.JSON, // { street, city, state, pincode, country, zone }
        allowNull: true,
      },
      shippingAddress: {
        type: DataTypes.JSON, // { street, city, state, pincode, country, zone }
        allowNull: true,
      },
      productOrderDetails: {
        type: DataTypes.JSON, // { intrastate: [...], interstate: [...] }
        allowNull: false,
      },
      orderPaymentDetails: {
        type: DataTypes.STRING, // e.g., "1,2,3"
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },
      finalAmt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}orders`,
      timestamps: true,
    }
  );

  return Order;
};
