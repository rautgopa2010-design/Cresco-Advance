const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define(
    "roles",
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
      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by_role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      parent_role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      inherit_permissions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      tableName: `${dbConfig.tablePrefix}roles`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['org_id', 'role_name'],
        },
      ],
    }
  );

  Roles.associate = (models) => {
    Roles.hasMany(models.users, {
      foreignKey: "role_id",
      as: "users",
    });
  
    Roles.hasMany(models.rolePermissions, {
      foreignKey: "role_id",
      as: "rolePermissionList",
    });
  
    Roles.belongsToMany(models.permissions, {
      through: models.rolePermissions,
      foreignKey: "role_id",
      otherKey: "permission_id",
      as: "permissions",
    });
  
    Roles.belongsTo(models.roles, {
      foreignKey: "parent_role_id",
      as: "parentRole",
    });
  };
  

  return Roles;
};
