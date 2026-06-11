
const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
    const PackageModules = sequelize.define('PackageModules', {
        org_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        module: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            onUpdate: DataTypes.NOW,
        },
    }, {
        tableName: `${dbConfig.tablePrefix}pkg_modules`,
        timestamps: true,
    });

    PackageModules.associate = (models) => {
        PackageModules.belongsTo(models.package, {
          foreignKey: "package_id",
          as: "package",
          constraints: false,
        });
      };      

    return PackageModules;
}