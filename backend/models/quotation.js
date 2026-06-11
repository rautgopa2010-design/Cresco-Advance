const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Quotation = sequelize.define(
    "quotation",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      quotationNo: {
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
      assignedTo: {
        type: DataTypes.JSON, // array of employee IDs
        allowNull: false,
      },
      assignedRoleIds: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gstinNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerPerson: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.STRING, // "dd-mm-yyyy" as you store it
        allowNull: false,
      },
      billingAddress: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      shippingAddress: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      termsAndConditions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      productQuotationDetails: {
        type: DataTypes.JSON, // { intrastate: [...], interstate: [...] }
        allowNull: false,
      },
      finalAmt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}quotations`,
      timestamps: true,
    }
  );

  return Quotation;
};
