const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Modules = sequelize.define(
    "modules",
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
      module_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: `${dbConfig.tablePrefix}modules`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["org_id", "module_name"],
        },
      ],
    }
  );

  Modules.associate = (models) => {
    Modules.hasMany(models.permissions, {
      foreignKey: "module_id",
      as: "permissions",
    });
  };

  return Modules;
};
