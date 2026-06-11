const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const LeadStatus = sequelize.define(
    "leadStatus",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      leadStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}lead_status`,
    }
  );

  return LeadStatus;
};
