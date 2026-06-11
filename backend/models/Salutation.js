const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Salutation = sequelize.define(
    "salutation",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      salutation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}salutation`,
    }
  );

  return Salutation;
};
