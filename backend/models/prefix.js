const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Prefix = sequelize.define(
    "prefix",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderPrefix: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quotationPrefix: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoicePrefix: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}prefix`,
    }
  );
  return Prefix;
};
