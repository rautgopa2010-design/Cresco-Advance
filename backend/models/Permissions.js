const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define(
    "permissions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      permission_type: {
        type: DataTypes.ENUM("view", "create", "edit", "delete", "print"),
        allowNull: false,
      },
      permission_code: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}permissions`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['org_id', 'module_id', 'permission_type'],
        },
      ],
    }
  );

  Permissions.associate = (models) => {
    Permissions.belongsTo(models.modules, {
      foreignKey: "module_id",
      as: "module",
    });
    Permissions.belongsToMany(models.roles, {
      through: models.rolePermissions,
      foreignKey: "permission_id",
      otherKey: "role_id",
      as: "roles",
    });
  };

  return Permissions;
};
