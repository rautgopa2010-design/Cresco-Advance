const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define(
    "employee",
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      salutation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      middleName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
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
      street: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altPincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reportTo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },      
    },
    {
      tableName: `${dbConfig.tablePrefix}employee`,
      timestamps: true,
    }
  );

  Employee.associate = (models) => {
    Employee.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    Employee.belongsTo(models.roles, {
      foreignKey: "role_id",
      as: "role",
    });

    Employee.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "userAccount",
    });

    Employee.belongsTo(models.register, {
      foreignKey: "providerId",
      as: "provider",
      constraints: false,
    });
  };

  return Employee;
};