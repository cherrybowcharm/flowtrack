const { Router } = require("express");
const summaryController = require("../controllers/summary.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = Router();

router.use(authenticate);

router.get("/today", summaryController.getDailySummary);
router.get("/week", summaryController.getWeeklySummary);

module.exports = router;
