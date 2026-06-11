const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Industry = sequelize.define(
    "industry",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}industry`,
    }
  );

  return Industry;
};
