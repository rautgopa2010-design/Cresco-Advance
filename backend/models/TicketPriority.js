const dbConfig = require("../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const TicketPriority = sequelize.define(
    "ticketPriority",
    {
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ticketPriority: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}ticket_priority`,
    }
  );

  return TicketPriority;
};
