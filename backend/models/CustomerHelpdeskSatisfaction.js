const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskSatisfaction = sequelize.define(
    "customerHelpdeskSatisfaction",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      ticketId: { type: DataTypes.INTEGER, allowNull: false },
      portalUserId: { type: DataTypes.INTEGER, allowNull: false },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      comment: { type: DataTypes.TEXT, allowNull: true },
      submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_satisfaction`,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["org_id", "ticketId", "portalUserId"] },
        { fields: ["org_id", "rating"] },
      ],
    }
  );

  CustomerHelpdeskSatisfaction.associate = (models) => {
    CustomerHelpdeskSatisfaction.belongsTo(models.customerHelpdeskTicket, {
      foreignKey: "ticketId",
      as: "ticket",
    });
    CustomerHelpdeskSatisfaction.belongsTo(models.customerPortalUser, {
      foreignKey: "portalUserId",
      as: "portalUser",
      constraints: false,
    });
  };

  return CustomerHelpdeskSatisfaction;
};
