const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const ProductUnit = db.productUnit;

// Create a new product unit
exports.createProductUnit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { productUnit, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductUnit.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("productUnit")),
            db.Sequelize.fn("LOWER", productUnit)
          ),
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This product unit already exists for this organization.");
    }

    const result = await ProductUnit.create({
      productUnit,
      date,
      org_id,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create Product Unit Error:", error);
    return sendErrorResponse(res, 500, "Failed to create product unit");
  }
};

// Get all product categories
exports.getProductUnits = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const productCategories = await ProductUnit.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(productCategories);
  } catch (error) {
    console.error("Get Product Categories Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch product categories");
  }
};

// Update a product unit
exports.updateProductUnit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { productUnit, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductUnit.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("productUnit")),
            db.Sequelize.fn("LOWER", productUnit)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This product unit already exists for this organization.");
    }

    const [updated] = await ProductUnit.update(
      { productUnit, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Product Unit not found");
    }
  } catch (error) {
    console.error("Update Product Unit Error:", error);
    return sendErrorResponse(res, 500, "Failed to update product unit");
  }
};

// Delete a product unit
exports.deleteProductUnit = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await ProductUnit.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Product Unit not found");
    }
  } catch (error) {
    console.error("Delete Product Unit Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete product unit");
  }
};
