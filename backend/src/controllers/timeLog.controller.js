const timeLogService = require("../services/timeLog.service");
const auditService = require("../services/audit.service");
const { sendSuccess } = require("../utils/response");

// GET /api/time-logs/active
async function getActiveTimer(req, res) {
  const activeLog = await timeLogService.getActiveTimer(req.user.id);

  return sendSuccess(res, {
    message: activeLog ? "Active timer found." : "No active timer.",
    data: { activeLog },
  });
}

// GET /api/time-logs
async function getTimeLogs(req, res) {
  const result = await timeLogService.getTimeLogs(req.user.id, req.query);

  return sendSuccess(res, {
    message: "Time logs fetched successfully.",
    data: result,
  });
}

// POST /api/time-logs/manual
async function createManualLog(req, res) {
  const timeLog = await timeLogService.createManualTimeLog(req.user.id, req.body);

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TIME_LOG_CREATED,
    entityType: "TIME_LOG",
    entityId: timeLog.id,
    metadata: {
      taskId: timeLog.taskId,
      source: "MANUAL",
      durationSeconds: timeLog.durationSeconds,
    },
  });

  return sendSuccess(res, {
    message: "Manual time log created.",
    data: { timeLog },
    statusCode: 201,
  });
}

// PATCH /api/time-logs/:id
async function updateTimeLog(req, res) {
  const { updated, previous } = await timeLogService.updateTimeLog(
    req.user.id,
    req.params.id,
    req.body
  );

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TIME_LOG_EDITED,
    entityType: "TIME_LOG",
    entityId: updated.id,
    metadata: {
      previous: {
        startTime: previous.startTime,
        endTime: previous.endTime,
        durationSeconds: previous.durationSeconds,
      },
      updated: {
        startTime: updated.startTime,
        endTime: updated.endTime,
        durationSeconds: updated.durationSeconds,
      },
    },
  });

  return sendSuccess(res, {
    message: "Time log updated successfully.",
    data: { timeLog: updated },
  });
}

// DELETE /api/time-logs/:id
async function deleteTimeLog(req, res) {
  const deleted = await timeLogService.deleteTimeLog(req.user.id, req.params.id);

  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.TIME_LOG_DELETED,
    entityType: "TIME_LOG",
    entityId: deleted.id,
    metadata: {
      taskId: deleted.taskId,
      durationSeconds: deleted.durationSeconds,
    },
  });

  return sendSuccess(res, { message: "Time log deleted successfully." });
}

module.exports = {
  getActiveTimer,
  getTimeLogs,
  createManualLog,
  updateTimeLog,
  deleteTimeLog,
};
