// const { validationResult } = require("express-validator");
// const db = require("../models");
// const { sendErrorResponse } = require("../utility/sendErrorResponse");

// const AssignedIncentives = db.assignedIncentives;
// const IncentiveFormulaMaster = db.incentiveFormulaMaster;
// const Employee = db.employee;
// const Product = db.product;

// // Safe JSON parser
// const parseJSON = (value, fallback) => {
//   try {
//     if (!value) return fallback;
//     if (typeof value === "string") return JSON.parse(value);
//     if (typeof value === "object") return value;
//     return fallback;
//   } catch (err) {
//     return fallback;
//   }
// };

// // ✅ Create Assigned Incentive
// exports.createAssignedIncentive = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return sendErrorResponse(res, 400, errors.array()[0].msg);
//   }

//   const org_id = req.user.org_id;
//   const {
//     employeeId,
//     product,
//     month,
//     targetedAmount,
//     elligibleAmount,
//     formulaId,
//     date,
//   } = req.body;

//   try {
//     // 🔥 CHECK FOR DUPLICATE: Same employee + product + month
//     const existingAssignment = await AssignedIncentives.findOne({
//       where: {
//         org_id,
//         employee_id: employeeId,
//         product_id: product.id,
//         month,
//       },
//     });

//     if (existingAssignment) {
//       return sendErrorResponse(
//         res,
//         400,
//         "This employee is already assigned this product for the selected month."
//       );
//     }

//     // 1️⃣ Fetch selected formula
//     const selectedFormula = await IncentiveFormulaMaster.findOne({
//       where: { id: formulaId, org_id },
//     });

//     if (!selectedFormula) {
//       return sendErrorResponse(res, 404, "Selected formula not found");
//     }

//     // 2️⃣ If formula is fixed/slab → find partition formula
//     let partitionFormula = null;
//     if (["fixed", "slab"].includes(selectedFormula.formula_type)) {
//       partitionFormula = await IncentiveFormulaMaster.findOne({
//         where: { org_id, formula_type: "partition" },
//       });
//     }

//     // 3️⃣ Create assigned incentive
//     const assigned = await AssignedIncentives.create({
//       org_id,
//       employee_id: employeeId,
//       product_id: product.id,
//       selectedProductName: product.name,
//       formula_id: formulaId,
//       partition_formula_id: partitionFormula ? partitionFormula.id : null,
//       month,
//       targeted_amount: targetedAmount,
//       eligible_amount: elligibleAmount,
//       date,
//     });

//     // 4️⃣ Fetch full assigned incentive with relations
//     const fullAssigned = await AssignedIncentives.findOne({
//       where: { id: assigned.id, org_id },
//       include: [
//         { model: IncentiveFormulaMaster, as: "formula" },
//         { model: IncentiveFormulaMaster, as: "partitionFormula" },
//         { model: Employee, as: "employee" },
//         { model: Product, as: "product" },
//       ],
//     });

//     res.status(201).json({
//       message: "Incentive assigned successfully",
//       assigned: fullAssigned,
//     });
//   } catch (err) {
//     console.error("Create Assigned Incentive Error:", err);
//     return sendErrorResponse(res, 500, "Failed to assign incentive");
//   }
// };

// // ✅ Get all assigned incentives
// exports.getAssignedIncentives = async (req, res) => {
//   const org_id = req.user.org_id;
//   try {
//     const list = await AssignedIncentives.findAll({
//       where: { org_id },
//       include: [
//         { model: IncentiveFormulaMaster, as: "formula" },
//         { model: IncentiveFormulaMaster, as: "partitionFormula" },
//         { model: Employee, as: "employee" },
//         { model: Product, as: "product" },
//       ],
//     });

//     // transform formula_config
//     const transformed = list.map((item) => ({
//       ...item.toJSON(),
//       formula: {
//         ...item.formula?.toJSON(),
//         formula_config: parseJSON(item.formula?.formula_config, {}),
//       },
//       partitionFormula: item.partitionFormula
//         ? {
//             ...item.partitionFormula.toJSON(),
//             formula_config: parseJSON(item.partitionFormula.formula_config, {}),
//           }
//         : null,
//     }));

//     res.status(200).json(transformed);
//   } catch (err) {
//     console.error("Get Assigned Incentives Error:", err);
//     return sendErrorResponse(res, 500, "Failed to fetch assigned incentives");
//   }
// };

// // ✅ Update Assigned Incentive
// exports.updateAssignedIncentive = async (req, res) => {
//   const { id } = req.params;
//   const org_id = req.user.org_id;
//   const {
//     employeeId,
//     product,
//     month,
//     targeted_amount,
//     eligible_amount,
//     formulaId,
//     date,
//   } = req.body;

