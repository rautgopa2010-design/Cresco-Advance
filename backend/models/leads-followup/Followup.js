// const dbConfig = require("../../config/db.config");

// module.exports = (sequelize, DataTypes) => {
//   const Followup = sequelize.define(
//     "followup",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       lead_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       leadStage: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       leadStatus: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       followup_date: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       nextFollowUpDate: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       followup_desc: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       assignedTo: { type: DataTypes.JSON, allowNull: true },
//       communicatedWith: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         defaultValue: null,
//       },
//       additionalProducts: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//         defaultValue: null,
//       },
//     },
//     {
//       tableName: `${dbConfig.tablePrefix}followup`,
//       timestamps: true,
//     }
//   );

//   Followup.associate = (models) => {
//     Followup.belongsTo(models.lead, {
//       foreignKey: "lead_id",
//       as: "lead",
//     });
//   };

//   return Followup;
// };

// models/followup.model.js
const dbConfig = require("../../config/db.config");

module.exports = (sequelize, DataTypes) => {
  const Followup = sequelize.define(
    "followup",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      leadStage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      leadStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      followup_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nextFollowUpDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      followup_desc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      assignedTo: { type: DataTypes.JSON, allowNull: true },
      communicatedWith: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      additionalProducts: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      missedReminderSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      missedReminderSentForDate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: `${dbConfig.tablePrefix}followup`,
      timestamps: true,
    }
  );

  Followup.associate = (models) => {
    Followup.belongsTo(models.lead, {
      foreignKey: "lead_id",
      as: "lead",
    });

    Followup.belongsTo(models.employee, {
      foreignKey: "completedBy",
      as: "completer",
    });
  };

  return Followup;
};
