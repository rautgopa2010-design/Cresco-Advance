const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const RolePermissions = sequelize.define(
    "rolePermissions",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}role_permissions`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["role_id", "org_id", "permission_id"],
        },
      ],
    }
  );

  RolePermissions.associate = (models) => {
    RolePermissions.belongsTo(models.permissions, {
      foreignKey: "permission_id",
      as: "permission",
    });

    RolePermissions.belongsTo(models.roles, {
      foreignKey: "role_id",
      as: "role",
    });
  };

  return RolePermissions;
};