//   try {
//     // Check if trying to update to a combination that already exists (excluding current record)
//     const existingAssignment = await AssignedIncentives.findOne({
//       where: {
//         org_id,
//         employee_id: employeeId,
//         product_id: product.id,
//         month,
//         id: { [db.Sequelize.Op.ne]: id }, // Exclude current record
//       },
//     });

//     if (existingAssignment) {
//       return sendErrorResponse(
//         res,
//         400,
//         "This employee is already assigned this product for the selected month."
//       );
//     }

//     const selectedFormula = await IncentiveFormulaMaster.findOne({
//       where: { id: formulaId, org_id },
//     });

//     if (!selectedFormula) {
//       return sendErrorResponse(res, 404, "Selected formula not found");
//     }

//     let partitionFormula = null;
//     if (["fixed", "slab"].includes(selectedFormula.formula_type)) {
//       partitionFormula = await IncentiveFormulaMaster.findOne({
//         where: { org_id, formula_type: "partition" },
//       });
//     }

//     const updated = await AssignedIncentives.update(
//       {
//         employee_id: employeeId,
//         product_id: product.id,
//         selectedProductName: product.name,
//         formula_id: formulaId,
//         partition_formula_id: partitionFormula ? partitionFormula.id : null,
//         month,
//         targeted_amount,
//         eligible_amount,
//         date,
//       },
//       { where: { id, org_id } }
//     );

//     if (!updated[0]) {
//       return sendErrorResponse(res, 404, "Assigned incentive not found");
//     }

//     const fullUpdated = await AssignedIncentives.findOne({
//       where: { id, org_id },
//       include: [
//         { model: IncentiveFormulaMaster, as: "formula" },
//         { model: IncentiveFormulaMaster, as: "partitionFormula" },
//         { model: Employee, as: "employee" },
//         { model: Product, as: "product" },
//       ],
//     });

//     res.status(200).json({
//       message: "Assigned incentive updated successfully",
//       updated: fullUpdated,
//     });
//   } catch (err) {
//     console.error("Update Assigned Incentive Error:", err);
//     return sendErrorResponse(res, 500, "Failed to update assigned incentive");
//   }
// };

// // ✅ Delete Assigned Incentive
// exports.deleteAssignedIncentive = async (req, res) => {
//   const { id } = req.params;
//   const org_id = req.user.org_id;

//   try {
//     const deleted = await AssignedIncentives.destroy({ where: { id, org_id } });
//     if (!deleted) {
//       return sendErrorResponse(res, 404, "Assigned incentive not found");
//     }
//     res
//       .status(200)
//       .json({ message: "Assigned incentive deleted successfully" });
//   } catch (err) {
//     console.error("Delete Assigned Incentive Error:", err);
//     return sendErrorResponse(res, 500, "Failed to delete assigned incentive");
//   }
// };

const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const AssignedIncentives = db.assignedIncentives;
const IncentiveFormulaMaster = db.incentiveFormulaMaster;
const Employee = db.employee;
const Product = db.product;

// Safe JSON parser
const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    if (typeof value === "object") return value;
    return fallback;
  } catch (err) {
    return fallback;
  }
};

// Helper to check duplicate assignment with "All Months" logic
const checkDuplicateAssignment = async (
  org_id,
  employeeId,
  productId,
  month,
  excludeId = null
) => {
  const whereClause = {
    org_id,
    employee_id: employeeId,
    product_id: productId,
  };

  if (excludeId) {
    whereClause.id = { [db.Sequelize.Op.ne]: excludeId };
  }

  const existing = await AssignedIncentives.findAll({ where: whereClause });

  // If new month is "All Months" → block if any assignment exists
  if (month === "All Months") {
    return existing.length > 0;
  }

  // If assigning specific month → block if there's an "All Months" assignment
  const hasAllMonths = existing.some((item) => item.month === "All Months");
  if (hasAllMonths) {
    return true;
  }

  // Otherwise, check for exact month match
  return existing.some((item) => item.month === month);
};

