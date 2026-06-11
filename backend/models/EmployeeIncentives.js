const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const EmployeeIncentives = sequelize.define(
    "employee_incentives",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      assigned_incentive_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      achieved_sales: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      display_rate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      calculated_incentive: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("pending", "partially-paid", "paid"),
        defaultValue: "pending",
      },
      paid_amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}employee_incentives`,
      timestamps: true,
    }
  );

  EmployeeIncentives.associate = (models) => {
    EmployeeIncentives.belongsTo(models.assignedIncentives, {
      foreignKey: "assigned_incentive_id",
      as: "assignedIncentive",
    });
    EmployeeIncentives.belongsTo(models.employee, {
      foreignKey: "employee_id",
      as: "employee",
    });
  };

  return EmployeeIncentives;
};
