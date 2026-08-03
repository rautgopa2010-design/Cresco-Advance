const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskTicketAttachment = sequelize.define(
    "customerHelpdeskTicketAttachment",
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
      replyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      uploadedByType: {
        type: DataTypes.ENUM("customer_portal", "employee"),
        allowNull: false,
      },
      uploadedByPortalUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      uploadedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_ticket_attachments`,
      timestamps: true,
      indexes: [
        {
          fields: ["org_id", "ticketId"],
        },
        {
          fields: ["replyId"],
        },
      ],
    }
  );

  CustomerHelpdeskTicketAttachment.associate = (models) => {
    CustomerHelpdeskTicketAttachment.belongsTo(models.customerHelpdeskTicket, {
      foreignKey: "ticketId",
      as: "ticket",
    });
    CustomerHelpdeskTicketAttachment.belongsTo(models.customerHelpdeskTicketReply, {
      foreignKey: "replyId",
      as: "reply",
      constraints: false,
    });
  };

  return CustomerHelpdeskTicketAttachment;
};
