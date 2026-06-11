const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const OrderStatus = sequelize.define(
    "orderStatus",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}order_status`,
    }
  );

  return OrderStatus;
};
