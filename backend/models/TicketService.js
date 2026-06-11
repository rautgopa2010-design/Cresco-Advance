const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const TicketService = sequelize.define(
    "ticketService",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ticketService: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}ticket_service`,
    }
  );

  return TicketService;
};
