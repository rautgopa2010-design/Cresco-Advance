const { sendErrorResponse } = require("../utility/sendErrorResponse");
const {
  buildAutomationSummary,
  runSalesAutomationForOrg,
} = require("../utility/salesAutomationEngine");

exports.getSalesAutomationSummary = async (req, res) => {
  try {
    const summary = await buildAutomationSummary(req.user.org_id);
    return res.status(200).json(summary);
  } catch (error) {
    console.error("Get Sales Automation Summary Error:", error);
    return sendErrorResponse(res, 500, "Failed to load automation summary");
  }
};

exports.runSalesAutomation = async (req, res) => {
  try {
    const result = await runSalesAutomationForOrg(req.user.org_id);
    return res.status(200).json({
      message: "Automation rules checked successfully",
      ...result,
    });
  } catch (error) {
    console.error("Run Sales Automation Error:", error);
    return sendErrorResponse(res, 500, "Failed to run automation checks");
  }
};
