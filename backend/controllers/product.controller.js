const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { sendImportSuccessEmail } = require("../utility/bulkImportEmail");
const Product = db.product;
const ProductSubCategory = db.productSubCategory;
const ProductCategory = db.productCategory;
const ProductBrand = db.productBrand;
const ProductUnit = db.productUnit;

// Create Product
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const {
    productBrandId,
    productCategoryId,
    productSubCategoryId,
    productUnitId,
    productUnitName,
    productCategoryName,
    productSubCategoryName,
    hsnCode,
    product,
    description,
    date,
    productPrice,
  } = req.body;

  const org_id = req.user.org_id;

  try {
    const existing = await Product.findOne({
      where: {
        org_id,
        productBrandId,
        productCategoryName,
        productSubCategoryName,
        product,
        is_deleted: false,
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "Product already exists for this Sub category. Please edit instead."
      );
    }

    const newProduct = await Product.create({
      org_id,
      productBrandId,
      productCategoryId,
      productSubCategoryId,
      productUnitId,
      productUnitName,
      productCategoryName,
      productSubCategoryName,
      hsnCode,
      product: product.trim(),
      description,
      date,
      productPrice: productPrice ?? 0.0,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Create Product Error:", err);
    return sendErrorResponse(res, 500, "Failed to create product");
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const result = await Product.findAll({
      where: { org_id, is_deleted: false },
      include: [
        { model: ProductBrand },
        { model: ProductCategory },
        { model: ProductSubCategory },
        { model: ProductUnit },
      ],
      order: [["id", "ASC"]],
    });

    const formatted = result.map((item) => ({
      ...item.toJSON(),
      items: item.product ? [item.product] : [],
      category: item.productCategory?.productCategory,
      subCategory: item.productSubCategoryName,
      productUnit: item.productUnitName,
      productPrice: item.productPrice,
      description: item.description
        ? item.description.replace(/<[^>]+>/g, "")
        : "",
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Get Product Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch products");
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const {
    productBrandId,
    productCategoryId,
    productSubCategoryId,
    productUnitId,
    productUnitName,
    productCategoryName,
    productSubCategoryName,
    hsnCode,
    product,
    description,
    date,
    productPrice,
  } = req.body;

  const org_id = req.user.org_id;

  try {
    const existing = await Product.findOne({
      where: {
        org_id,
        productBrandId,
        productCategoryName,
        productSubCategoryName,
        product,
        is_deleted: false,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return sendErrorResponse(
        res,
        400,
        "Product already exists for this Sub category. Please edit instead."
      );
    }

    const [updated] = await Product.update(
      {
        productBrandId,
        productCategoryId,
        productSubCategoryId,
        productUnitId,
        productUnitName,
        productCategoryName,
        productSubCategoryName,
        hsnCode,
        product: product.trim(),
        description,
        date,
        productPrice: productPrice ?? 0.0,
      },
      { where: { id, org_id, is_deleted: false } }
    );

    if (updated === 0) {
      return sendErrorResponse(res, 404, "Product not found");
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Update Product Error:", err);
    return sendErrorResponse(res, 500, "Failed to update product");
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const product = await Product.findOne({
      where: { id, org_id, is_deleted: false },
    });

    if (!product) {
      return sendErrorResponse(res, 404, "Product not found");
    }

    // Soft delete
    await product.update({ is_deleted: true });

    res
      .status(200)
      .json({ message: "Product deleted successfully (soft delete)" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete product");
  }
};

// Bulk Import Products
exports.importProducts = async (req, res) => {
  const { products } = req.body;
  const org_id = req.user.org_id;
  const { firstName, lastName } = req.user;

  if (!Array.isArray(products) || products.length === 0) {
    return sendErrorResponse(res, 400, "No product data provided");
  }

  const transaction = await db.sequelize.transaction();
  const errors = [];
  let imported = 0;

  // Get initiator name for email
  const initiatorName =
    [req.user.salutation, firstName, req.user.middleName, lastName]
      .filter(Boolean)
      .join(" ") || req.user.email;

  // Define date function outside the loop
  const getCurrentISTDateTime = () => {
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
    return formatted.replace(/\//g, "-").replace(",", "");
  };

  try {
    // Cache existing entities
    const brandMap = new Map(); // brandNorm -> id
    const unitMap = new Map(); // unitNorm -> id

    // New merged caches for category (per brand) and subcategory (per brand + single category)
    const catMap = new Map(); // brandId -> {id: number|null, catMap: Map<norm, original>}
    const subCatMap = new Map(); // `${brandId}_${catNorm}` -> {id: number|null, subMap: Map<norm, original>}

    // ── Load existing data ───────────────────────────────────────
    const [brands, categories, subCategories, units] = await Promise.all([
      ProductBrand.findAll({ where: { org_id }, transaction }),
      ProductCategory.findAll({ where: { org_id }, transaction }),
      ProductSubCategory.findAll({ where: { org_id }, transaction }),
      ProductUnit.findAll({ where: { org_id }, transaction }),
    ]);

    // Brands & Units (single value, exact match lower case)
    brands.forEach((b) =>
      brandMap.set(b.productBrand.trim().toLowerCase(), b.id)
    );
    units.forEach((u) => unitMap.set(u.productUnit.trim().toLowerCase(), u.id));

    // Categories – merge all into one row per brand (chosen as first encountered)
    categories.forEach((c) => {
      const brandId = c.productBrandId;
      let entry = catMap.get(brandId);
      if (!entry) {
        entry = { id: c.id, catMap: new Map() };
        catMap.set(brandId, entry);
      }
      if (c.productCategory) {
        c.productCategory.split(",").forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) {
            const norm = trimmed.toLowerCase();
            entry.catMap.set(norm, trimmed);
          }
        });
      }
    });

    // SubCategories – merge all into one row per (brand + single category name)
    subCategories.forEach((s) => {
      const catTrim = s.productCategoryName?.trim() || "";
      const catNorm = catTrim.toLowerCase();
      const key = `${s.productBrandId}_${catNorm}`;
      let entry = subCatMap.get(key);
      if (!entry) {
        entry = { id: s.id, subMap: new Map() };
        subCatMap.set(key, entry);
      }
      if (s.productSubCategory) {
        s.productSubCategory.split(",").forEach((part) => {
          const trimmed = part.trim();
          if (trimmed) {
            const norm = trimmed.toLowerCase();
            entry.subMap.set(norm, trimmed);
          }
        });
      }
    });

    // ── Process each row ─────────────────────────────────────────
    for (const [idx, row] of products.entries()) {
      const rowNum = idx + 2;
      const {
        brand,
        category,
        subCategory,
        unit,
        hsnCode,
        product,
        productPrice,
        description,
      } = row;

      if (
        !brand ||
        !category ||
        !subCategory ||
        !unit ||
        !hsnCode ||
        !product
      ) {
        errors.push(`Row ${rowNum}: Missing required field(s)`);
        continue;
      }

      const price = parseFloat(productPrice);
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Invalid product price (must be > 0)`);
        continue;
      }

      const brandNameNorm = brand.trim().toLowerCase();
      const catTrim = category.trim();
      const catNorm = catTrim.toLowerCase();
      const subCatTrim = subCategory.trim();
      const subCatNorm = subCatTrim.toLowerCase();
      const unitNameNorm = unit.trim().toLowerCase();

      // ── Brand ────────────────────────────────────────────────
      let brandId = brandMap.get(brandNameNorm);
      if (!brandId) {
        const newBrand = await ProductBrand.create(
          {
            org_id,
            productBrand: brand.trim(),
            date: getCurrentISTDateTime(),
          },
          { transaction }
        );
        brandId = newBrand.id;
        brandMap.set(brandNameNorm, brandId);
      }

      // ── Category (merged per brand) ──────────────────────────
      let catEntry = catMap.get(brandId);
      if (!catEntry) {
        catEntry = { id: null, catMap: new Map() };
        catMap.set(brandId, catEntry);
      }
      if (!catEntry.catMap.has(catNorm)) {
        catEntry.catMap.set(catNorm, catTrim);
      }

      // Build full category string
      let catParts = Array.from(catEntry.catMap.values());
      catParts.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      const fullCategoryName = catParts.join(", ");

      // Update or create category row
      let categoryId;
      if (catEntry.id) {
        await ProductCategory.update(
          { productCategory: fullCategoryName },
          { where: { id: catEntry.id }, transaction }
        );
        categoryId = catEntry.id;
      } else {
        const newCat = await ProductCategory.create(
          {
            org_id,
            productBrandId: brandId,
            productCategory: fullCategoryName,
            date: getCurrentISTDateTime(),
          },
          { transaction }
        );
        categoryId = newCat.id;
        catEntry.id = categoryId;
      }

      // ── SubCategory (merged per brand + single category) ─────
      const subKey = `${brandId}_${catNorm}`;
      let subEntry = subCatMap.get(subKey);
      if (!subEntry) {
        subEntry = { id: null, subMap: new Map() };
        subCatMap.set(subKey, subEntry);
      }
      if (!subEntry.subMap.has(subCatNorm)) {
        subEntry.subMap.set(subCatNorm, subCatTrim);
      }

      // Build full subcategory string
      let subParts = Array.from(subEntry.subMap.values());
      subParts.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      const fullSubCategoryName = subParts.join(", ");

      // Update or create subcategory row
      let subCategoryId;
      if (subEntry.id) {
        await ProductSubCategory.update(
          {
            productSubCategory: fullSubCategoryName,
            productCategoryName: catTrim,
          },
          { where: { id: subEntry.id }, transaction }
        );
        subCategoryId = subEntry.id;
      } else {
        const newSub = await ProductSubCategory.create(
          {
            org_id,
            productBrandId: brandId,
            productCategoryId: categoryId,
            productCategoryName: catTrim,
            productSubCategory: fullSubCategoryName,
            date: getCurrentISTDateTime(),
          },
          { transaction }
        );
        subCategoryId = newSub.id;
        subEntry.id = subCategoryId;
      }

      // ── Unit ─────────────────────────────────────────────────
      let unitId = unitMap.get(unitNameNorm);
      if (!unitId) {
        const newUnit = await ProductUnit.create(
          {
            org_id,
            productUnit: unit.trim(),
            date: getCurrentISTDateTime(),
          },
          { transaction }
        );
        unitId = newUnit.id;
        unitMap.set(unitNameNorm, unitId);
      }

      // ── Check if product already exists ──────────────────────
      const existing = await Product.findOne({
        where: {
          org_id,
          productBrandId: brandId,
          productCategoryName: catTrim,
          productSubCategoryName: subCatTrim,
          product: product.trim(),
          is_deleted: false,
        },
        transaction,
      });

      if (existing) {
        errors.push(
          `Row ${rowNum}: Product "${product}" already exists under this brand/category/sub-category`
        );
        continue;
      }

      // ── Create product ───────────────────────────────────────
      await Product.create(
        {
          org_id,
          productBrandId: brandId,
          productCategoryId: categoryId,
          productSubCategoryId: subCategoryId,
          productUnitId: unitId,
          productUnitName: unit.trim(),
          productCategoryName: catTrim,
          productSubCategoryName: subCatTrim,
          hsnCode: hsnCode.trim(),
          product: product.trim(),
          productPrice: price,
          description: description || null,
          date: getCurrentISTDateTime(),
        },
        { transaction }
      );
      imported++;
    }

    if (errors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Import failed – ${errors.length} error${
          errors.length === 1 ? "" : "s"
        }`,
        errors,
        imported: 0,
        total: products.length,
      });
    }

    await transaction.commit();

    // ── SEND EMAIL NOTIFICATION TO SUPER ADMIN ───────────────────────────────
    if (imported > 0) {
      // Non-blocking email send
      sendImportSuccessEmail(org_id, "products", imported, initiatorName).catch(
        (err) => {
          console.error("Failed to send import success email:", err);
        }
      );
    }

    res.status(200).json({
      success: true,
      imported,
      total: products.length,
      message: `Successfully imported ${imported} product${
        imported === 1 ? "" : "s"
      }`,
    });
  } catch (err) {
    // await transaction.rollback();
    // console.error("Product Bulk Import Error:", err);
    // return sendErrorResponse(res, 500, "Failed to import products");
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Product Bulk Import Error:", err);
    return sendErrorResponse(res, 500, "Failed to import products");
  }
};
