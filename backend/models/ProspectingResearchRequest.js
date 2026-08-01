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
        type: DataTypes.ENUM(
          "draft",
          "cost_estimated",
          "awaiting_confirmation",
          "queued",
          "researching",
          "verification_pending",
          "ready_for_review",
          "partially_approved",
          "completed",
          "failed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      normalizedCriteria: { type: DataTypes.JSON, allowNull: true },
      orchestrationPlan: { type: DataTypes.JSON, allowNull: true },
      costEstimate: { type: DataTypes.JSON, allowNull: true },
      confirmedAt: { type: DataTypes.DATE, allowNull: true },
      confirmedBy: { type: DataTypes.INTEGER, allowNull: true },
      requestedResearchCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      verifiedProspectCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      providerCreditsUsed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      aiTokensUsed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      completedAt: { type: DataTypes.DATE, allowNull: true },
      failedReason: { type: DataTypes.TEXT, allowNull: true },
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
