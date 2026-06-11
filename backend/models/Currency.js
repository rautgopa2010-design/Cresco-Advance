const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define(
    "currency",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currencyCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}currency`,
    }
  );

  // Association
  Currency.associate = (models) => {
    Currency.belongsTo(models.country, {
      foreignKey: {
        name: "countryId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
  };

  return Currency;
};
