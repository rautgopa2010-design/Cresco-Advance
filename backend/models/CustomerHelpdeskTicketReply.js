const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskTicketReply = sequelize.define(
    "customerHelpdeskTicketReply",
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
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      authorType: {
        type: DataTypes.ENUM("customer_portal", "employee"),
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM("public", "internal"),
        allowNull: false,
        defaultValue: "public",
      },
      portalUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_ticket_replies`,
      timestamps: true,
      indexes: [
        {
          fields: ["org_id", "ticketId"],
        },
      ],
    }
  );

  CustomerHelpdeskTicketReply.associate = (models) => {
    CustomerHelpdeskTicketReply.belongsTo(models.customerHelpdeskTicket, {
      foreignKey: "ticketId",
      as: "ticket",
    });
    CustomerHelpdeskTicketReply.belongsTo(models.customerPortalUser, {
      foreignKey: "portalUserId",
      as: "portalUser",
      constraints: false,
    });
    CustomerHelpdeskTicketReply.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "employeeUser",
      constraints: false,
    });
    CustomerHelpdeskTicketReply.hasMany(models.customerHelpdeskTicketAttachment, {
      foreignKey: "replyId",
      as: "attachments",
    });
  };

  return CustomerHelpdeskTicketReply;
};
