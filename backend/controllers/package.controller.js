const { validationResult } = require("express-validator");
const db = require("../models");
const Package = db.package;
const PackageModules = db.packageModules;
const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { Op } = require("sequelize");

// ✅ Create Package
exports.createPackage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const user_id = req.user.id;

  const {
    packageName,
    maxUsers,
    durationType,
    durationValue,
    price,
    totalPackageAmount: total_package_amount,
    currency,
    symbol,
    description,
    isActive,
    modules = [] // Default to empty array if not provided
  } = req.body;

  // Early validation for modules array
  if (!Array.isArray(modules)) {
    return sendErrorResponse(res, 400, "Modules must be an array.");
  }

  try {
    // Use transaction for atomicity
    const result = await db.sequelize.transaction(async (transaction) => {
      // Check for existing package
      const existingPackage = await Package.findOne({
        where: { org_id, packageName },
        transaction
      });
      if (existingPackage) {
        throw new Error("Package name already exists.");
      }

      // Create the main package
      const newPackage = await Package.create(
        {
          org_id,
          user_id,
          packageName,
          maxUsers,
          durationType,
          durationValue,
          price,
          total_package_amount,
          currency,
          symbol,
          description,
          isActive,
        },
        { transaction }
      );

      // Bulk create modules for efficiency (single query)
      if (modules.length > 0) {
        await PackageModules.bulkCreate(
          modules.map((element) => ({
            org_id,
            package_id: newPackage.id,
            module: element,
          })),
          { transaction }
        );
      }

      return newPackage;
    });

    res.status(201).json({
      message: "Package created successfully.",
      packageId: result.id,
    });
  } catch (error) {
    console.error("Create Package Error:", error);
    // Handle known errors specifically
    if (error.message === "Package name already exists.") {
      return sendErrorResponse(res, 400, error.message);
    }
    return sendErrorResponse(res, 500, "Error creating package.");
  }
};

// ✅ Get All Packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll({
      include: [
        {
          model: PackageModules,
          as: "modules",
          attributes: ["id", "module"],  // optional
        },
      ],
    });

    res.status(200).json(packages);
  } catch (err) {
    console.error("Get Packages Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch packages");
  }
};

// ✅ Update Package (Now supports updating modules)
exports.updatePackage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const org_id = req.user.org_id;
  const user_id = req.user.id; // optional, if you track updater

  const {
    packageName,
    maxUsers,
    durationType,
    durationValue,
    price,
    totalPackageAmount: total_package_amount,
    currency,
    symbol,
    description,
    isActive,
    modules = [], // Expecting array of module names (strings)
  } = req.body;

  // Validate modules is an array
  if (!Array.isArray(modules)) {
    return sendErrorResponse(res, 400, "Modules must be an array.");
  }

  try {
    const result = await db.sequelize.transaction(async (transaction) => {
      // Find the package
      const pkg = await Package.findOne({
        where: { id, org_id },
        transaction,
      });

      if (!pkg) {
        throw new Error("Package not found.");
      }

      // Check for duplicate package name (excluding current package)
      const existingPackage = await Package.findOne({
        where: {
          org_id,
          packageName,
          id: { [Op.ne]: id },
        },
        transaction,
      });

      if (existingPackage) {
        throw new Error("Package name already exists.");
      }

      // Update main package fields
      await pkg.update(
        {
          packageName,
          maxUsers,
          durationType,
          durationValue,
          price,
          total_package_amount,
          currency,
          symbol,
          description,
          isActive,
          // user_id, // optional: update updater if needed
        },
        { transaction }
      );

      // === Handle Modules: Delete old + Insert new ===
      // Step 1: Delete all existing modules for this package
      await PackageModules.destroy({
        where: { package_id: id },
        transaction,
      });

      // Step 2: Insert new modules (if any)
      if (modules.length > 0) {
        const moduleRecords = modules.map((moduleName) => ({
          org_id,
          package_id: id,
          module: moduleName,
        }));

        await PackageModules.bulkCreate(moduleRecords, { transaction });
      }

      return pkg;
    });

    res.status(200).json({
      message: "Package updated successfully.",
      packageId: result.id,
    });
  } catch (error) {
    console.error("Update Package Error:", error);

    if (error.message === "Package not found.") {
      return sendErrorResponse(res, 404, error.message);
    }
    if (error.message === "Package name already exists.") {
      return sendErrorResponse(res, 400, error.message);
    }

    return sendErrorResponse(res, 500, "Failed to update package.");
  }
};

// ✅ Delete Package
exports.deletePackage = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const pkg = await Package.findOne({ where: { id, org_id } });
    if (!pkg) return sendErrorResponse(res, 404, "Package not found.");

    await Package.destroy({ where: { id } });

    res.status(200).json({ message: "Package deleted successfully." });
  } catch (err) {
    console.error("Delete Package Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete package");
  }
};

// ✅ Get Public Active Packages (No auth required - for marketing website)
exports.getPublicPackages = async (req, res) => {
  try {
    const packages = await Package.findAll({
      where: { isActive: true },
      attributes: [
        'packageName',
        'maxUsers',
        'durationType',
        'durationValue',
        'price',
        'total_package_amount',
        'currency',
        'symbol',
        'description',
      ],
      include: [
        {
          model: PackageModules,
          as: 'modules',
          attributes: ['module'],
        },
      ],
      order: [['price', 'ASC']], // Cheapest first
    });

    // Transform data to match your PricingCard component expectations
    const transformed = packages.map(pkg => {
      const isFree = pkg.price === 0;
      return {
        name: pkg.packageName,
        price: `${pkg.symbol}${pkg.price}`,
        period: `${pkg.durationType.toLowerCase()}`,
        customPeriod: `${pkg.durationValue}`,
        description: pkg.description
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .trim() || 'Ideal plan for your business needs',
        features: pkg.modules.map(m => m.module),
        highlighted: pkg.packageName.toLowerCase().includes('growth') || 
                     pkg.packageName.toLowerCase().includes('enterprise'),
        user: `${pkg.maxUsers}`, 
      };
    });

    res.status(200).json(transformed);
  } catch (err) {
    console.error("Get Public Packages Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch public packages");
  }
};

// ✅ Get Single Package by ID (for editing)
exports.getPackageById = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const pkg = await Package.findOne({
      where: { id, org_id },
      include: [
        {
          model: PackageModules,
          as: "modules",
          attributes: ["id", "module"],
        },
      ],
    });

    if (!pkg) {
      return sendErrorResponse(res, 404, "Package not found.");
    }

    res.status(200).json(pkg);
  } catch (err) {
    console.error("Get Package By ID Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch package");
  }
};