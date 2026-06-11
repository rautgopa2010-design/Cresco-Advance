const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Register = sequelize.define(
    "register",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      providerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false,
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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // 🔑 Subscription-related fields
      packageId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "cre_package", // actual table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      packageStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      packageExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
       pkgUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      paymentStatus: {
        type: DataTypes.ENUM("active", "expired", "pending_payment"),
        defaultValue: "pending_payment",
      },
      packageActivatedBy: {
        type: DataTypes.ENUM('self', 'provider'),
        allowNull: true,
        defaultValue: 'self',
      },
      paymentMethod: {
        type: DataTypes.ENUM('Online', 'Cash', 'Free'),
        allowNull: true,
        defaultValue: null,
      },
      // Store raw package details (snapshot at time of purchase)
      packageDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isFree: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reset_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      }, 
      reset_expiry_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },     
      accountActivity: {
        type: DataTypes.ENUM('Activate', 'Deactivate'),
        allowNull: false,
        defaultValue: 'Activate'
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}register`,
      timestamps: true,
    }
  );

  Register.associate = (models) => {
    Register.hasMany(models.users, {
      foreignKey: "org_id",
      as: "users",
    });

    // A Register belongs to one Package
    Register.belongsTo(models.package, {
      foreignKey: "packageId",
      as: "activePackage",
    });

    Register.belongsTo(models.register, {
      foreignKey: "providerId",
      as: "provider",
      constraints: false,
    });

    Register.hasMany(models.register, {
      foreignKey: "providerId",
      as: "clientOrgs",
      constraints: false,
    });
  };

  return Register;
};
