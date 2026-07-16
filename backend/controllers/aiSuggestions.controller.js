const { sendErrorResponse } = require("../utility/sendErrorResponse");
const { buildAiSuggestions } = require("../utility/aiSuggestionEngine");

exports.getAiSuggestions = async (req, res) => {
  try {
    const suggestions = await buildAiSuggestions(req.user.org_id);
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Get AI Suggestions Error:", error);
    return sendErrorResponse(res, 500, "Failed to load AI suggestions");
  }
};
