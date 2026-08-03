const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskTeamMember = sequelize.define(
    "customerHelpdeskTeamMember",
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
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isLead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_team_members`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["org_id", "teamId", "employeeId"],
        },
      ],
    }
  );

  CustomerHelpdeskTeamMember.associate = (models) => {
    CustomerHelpdeskTeamMember.belongsTo(models.customerHelpdeskTeam, {
      foreignKey: "teamId",
      as: "team",
    });
    CustomerHelpdeskTeamMember.belongsTo(models.employee, {
      foreignKey: "employeeId",
      as: "employee",
      constraints: false,
    });
    CustomerHelpdeskTeamMember.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
      constraints: false,
    });
  };

  return CustomerHelpdeskTeamMember;
};
