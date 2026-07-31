const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingEvidence = sequelize.define(
    "prospectingEvidence",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      prospectId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      evidenceType: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.TEXT, allowNull: true },
      confidence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_evidence`,
      timestamps: true,
    }
  );

  return ProspectingEvidence;
};
