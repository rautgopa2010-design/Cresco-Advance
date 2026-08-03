const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerPortalInvitation = sequelize.define(
    "customerPortalInvitation",
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
      portalUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "expired", "revoked"),
        allowNull: false,
        defaultValue: "pending",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_portal_invitations`,
      timestamps: true,
      indexes: [
        {
          fields: ["org_id", "email"],
        },
      ],
    }
  );

  CustomerPortalInvitation.associate = (models) => {
    CustomerPortalInvitation.belongsTo(models.customerPortalUser, {
      foreignKey: "portalUserId",
      as: "portalUser",
    });
    CustomerPortalInvitation.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });
  };

  return CustomerPortalInvitation;
};
