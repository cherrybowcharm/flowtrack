const { Router } = require("express");
const timeLogController = require("../controllers/timeLog.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { manualTimeLogSchema, updateTimeLogSchema } = require("../config/schemas");

const router = Router();

// All time-log routes require authentication
router.use(authenticate);

// ─── Active Timer (must be BEFORE /:id to avoid route conflict) ───────────────
router.get("/active", timeLogController.getActiveTimer);

// ─── CRUD ─────────────────────────────────────────────────────────────────────
router.get("/", timeLogController.getTimeLogs);
router.post("/manual", validate(manualTimeLogSchema), timeLogController.createManualLog);
router.patch("/:id", validate(updateTimeLogSchema), timeLogController.updateTimeLog);
router.delete("/:id", timeLogController.deleteTimeLog);

module.exports = router;
