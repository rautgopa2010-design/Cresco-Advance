const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingResearchRequest = sequelize.define(
    "prospectingResearchRequest",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      criteria: { type: DataTypes.JSON, allowNull: true },
      providers: { type: DataTypes.JSON, allowNull: true },
      status: {
        type: DataTypes.ENUM("draft", "queued", "completed", "failed", "cancelled"),
        allowNull: false,
        defaultValue: "completed",
      },
      requestedResearchCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      verifiedProspectCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      providerCreditsUsed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      aiTokensUsed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      completedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_research_requests`,
      timestamps: true,
    }
  );

  ProspectingResearchRequest.associate = (models) => {
    ProspectingResearchRequest.hasMany(models.prospectingProspect, {
      foreignKey: "requestId",
      as: "prospects",
    });
  };

  return ProspectingResearchRequest;
};
