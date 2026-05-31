const { Router } = require("express");
const taskController = require("../controllers/task.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  aiSuggestSchema,
} = require("../config/schemas");

const router = Router();

// All task routes require authentication
router.use(authenticate);

// ─── AI Suggest (must come BEFORE /:id routes to avoid param conflict) ────────
router.post("/suggest", validate(aiSuggestSchema), taskController.suggestTask);

// ─── Task CRUD ────────────────────────────────────────────────────────────────
router.post("/", validate(createTaskSchema), taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTask);
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// ─── Timer Endpoints ──────────────────────────────────────────────────────────
router.post("/:taskId/start", taskController.startTimer);
router.post("/:taskId/stop", taskController.stopTimer);

// ─── Task Time Summary ────────────────────────────────────────────────────────
router.get("/:taskId/time-summary", taskController.getTaskTimeSummary);

module.exports = router;
