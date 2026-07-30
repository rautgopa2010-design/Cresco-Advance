const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const LandingPageLead = sequelize.define(
    "landing_page_leads",
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
      companySlug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Converted"),
        defaultValue: "Pending",
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      SENDER_NAME: DataTypes.STRING,
      SENDER_COMPANY: { type: DataTypes.STRING, allowNull: true },
      SENDER_MOBILE: DataTypes.STRING,
      SENDER_PHONE: DataTypes.STRING,
      SENDER_EMAIL: DataTypes.STRING,
      SENDER_ADDRESS: DataTypes.STRING,
      LEAD_SOURCE: { type: DataTypes.STRING, allowNull: true },
      QUERY_MESSAGE: DataTypes.TEXT,
      landingPageName: { type: DataTypes.STRING, allowNull: true },
      templateKey: { type: DataTypes.STRING, allowNull: true },
      interestedProduct: { type: DataTypes.STRING, allowNull: true },
      utmSource: { type: DataTypes.STRING, allowNull: true },
      utmMedium: { type: DataTypes.STRING, allowNull: true },
      utmCampaign: { type: DataTypes.STRING, allowNull: true },
      utmTerm: { type: DataTypes.STRING, allowNull: true },
      utmContent: { type: DataTypes.STRING, allowNull: true },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
      userAgent: { type: DataTypes.TEXT, allowNull: true },
      enquiryId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: `${dbConfig.tablePrefix}landing_page_leads`,
    }
  );

  return LandingPageLead;
};
