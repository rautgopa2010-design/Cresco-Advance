const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const APILead = sequelize.define(
    "api_leads",
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
      api_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Converted"),
        defaultValue: "Pending",
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      UNIQUE_QUERY_ID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      QUERY_TYPE: DataTypes.STRING,
      QUERY_TIME: DataTypes.STRING,
      LEAD_SOURCE: DataTypes.STRING,
      SENDER_NAME: DataTypes.STRING,
      SENDER_COMPANY: DataTypes.STRING,
      SENDER_MOBILE: DataTypes.STRING,
      SENDER_PHONE: DataTypes.STRING,
      SENDER_EMAIL: DataTypes.STRING,
      SENDER_ADDRESS: DataTypes.STRING,
      SENDER_CITY: DataTypes.STRING,
      SENDER_STATE: DataTypes.STRING,
      SENDER_PINCODE: DataTypes.STRING,
      SENDER_COUNTRY: DataTypes.STRING,
      QUERY_PRODUCT_NAME: DataTypes.STRING,
      QUERY_MCAT_NAME: DataTypes.STRING,
      QUERY_MESSAGE: DataTypes.TEXT,
    },
    {
      tableName: `${dbConfig.tablePrefix}api_leads`,
    }
  );

  return APILead;
};
