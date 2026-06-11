const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const OrderPaymentSchedule = sequelize.define(
    "orderPaymentSchedule",
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
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.STRING, // dd-mm-yyyy
        allowNull: false,
      },
      paymentPercent: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      dueAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      receivedAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}order_payment_schedules`,
      timestamps: true,
    }
  );

  return OrderPaymentSchedule;
};
