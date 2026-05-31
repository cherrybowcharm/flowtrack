const taskService = require("../services/task.service");
const timeLogService = require("../services/timeLog.service");
const auditService = require("../services/audit.service");
const aiService = require("../services/ai.service");
const { sendSuccess } = require("../utils/response");

// ─── Task CRUD ────────────────────────────────────────────────────────────────

// POST /api/tasks
async function createTask(req, res) {
  const task = await taskService.createTask(req.user.id, req.body);

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TASK_CREATED,
    entityType: "TASK",
    entityId: task.id,
    metadata: { title: task.title, priority: task.priority },
  });

  return sendSuccess(res, {
    message: "Task created successfully.",
    data: { task },
    statusCode: 201,
  });
}

// GET /api/tasks
async function getTasks(req, res) {
  const tasks = await taskService.getTasks(req.user.id, req.query);

  return sendSuccess(res, {
    message: "Tasks fetched successfully.",
    data: { tasks, count: tasks.length },
  });
}

// GET /api/tasks/:id
async function getTask(req, res) {
  const task = await taskService.getTaskById(req.user.id, req.params.id);

  return sendSuccess(res, {
    message: "Task fetched successfully.",
    data: { task },
  });
}

// PATCH /api/tasks/:id
async function updateTask(req, res) {
  const { task, statusChanged, oldStatus } = await taskService.updateTask(
    req.user.id,
    req.params.id,
    req.body
  );

  auditService.log({
    userId: req.user.id,
    action: statusChanged
      ? auditService.ACTIONS.TASK_STATUS_CHANGED
      : auditService.ACTIONS.TASK_UPDATED,
    entityType: "TASK",
    entityId: task.id,
    metadata: statusChanged
      ? { from: oldStatus, to: task.status, title: task.title }
      : { title: task.title, updatedFields: Object.keys(req.body) },
  });

  return sendSuccess(res, {
    message: "Task updated successfully.",
    data: { task },
  });
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const task = await taskService.deleteTask(req.user.id, req.params.id);

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TASK_DELETED,
    entityType: "TASK",
    entityId: task.id,
    metadata: { title: task.title },
  });

  return sendSuccess(res, { message: "Task deleted successfully." });
}

// ─── Timer Endpoints ──────────────────────────────────────────────────────────

// POST /api/tasks/:taskId/start
async function startTimer(req, res) {
  const { timeLog, task } = await timeLogService.startTimer(
    req.user.id,
    req.params.taskId
  );

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TIMER_STARTED,
    entityType: "TASK",
    entityId: task.id,
    metadata: { title: task.title, timeLogId: timeLog.id },
  });

  return sendSuccess(res, {
    message: "Timer started.",
    data: { timeLog, task: { id: task.id, title: task.title } },
    statusCode: 201,
  });
}

// POST /api/tasks/:taskId/stop
async function stopTimer(req, res) {
  const timeLog = await timeLogService.stopTimer(req.user.id, req.params.taskId);

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TIMER_STOPPED,
    entityType: "TASK",
    entityId: req.params.taskId,
    metadata: {
      timeLogId: timeLog.id,
      durationSeconds: timeLog.durationSeconds,
    },
  });

  return sendSuccess(res, {
    message: "Timer stopped.",
    data: { timeLog },
  });
}

// GET /api/tasks/:taskId/time-summary
async function getTaskTimeSummary(req, res) {
  const summary = await taskService.getTaskTimeSummary(
    req.user.id,
    req.params.taskId
  );

  return sendSuccess(res, {
    message: "Task time summary fetched.",
    data: summary,
  });
}

// ─── AI Suggest ───────────────────────────────────────────────────────────────

// POST /api/tasks/suggest
async function suggestTask(req, res) {
  const suggestion = await aiService.suggestTask(req.body.input);

  return sendSuccess(res, {
    message: "Suggestion generated successfully.",
    data: { suggestion },
  });
}

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  startTimer,
  stopTimer,
  getTaskTimeSummary,
  suggestTask,
};
