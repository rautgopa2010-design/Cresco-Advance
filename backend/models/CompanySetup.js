const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CompanySetup = sequelize.define(
    "company_setup",
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
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gstinNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      salutation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      middleName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supportedMobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supportedEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanantStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanantCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanantState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanantPincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permanantCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alternateStreet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alternateCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alternateState: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alternatePincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alternateCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyLogo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companySlug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}company_setup`,
      timestamps: true,
    }
  );

  CompanySetup.associate = (models) => {
    CompanySetup.belongsTo(models.register, {
      foreignKey: "org_id",
      as: "organization",
    });

    CompanySetup.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });

    CompanySetup.hasMany(models.incentiveFormulaMaster, {
      foreignKey: "org_id",
      sourceKey: "org_id",
      as: "formulas",
    });
  };

  return CompanySetup;
};
