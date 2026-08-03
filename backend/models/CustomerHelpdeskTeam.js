const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskTeam = sequelize.define(
    "customerHelpdeskTeam",
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_teams`,
      timestamps: true,
      indexes: [{ fields: ["org_id", "isActive"] }],
    }
  );

  CustomerHelpdeskTeam.associate = (models) => {
    CustomerHelpdeskTeam.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
    CustomerHelpdeskTeam.hasMany(models.customerHelpdeskTeamMember, {
      foreignKey: "teamId",
      as: "members",
    });
  };

  return CustomerHelpdeskTeam;
};
