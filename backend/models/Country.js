const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    "country",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}country`,
    }
  );

  return Country;
};
