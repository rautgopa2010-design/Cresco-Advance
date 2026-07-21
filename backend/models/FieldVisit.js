const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const FieldVisit = sequelize.define(
    "fieldVisit",
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lead_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      visitFor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Customer",
      },
      clientName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactPerson: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
      },
      accuracy: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Checked In",
      },
      checkedInAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}field_visits`,
      timestamps: true,
    }
  );

  FieldVisit.associate = (models) => {
    FieldVisit.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    FieldVisit.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "createdBy",
    });

    FieldVisit.belongsTo(models.employee, {
      foreignKey: "employee_id",
      as: "employee",
      constraints: false,
    });

    FieldVisit.belongsTo(models.customer, {
      foreignKey: "customer_id",
      as: "customer",
      constraints: false,
    });

    FieldVisit.belongsTo(models.lead, {
      foreignKey: "lead_id",
      as: "lead",
      constraints: false,
    });
  };

  return FieldVisit;
};
