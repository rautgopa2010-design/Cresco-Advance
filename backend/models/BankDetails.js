const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const BankDetails = sequelize.define(
    "bank_details",
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
      bankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      branchName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cifNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ifsc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      micr: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerPan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}bank_details`,
      timestamps: true,
    }
  );

  BankDetails.associate = (models) => {
    BankDetails.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
  };

  return BankDetails;
};