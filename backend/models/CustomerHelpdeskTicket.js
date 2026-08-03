const dbConfig = require("../config/db.config");
const { TICKET_SCOPES } = require("../utility/customerHelpdeskFoundation");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskTicket = sequelize.define(
    "customerHelpdeskTicket",
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
      ticketScope: {
        type: DataTypes.ENUM(TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT),
        allowNull: false,
        defaultValue: TICKET_SCOPES.ORGANIZATION_CUSTOMER_SUPPORT,
      },
      publicReference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      contact_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      requesterPortalUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "customer_portal",
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "New",
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      assignedTo: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      supportTeamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      slaPolicyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      firstResponseDueAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      firstResponseAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resolutionDueAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalationLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      crescoSupportTicketId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      escalatedToCrescoAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deflectedByArticleIds: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      slaDeadlineAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_tickets`,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["org_id", "publicReference"],
        },
        {
          fields: ["org_id", "ticketScope"],
        },
      ],
    }
  );

  CustomerHelpdeskTicket.associate = (models) => {
    CustomerHelpdeskTicket.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
    CustomerHelpdeskTicket.belongsTo(models.customer, {
      foreignKey: "customer_id",
      as: "customer",
      constraints: false,
    });
    CustomerHelpdeskTicket.belongsTo(models.customerContact, {
      foreignKey: "contact_id",
      as: "contact",
      constraints: false,
    });
    CustomerHelpdeskTicket.belongsTo(models.customerPortalUser, {
      foreignKey: "requesterPortalUserId",
      as: "requester",
      constraints: false,
    });
    CustomerHelpdeskTicket.belongsTo(models.customerHelpdeskTeam, {
      foreignKey: "supportTeamId",
      as: "supportTeam",
      constraints: false,
    });
    CustomerHelpdeskTicket.belongsTo(models.customerHelpdeskSlaPolicy, {
      foreignKey: "slaPolicyId",
      as: "slaPolicy",
      constraints: false,
    });
    CustomerHelpdeskTicket.hasMany(models.customerHelpdeskTicketReply, {
      foreignKey: "ticketId",
      as: "replies",
    });
    CustomerHelpdeskTicket.hasMany(models.customerHelpdeskTicketAttachment, {
      foreignKey: "ticketId",
      as: "attachments",
    });
  };

  return CustomerHelpdeskTicket;
};
