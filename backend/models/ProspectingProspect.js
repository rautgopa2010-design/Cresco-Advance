const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const ProspectingProspect = sequelize.define(
    "prospectingProspect",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      requestId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      companyName: { type: DataTypes.STRING, allowNull: false },
      contactName: { type: DataTypes.STRING, allowNull: true },
      designation: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      mobile: { type: DataTypes.STRING, allowNull: true },
      website: { type: DataTypes.STRING, allowNull: true },
      industry: { type: DataTypes.STRING, allowNull: true },
      sourceProvider: { type: DataTypes.STRING, allowNull: false, defaultValue: "phase2-test-provider" },
      status: {
        type: DataTypes.ENUM("new", "review", "approved", "rejected", "enquiry_created"),
        allowNull: false,
        defaultValue: "review",
      },
      verificationStatus: {
        type: DataTypes.ENUM(
          "Verified",
          "Partially Verified",
          "Unverified",
          "Duplicate",
          "Existing Customer",
          "Insufficient Evidence",
          "Disqualified",
          "verified",
          "unverified",
          "failed"
        ),
        allowNull: false,
        defaultValue: "Unverified",
      },
      classification: {
        type: DataTypes.ENUM("Confirmed Enquiry", "High-Intent Prospect", "Potential Prospect", "Unqualified Record"),
        allowNull: false,
        defaultValue: "Potential Prospect",
      },
      priority: {
        type: DataTypes.ENUM("Hot", "Warm", "Cold"),
        allowNull: false,
        defaultValue: "Warm",
      },
      score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      prospectFitScore: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      intentScore: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      dataQualityScore: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      scoreBreakdown: { type: DataTypes.JSON, allowNull: true },
      verificationSummary: { type: DataTypes.JSON, allowNull: true },
      duplicateSummary: { type: DataTypes.JSON, allowNull: true },
      crmRecommendation: {
        type: DataTypes.ENUM("CRM", "HRMS", "Both"),
        allowNull: false,
        defaultValue: "CRM",
      },
      suggestedNextAction: { type: DataTypes.TEXT, allowNull: true },
      evidenceSummary: { type: DataTypes.TEXT, allowNull: true },
      enquiryId: { type: DataTypes.INTEGER, allowNull: true },
      createdBy: { type: DataTypes.INTEGER, allowNull: false },
      approvedBy: { type: DataTypes.INTEGER, allowNull: true },
      approvedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}prospecting_prospects`,
      timestamps: true,
    }
  );

  ProspectingProspect.associate = (models) => {
    ProspectingProspect.belongsTo(models.prospectingResearchRequest, {
      foreignKey: "requestId",
      as: "request",
      constraints: false,
    });
    ProspectingProspect.belongsTo(models.customer, {
      foreignKey: "enquiryId",
      as: "createdEnquiry",
      constraints: false,
    });
  };

  return ProspectingProspect;
};
