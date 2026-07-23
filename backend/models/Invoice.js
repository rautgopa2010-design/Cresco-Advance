const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "invoice",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoiceType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "final",
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: `${dbConfig.tablePrefix}orders`,
          key: "id",
        },
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
      termsAndConditions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      productInvoiceDetails: {
        type: DataTypes.JSON, // { intrastate: [...], interstate: [...] }
        allowNull: false,
      },
      finalAmt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}invoice`,
      timestamps: true,
    }
  );

  return Invoice;
};
