const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
    const LeadSource = sequelize.define(
      "leadSource",
      {
        org_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        leadSource: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        date: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: `${dbConfig.tablePrefix}lead_source`,
      }
    );
  
    return LeadSource;
  };
  