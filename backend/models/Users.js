const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "users",
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
      providerId: { type: DataTypes.INTEGER, allowNull: true },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_expiry_token: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}users`,
      timestamps: true,
    }
  );

  Users.associate = (models) => {
    Users.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    Users.belongsTo(models.roles, {
      foreignKey: {
        name: "role_id",
        allowNull: false,
      },
      targetKey: "id",
      as: "role",
      constraints: false,
    });

    Users.belongsTo(models.roles, {
      foreignKey: {
        name: "org_id",
        allowNull: false,
      },
      targetKey: "org_id",
      constraints: false,
    });

    Users.hasOne(models.employee, {
      foreignKey: "user_id",
      as: "employeeProfile",
    });

    Users.belongsTo(models.register, {
      foreignKey: "providerId",
      as: "provider",
      constraints: false,
    });
  };

  return Users;
};
