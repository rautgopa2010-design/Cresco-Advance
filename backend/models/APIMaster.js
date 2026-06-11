const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const APIMaster = sequelize.define(
    "api_master",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      api_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      api_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },      
      api_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}api_master`,
    }
  );

  return APIMaster;
};
