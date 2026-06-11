const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const CustomerCategory = db.customerCategory;

// Create a new customer category
exports.createCustomerCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { customerCategory, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await CustomerCategory.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("customerCategory")),
            db.Sequelize.fn("LOWER", customerCategory)
          ),
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "This customer category already exists for this organization."
      );
    }

    const result = await CustomerCategory.create({
      customerCategory,
      date,
      org_id,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Create Customer Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to create customer category");
  }
};

// Get all Customer Category
exports.getCustomerCategory = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const customerCategory = await CustomerCategory.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(customerCategory);
  } catch (error) {
    console.error("Get Customer Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch customer category");
  }
};

// Update a customer category
exports.updateCustomerCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { customerCategory, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await CustomerCategory.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("customerCategory")),
            db.Sequelize.fn("LOWER", customerCategory)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "This customer category already exists for this organization."
      );
    }

    const [updated] = await CustomerCategory.update(
      { customerCategory, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Customer Category not found");
    }
  } catch (error) {
    console.error("Update Customer Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to update customer category");
  }
};

// Delete a customer category
exports.deleteCustomerCategory = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await CustomerCategory.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Customer Category not found");
    }
  } catch (error) {
    console.error("Delete Customer Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete customer category");
  }
};
