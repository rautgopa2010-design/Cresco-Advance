const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const ProductSubCategory = db.productSubCategory;
const ProductCategory = db.productCategory;
const ProductBrand = db.productBrand;

// Create Subcategories
exports.createProductSubCategories = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { productBrandId, productCategoryId, productCategoryName, productSubCategories, date } =
    req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductSubCategory.findOne({
      where: {
        productBrandId,
        productCategoryName,
        org_id,
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "Product Category already exist for this sub-category. Please edit instead."
      );
    }

    const subCategoryString = productSubCategories
      .map((s) => s.trim())
      .join(", ");

    const newEntry = await ProductSubCategory.create({
      productBrandId,
      productCategoryId,
      productCategoryName,
      productSubCategory: subCategoryString,
      date,
      org_id,
    });

    res.status(201).json(newEntry);
  } catch (err) {
    console.error("Create Sub-Categories Error:", err);
    return sendErrorResponse(
      res,
      500,
      "Failed to create product sub-categories"
    );
  }
};

// Fetch all Subcategories with Category info
exports.getAllSubCategories = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const result = await ProductSubCategory.findAll({
      where: { org_id },
      include: [{ model: ProductBrand }, { model: ProductCategory }],
      order: [["id", "ASC"]],
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Get Sub-Categories Error:", err);
    return sendErrorResponse(
      res,
      500,
      "Failed to fetch product sub-categories"
    );
  }
};

// Update Subcategories
exports.updateProductSubCategories = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const { productBrandId, productCategoryId, productCategoryName, productSubCategories, date } = req.body;
  const org_id = req.user.org_id;

  try {
    const existing = await ProductSubCategory.findOne({
      where: {
        productBrandId,
        productCategoryName,
        org_id,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "Product Category already exist for this sub-category. Please edit instead."
      );
    }

    const subCategoryString = productSubCategories
      .map((s) => s.trim())
      .join(", ");

    const [updated] = await ProductSubCategory.update(
      {
        productBrandId,
        productCategoryId,
        productCategoryName,
        productSubCategory: subCategoryString,
        date,
        org_id,
      },
      { where: { id, org_id } }
    );

    if (updated === 0) {
      return sendErrorResponse(res, 404, "Product Sub-Category not found");
    }

    res
      .status(200)
      .json({ message: "Product Sub-Category updated successfully" });
  } catch (err) {
    console.error("Update Sub-Categories Error:", err);
    return sendErrorResponse(res, 500, "Failed to update product sub-category");
  }
};

// Delete subcategory
exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await ProductSubCategory.destroy({
      where: { id, org_id },
    });

    if (deleted) {
      res
        .status(200)
        .json({ message: "Product Sub-Category Deleted successfully" });
    } else {
      return sendErrorResponse(res, 404, "Product Sub-Category not found");
    }
  } catch (err) {
    console.error("Delete Sub-Categories Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete product sub-category");
  }
};
