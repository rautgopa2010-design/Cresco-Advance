const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "profile",
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
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },      
    },
    {
      tableName: `${dbConfig.tablePrefix}profile`,
      timestamps: true,
    }
  );

  Profile.associate = (models) => {
    Profile.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Profile;
};
