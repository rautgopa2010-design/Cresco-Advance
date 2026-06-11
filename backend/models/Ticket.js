const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define(
    "ticket",
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
      createdDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      delay: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      assignedTo: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      assignedRoleIds: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      assignedToBeforeEscalation: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      assignedRoleIdsBeforeEscalation: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      service: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Pending",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isEscalated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      escalatedToProvider: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      escalatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,        
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}tickets`,
      timestamps: true,
    }
  );

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    Ticket.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "createdBy",
    });
  };

  return Ticket;
};
