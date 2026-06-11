const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const LeadStage = sequelize.define(
    "leadStage",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      leadStage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}lead_stage`,
    }
  );

  return LeadStage;
};
