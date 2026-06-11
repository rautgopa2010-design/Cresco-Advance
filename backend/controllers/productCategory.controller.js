const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const ProductBrand = db.productBrand;
const ProductCategory = db.productCategory;

// Create a new product category
exports.createProductCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { productBrandId, productCategory, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductCategory.findOne({
      where: {
        productBrandId,
        org_id,
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "Product Category already added for this brand in this organization, please edit istead."
      );
    }

    const categoryString = productCategory.map((c) => c.trim()).join(", ");

    const newEntry = await ProductCategory.create({
      productBrandId,
      productCategory: categoryString,
      date,
      org_id,
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Create Product Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to create product category");
  }
};

// Get all product categories
exports.getProductCategories = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const result = await ProductCategory.findAll({
      where: { org_id },
      include: [{ model: ProductBrand }],
      order: [["id", "ASC"]],
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Get Product Categories Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch product categories");
  }
};

// Update a product category
exports.updateProductCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { productBrandId, productCategory, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductCategory.findOne({
      where: {
        productBrandId,
        org_id,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "Product Category already added for this brand in this organization, please edit istead."
      );
    }

    const categoryString = productCategory.map((s) => s.trim()).join(", ");

    const [updated] = await ProductCategory.update(
      {
        productBrandId,
        productCategory: categoryString,
        date,
        org_id,
      },
      { where: { id, org_id } }
    );

    if (updated === 0) {
      return sendErrorResponse(res, 404, "Product Category not found");
    }

    res.status(200).json({ message: "Product Category updated successfully" });
  } catch (error) {
    console.error("Update Product Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to update product category");
  }
};

// Delete a product category
exports.deleteProductCategory = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await ProductCategory.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Product Category not found");
    }
  } catch (error) {
    console.error("Delete Product Category Error:", error);
    return sendErrorResponse(res, 500, "Failed to delete product category");
  }
};
