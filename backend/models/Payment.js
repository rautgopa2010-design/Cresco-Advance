
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('created', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'created',
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      onUpdate: DataTypes.NOW,
    },
  }, {
    tableName: 'cre_payments',
    timestamps: true,
  });

  return Payment;
}