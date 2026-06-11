const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const ProductBrand = db.productBrand;

// Create a new product brand
exports.createProductBrand = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { productBrand, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductBrand.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("productBrand")),
            db.Sequelize.fn("LOWER", productBrand)
          ),
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This product brand already exists for this organization.");
    }

    const result = await ProductBrand.create({
      productBrand,
      date,
      org_id,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create Product Brand Error:", error);
    return sendErrorResponse(res, 500, "Failed to create product brand");
  }
};

// Get all product categories
exports.getProductBrands = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const productCategories = await ProductBrand.findAll({
      where: { org_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json(productCategories);
  } catch (error) {
    console.error("Get Product Categories Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch product categories");
  }
};

// Update a product brand
exports.updateProductBrand = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { productBrand, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductBrand.findOne({
      where: {
        org_id,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("productBrand")),
            db.Sequelize.fn("LOWER", productBrand)
          ),
          { id: { [db.Sequelize.Op.ne]: id } },
        ],
      },
    });

    if (existing) {
      return sendErrorResponse(res, 400, "This product brand already exists for this organization.");
    }

    const [updated] = await ProductBrand.update(
      { productBrand, date },
      { where: { id, org_id } }
    );

    if (updated) {
      res.status(200).json({ message: "Updated successfully" });
    } else {
      return sendErrorResponse(res, 404, "Product Brand not found");
    }
  } catch (error) {
    console.error("Update Product Brand Error:", error);
    return sendErrorResponse(res, 500, "Failed to update product brand");
  }
};

// Delete a product brand
exports.deleteProductBrand = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await ProductBrand.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Product Brand not found");
    }
  } catch (error) {
    console.error("Delete Product Brand Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete product brand");
  }
};
