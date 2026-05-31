const prisma = require("../config/db");
const logger = require("../utils/logger");

// ─── Audit Action Constants ───────────────────────────────────────────────────
const ACTIONS = {
  // Auth
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  UNAUTHORIZED_ACCESS_ATTEMPT: "UNAUTHORIZED_ACCESS_ATTEMPT",

  // Tasks
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  TASK_STATUS_CHANGED: "TASK_STATUS_CHANGED",

  // Timer
  TIMER_STARTED: "TIMER_STARTED",
  TIMER_STOPPED: "TIMER_STOPPED",

  // Time Logs
  TIME_LOG_CREATED: "TIME_LOG_CREATED",
  TIME_LOG_EDITED: "TIME_LOG_EDITED",
  TIME_LOG_DELETED: "TIME_LOG_DELETED",
};

/**
 * Write an audit log entry.
 * ALWAYS call without await — this is intentionally fire-and-forget.
 * Audit failures must never block the main request/response cycle.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.action   — one of ACTIONS constants
 * @param {string} params.entityType — e.g. "TASK", "TIME_LOG", "ROUTE"
 * @param {string|null} [params.entityId]
 * @param {object|null} [params.metadata]
 */
async function log({ userId, action, entityType, entityId = null, metadata = null }) {
  try {
    // Skip DB write for anonymous audit logs (e.g. failed logins before user lookup)
    if (!userId || userId === "anonymous") {
      logger.info("Audit log (anonymous)", { action, entityType, metadata });
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  } catch (error) {
    // Never throw — only log the failure
    logger.error("Failed to write audit log", {
      userId,
      action,
      error: error.message,
    });
  }
}

module.exports = { log, ACTIONS };
