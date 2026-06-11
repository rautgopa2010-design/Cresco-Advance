// const { validationResult } = require("express-validator");
// const db = require("../models");
// const { sendErrorResponse } = require("../utility/sendErrorResponse");

// const OrderStatus = db.orderStatus;

// // Create a new order status
// exports.createOrderStatus = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return sendErrorResponse(res, 400, errors.array()[0].msg);
//   }

//   const { orderStatus, date } = req.body;
//   const org_id = req.user.org_id;

//   try {
//     const existing = await OrderStatus.findOne({
//       where: {
//         org_id,
//         [db.Sequelize.Op.and]: [
//           db.Sequelize.where(
//             db.Sequelize.fn("LOWER", db.Sequelize.col("orderStatus")),
//             db.Sequelize.fn("LOWER", orderStatus)
//           ),
//         ],
//       },
//     });

//     if (existing) {
//       return sendErrorResponse(res, 400, "This order status already exists for this organization.");
//     }

//     const result = await OrderStatus.create({ orderStatus, date, org_id });
//     res.status(201).json(result);
//   } catch (error) {
//     console.error("Create Order Status Error:", error);
//     return sendErrorResponse(res, 500, "Failed to create order status");
//   }
// };

// // Get all order status
// exports.getOrderStatus = async (req, res) => {
//   const org_id = req.user.org_id;

//   try {
//     const orderStatuses = await OrderStatus.findAll({
//       where: { org_id },
//       order: [["id", "ASC"]],
//     });

//     res.status(200).json(orderStatuses);
//   } catch (error) {
//     console.error("Get Order Status Error:", error);
//     return sendErrorResponse(res, 500, "Failed to fetch order status");
//   }
// };

// // Update a order status
// exports.updateOrderStatus = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return sendErrorResponse(res, 400, errors.array()[0].msg);
//   }

//   const { id } = req.params;
//   const { orderStatus, date } = req.body;
//   const org_id = req.user.org_id;

//   try {
//     const existing = await OrderStatus.findOne({
//       where: {
//         org_id,
//         [db.Sequelize.Op.and]: [
//           db.Sequelize.where(
//             db.Sequelize.fn("LOWER", db.Sequelize.col("orderStatus")),
//             db.Sequelize.fn("LOWER", orderStatus)
//           ),
//           { id: { [db.Sequelize.Op.ne]: id } },
//         ],
//       },
//     });

//     if (existing) {
//       return sendErrorResponse(res, 400, "This order status already exists for this organization.");
//     }

//     const [updated] = await OrderStatus.update(
//       { orderStatus, date },
//       { where: { id, org_id } }
//     );

//     if (updated) {
//       res.status(200).json({ message: "Updated successfully" });
//     } else {
//       return sendErrorResponse(res, 404, "Order Status not found");
//     }
//   } catch (error) {
//     console.error("Update Order Status Error:", error);
//     return sendErrorResponse(res, 500, "Failed to update order status");
//   }
// };

// // Delete a order status
// exports.deleteOrderStatus = async (req, res) => {
//   const { id } = req.params;
//   const org_id = req.user.org_id;

//   try {
//     const deleted = await OrderStatus.destroy({
//       where: { id, org_id },
//     });

//     if (deleted) {
//       res.status(200).json({ message: "Deleted successfully" });
//     } else {
//       return sendErrorResponse(res, 404, "Order Status not found");
//     }
//   } catch (error) {
//     console.error("Delete Order Status Error:", error);
//     return sendErrorResponse(res, 500, "Failed to delete order status");
//   }
// };

const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const OrderStatus = db.orderStatus;

// Default statuses that should not be allowed to be created/updated by users
const DEFAULT_STATUSES = ["Pending", "Completed", "Canceled"];

// Helper function to check if status is a default status (case-insensitive)
const isDefaultStatus = (status) => {
  return DEFAULT_STATUSES.some(
    (defaultStatus) => defaultStatus.toLowerCase() === status.toLowerCase()
  );
};

// Create a new order status
exports.createOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { orderStatus, date } = req.body;
  const org_id = req.user.org_id;

  // Check if trying to add a default status
  if (isDefaultStatus(orderStatus)) {
    return sendErrorResponse(
      res,
      400,
      `This status "${orderStatus}" already exists by default.`
    );
  }

  try {
    const existing = await OrderStatus.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("orderStatus")),
            db.Sequelize.fn("LOWER", orderStatus)
          ),
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "This order status already exists for this organization."
      );
    }

    const result = await OrderStatus.create({ orderStatus, date, org_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Order Status Error:", error);
    return sendErrorResponse(res, 500, "Failed to create order status");
  }
};

// Get all order status
exports.getOrderStatus = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const orderStatuses = await OrderStatus.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(orderStatuses);
  } catch (error) {
    console.error("Get Order Status Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch order status");
  }
};

// Update a order status
exports.updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { orderStatus, date } = req.body;
  const org_id = req.user.org_id;

  // Check if trying to update to a default status
  if (isDefaultStatus(orderStatus)) {
    return sendErrorResponse(
      res,
      400,
      `This status "${orderStatus}" already exists by default.`
    );
  }

  try {
    const existing = await OrderStatus.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("orderStatus")),
            db.Sequelize.fn("LOWER", orderStatus)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "This order status already exists for this organization."
      );
    }

    const [updated] = await OrderStatus.update(
      { orderStatus, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Order Status not found");
    }
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return sendErrorResponse(res, 500, "Failed to update order status");
  }
};

// Delete a order status
exports.deleteOrderStatus = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await OrderStatus.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Order Status not found");
    }
  } catch (error) {
    console.error("Delete Order Status Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete order status");
  }
};