// ✅ Create Assigned Incentive
exports.createAssignedIncentive = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const org_id = req.user.org_id;
  const {
    employeeId,
    product,
    month,
    targetedAmount,
    elligibleAmount,
    formulaId,
    date,
  } = req.body;

  try {
    // Check for duplicate with "All Months" logic
    const isDuplicate = await checkDuplicateAssignment(
      org_id,
      employeeId,
      product.id,
      month
    );
    if (isDuplicate) {
      return sendErrorResponse(
        res,
        400,
        "This employee is already assigned this product for the selected month or for all months."
      );
    }

    // Fetch selected formula
    const selectedFormula = await IncentiveFormulaMaster.findOne({
      where: { id: formulaId, org_id },
    });

    if (!selectedFormula) {
      return sendErrorResponse(res, 404, "Selected formula not found");
    }

    // If formula is fixed/slab → find partition formula
    let partitionFormula = null;
    if (
      ["fixed", "slab"].includes(selectedFormula.formula_type.toLowerCase())
    ) {
      partitionFormula = await IncentiveFormulaMaster.findOne({
        where: { org_id, formula_type: "partition" },
      });
    }

    // Create assigned incentive
    const assigned = await AssignedIncentives.create({
      org_id,
      employee_id: employeeId,
      product_id: product.id,
      selectedProductName: product.name,
      formula_id: formulaId,
      partition_formula_id: partitionFormula ? partitionFormula.id : null,
      month,
      targeted_amount: targetedAmount,
      eligible_amount: elligibleAmount,
      date,
    });

    // Fetch full assigned incentive with relations
    const fullAssigned = await AssignedIncentives.findOne({
      where: { id: assigned.id, org_id },
      include: [
        { model: IncentiveFormulaMaster, as: "formula" },
        { model: IncentiveFormulaMaster, as: "partitionFormula" },
        { model: Employee, as: "employee" },
        { model: Product, as: "product" },
      ],
    });

    res.status(201).json({
      message: "Incentive assigned successfully",
      assigned: fullAssigned,
    });
  } catch (err) {
    console.error("Create Assigned Incentive Error:", err);
    return sendErrorResponse(res, 500, "Failed to assign incentive");
  }
};

// ✅ Get all assigned incentives
exports.getAssignedIncentives = async (req, res) => {
  const org_id = req.user.org_id;
  try {
    const list = await AssignedIncentives.findAll({
      where: { org_id },
      include: [
        { model: IncentiveFormulaMaster, as: "formula" },
        { model: IncentiveFormulaMaster, as: "partitionFormula" },
        { model: Employee, as: "employee" },
        { model: Product, as: "product" },
      ],
    });

    // transform formula_config
    const transformed = list.map((item) => ({
      ...item.toJSON(),
      formula: {
        ...item.formula?.toJSON(),
        formula_config: parseJSON(item.formula?.formula_config, {}),
      },
      partitionFormula: item.partitionFormula
        ? {
            ...item.partitionFormula.toJSON(),
            formula_config: parseJSON(item.partitionFormula.formula_config, {}),
          }
        : null,
    }));

    res.status(200).json(transformed);
  } catch (err) {
    console.error("Get Assigned Incentives Error:", err);
    return sendErrorResponse(res, 500, "Failed to fetch assigned incentives");
  }
};

// ✅ Update Assigned Incentive
exports.updateAssignedIncentive = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;
  const {
    employeeId,
    product,
    month,
    targeted_amount,
    eligible_amount,
    formulaId,
    date,
  } = req.body;

  try {
    // Check duplicate with "All Months" logic (excluding current record)
    const isDuplicate = await checkDuplicateAssignment(
      org_id,
      employeeId,
      product.id,
      month,
      id
    );
    if (isDuplicate) {
      return sendErrorResponse(
        res,
        400,
        "This employee is already assigned this product for the selected month or for all months."
      );
    }

    const selectedFormula = await IncentiveFormulaMaster.findOne({
      where: { id: formulaId, org_id },
    });

    if (!selectedFormula) {
      return sendErrorResponse(res, 404, "Selected formula not found");
    }

    let partitionFormula = null;
    if (
      ["fixed", "slab"].includes(selectedFormula.formula_type.toLowerCase())
    ) {
      partitionFormula = await IncentiveFormulaMaster.findOne({
        where: { org_id, formula_type: "partition" },
      });
    }

    const updated = await AssignedIncentives.update(
      {
        employee_id: employeeId,
        product_id: product.id,
        selectedProductName: product.name,
        formula_id: formulaId,
        partition_formula_id: partitionFormula ? partitionFormula.id : null,
        month,
        targeted_amount,
        eligible_amount,
        date,
      },
      { where: { id, org_id } }
    );

    if (!updated[0]) {
      return sendErrorResponse(res, 404, "Assigned incentive not found");
    }

    const fullUpdated = await AssignedIncentives.findOne({
      where: { id, org_id },
      include: [
        { model: IncentiveFormulaMaster, as: "formula" },
        { model: IncentiveFormulaMaster, as: "partitionFormula" },
        { model: Employee, as: "employee" },
        { model: Product, as: "product" },
      ],
    });

    res.status(200).json({
      message: "Assigned incentive updated successfully",
      updated: fullUpdated,
    });
  } catch (err) {
    console.error("Update Assigned Incentive Error:", err);
    return sendErrorResponse(res, 500, "Failed to update assigned incentive");
  }
};

// ✅ Delete Assigned Incentive
exports.deleteAssignedIncentive = async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const deleted = await AssignedIncentives.destroy({ where: { id, org_id } });
    if (!deleted) {
      return sendErrorResponse(res, 404, "Assigned incentive not found");
    }
    res
      .status(200)
      .json({ message: "Assigned incentive deleted successfully" });
  } catch (err) {
    console.error("Delete Assigned Incentive Error:", err);
    return sendErrorResponse(res, 500, "Failed to delete assigned incentive");
  }
};
