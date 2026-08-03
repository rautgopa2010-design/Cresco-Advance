const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const CustomerHelpdeskKnowledgeArticle = sequelize.define(
    "customerHelpdeskKnowledgeArticle",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      org_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: true },
      keywords: { type: DataTypes.JSON, allowNull: true },
      isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      deflectionCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: `${dbConfig.tablePrefix}customer_helpdesk_knowledge_articles`,
      timestamps: true,
      indexes: [{ fields: ["org_id", "isPublished"] }],
    }
  );

  return CustomerHelpdeskKnowledgeArticle;
};
