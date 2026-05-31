const summaryService = require("../services/summary.service");
const { sendSuccess } = require("../utils/response");

// GET /api/summary/today
async function getDailySummary(req, res) {
  const summary = await summaryService.getDailySummary(req.user.id);

  return sendSuccess(res, {
    message: "Daily summary fetched.",
    data: summary,
  });
}

// GET /api/summary/week
async function getWeeklySummary(req, res) {
  const summary = await summaryService.getWeeklySummary(req.user.id);

  return sendSuccess(res, {
    message: "Weekly summary fetched.",
    data: summary,
  });
}

module.exports = { getDailySummary, getWeeklySummary };
