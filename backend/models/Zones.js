const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Zones = sequelize.define(
    "zones",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      zones: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}zones`,
    }
  );

  Zones.associate = (models) => {
    Zones.belongsTo(models.country, {
      foreignKey: {
        name: "countryId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
  };

  return Zones;
};
