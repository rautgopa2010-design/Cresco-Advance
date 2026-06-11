const dbConfig = require("../../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define(
    "lead",
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
      date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      assignedTo: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      assignedRoleIds: {
        type: DataTypes.JSON,
        allowNull: true,
      },      
      companyName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gstinNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerPerson: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      leadSource: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      leadStage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      leadStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expectedAmount: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expectedClosingDate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingPincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billingZone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingPincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingZone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uploadedFiles: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}lead`,
      timestamps: true,
    }
  );

  Lead.associate = (models) => {
    Lead.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    Lead.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "createdBy",
    });

    Lead.hasMany(models.leadProduct, {
      foreignKey: "lead_id",
      as: "products",
    });

    Lead.hasMany(models.followup, {
      foreignKey: "lead_id",
      as: "followups",
    });
  };

  return Lead;
};
