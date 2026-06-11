const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CountryCode = sequelize.define(
    "countryCode",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}country_code`,
    }
  );

  // Association: many country codes belong to one country
  CountryCode.associate = (models) => {
    CountryCode.belongsTo(models.country, {
      foreignKey: {
        name: "countryId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
  };

  return CountryCode;
};
