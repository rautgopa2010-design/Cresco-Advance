const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Referral = sequelize.define(
    "referral",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      referrerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      referrerPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      referrerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refereeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refereePhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refereeEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refereeCompany: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "refer-and-earn",
      },
      status: {
        type: DataTypes.ENUM("New", "Contacted", "Qualified", "Converted", "Rejected", "Paid"),
        allowNull: false,
        defaultValue: "New",
      },
      rewardStatus: {
        type: DataTypes.ENUM("Not Eligible", "Eligible", "Processing", "Paid"),
        allowNull: false,
        defaultValue: "Not Eligible",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}referrals`,
      timestamps: true,
    }
  );

  return Referral;
};
