const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const OrderPayment = sequelize.define(
    "order_payment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
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
      paymentId: { type: DataTypes.INTEGER, allowNull: false },
      payMode: {
        type: DataTypes.STRING, // "Cash" | "Online" | "Cheque"
        allowNull: false,
      },
      payDate: {
        type: DataTypes.STRING, // "dd-mm-yyyy"
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      transactionRef: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      chequeNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      chequeDate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}order_payment`,
      timestamps: true,
    }
  );

  return OrderPayment;
};
