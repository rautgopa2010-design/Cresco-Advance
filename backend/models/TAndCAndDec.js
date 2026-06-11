const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const TAndCAndDec = sequelize.define(
    "t_and_c_and_dec",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('quotation_description', 'quotation_terms', 'invoice_terms'),
        allowNull: false,
        comment: 'Type of content: quotation_description, quotation_terms, invoice_terms'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}t_and_c_and_dec`,
      timestamps: true,
    }
  );

  return TAndCAndDec;
};