const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build Prisma orderBy from the sortBy query param.
 */
function buildOrderBy(sortBy) {
  switch (sortBy) {
    case "oldest":
      return [{ createdAt: "asc" }];
    case "priority": {
      // Custom priority ordering: URGENT > HIGH > MEDIUM > LOW
      // Prisma doesn't support enum-based ordering directly,
      // so we use a raw sort workaround by returning multiple fallback fields.
      // In practice, use a priority_order computed field or sort in JS for small sets.
      return [{ priority: "desc" }, { createdAt: "desc" }];
    }
    case "due_date":
      return [{ dueDate: "asc" }];
    case "completed_first":
      return [{ status: "asc" }, { createdAt: "desc" }]; // COMPLETED < IN_PROGRESS < PENDING alphabetically
    case "pending_first":
      return [{ status: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

/**
 * Compute total time spent on a task (sum of all completed time log durations).
 * Returns 0 if no logs exist.
 */
async function getTaskTotalTime(taskId) {
  const result = await prisma.timeLog.aggregate({
    where: { taskId, endTime: { not: null } },
    _sum: { durationSeconds: true },
  });
  return result._sum.durationSeconds || 0;
}

// ─── Create Task ──────────────────────────────────────────────────────────────

async function createTask(userId, data) {
  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      status: data.status || "PENDING",
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tags: data.tags || [],
    },
  });

  return task;
}

// ─── Get All Tasks (with filters, search, sort) ───────────────────────────────

async function getTasks(userId, query) {
  const { search, status, priority, tag, filter, sortBy } = query;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Base where clause — ALWAYS filter by userId and exclude soft-deleted
  const where = {
    userId,
    deletedAt: null,
  };

  // ── Search ────────────────────────────────────────────────────────────────
  if (search?.trim()) {
    where.title = { contains: search.trim(), mode: "insensitive" };
  }

  // ── Status filter ─────────────────────────────────────────────────────────
  if (status && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
    where.status = status;
  }

  // ── Priority filter ───────────────────────────────────────────────────────
  if (priority && ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
    where.priority = priority;
  }

  // ── Tag filter ────────────────────────────────────────────────────────────
  if (tag?.trim()) {
    where.tags = { has: tag.trim() };
  }

  // ── Special filters ───────────────────────────────────────────────────────
  if (filter === "due_today") {
    where.dueDate = { gte: todayStart, lte: todayEnd };
  } else if (filter === "overdue") {
    where.dueDate = { lt: todayStart };
    where.status = { not: "COMPLETED" };
  } else if (filter === "high_priority") {
    where.priority = { in: ["HIGH", "URGENT"] };
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  const orderBy = buildOrderBy(sortBy);

  // ── Special sort: time_spent needs post-query sorting ─────────────────────
  const needsTimeSorting = ["time_spent_asc", "time_spent_desc"].includes(sortBy);

  const tasks = await prisma.task.findMany({
    where,
    orderBy: needsTimeSorting ? [{ createdAt: "desc" }] : orderBy,
    include: {
      timeLogs: {
        where: { endTime: { not: null } },
        select: { durationSeconds: true },
      },
    },
  });

  // ── Enrich with totalTimeSeconds ──────────────────────────────────────────
  let enriched = tasks.map((task) => {
    const totalTimeSeconds = task.timeLogs.reduce(
      (acc, log) => acc + (log.durationSeconds || 0),
      0
    );
    const { timeLogs, ...rest } = task;
    return { ...rest, totalTimeSeconds };
  });

  // ── Apply time-based sorting in JS ────────────────────────────────────────
  if (sortBy === "time_spent_desc") {
    enriched.sort((a, b) => b.totalTimeSeconds - a.totalTimeSeconds);
  } else if (sortBy === "time_spent_asc") {
    enriched.sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds);
  }

  return enriched;
}

// ─── Get Single Task ──────────────────────────────────────────────────────────

async function getTaskById(userId, taskId) {
  // CRITICAL: always filter by userId to enforce authorization
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
    include: {
      timeLogs: {
        where: { endTime: { not: null } },
        orderBy: { startTime: "desc" },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          durationSeconds: true,
          source: true,
          createdAt: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const totalTimeSeconds = task.timeLogs.reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );

  return { ...task, totalTimeSeconds };
}

// ─── Update Task ──────────────────────────────────────────────────────────────

async function updateTask(userId, taskId, data) {
  // Verify ownership first
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new AppError("Task not found.", 404);
  }

  const statusChanged = data.status && data.status !== existing.status;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
  });

  return { task: updated, statusChanged, oldStatus: existing.status };
}

// ─── Soft Delete Task ─────────────────────────────────────────────────────────

async function deleteTask(userId, taskId) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new AppError("Task not found.", 404);
  }

  // Stop any active timer for this task before deleting
  const activeLog = await prisma.timeLog.findFirst({
    where: { taskId, userId, endTime: null },
  });

  if (activeLog) {
    const endTime = new Date();
    const durationSeconds = Math.floor(
      (endTime.getTime() - activeLog.startTime.getTime()) / 1000
    );
    await prisma.timeLog.update({
      where: { id: activeLog.id },
      data: { endTime, durationSeconds },
    });
    logger.info("Active timer auto-stopped on task deletion", { taskId, userId });
  }

  // Soft delete
  const deleted = await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });

  return deleted;
}

// ─── Task Time Summary ────────────────────────────────────────────────────────

async function getTaskTimeSummary(userId, taskId) {
  // Verify ownership
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
    select: { id: true, title: true, status: true },
  });

  if (!task) throw new AppError("Task not found.", 404);

  const logs = await prisma.timeLog.findMany({
    where: { taskId, userId, endTime: { not: null } },
    orderBy: { startTime: "desc" },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      durationSeconds: true,
      source: true,
    },
  });

  const totalSeconds = logs.reduce((acc, l) => acc + (l.durationSeconds || 0), 0);

  return {
    task,
    totalTimeSeconds: totalSeconds,
    sessionCount: logs.length,
    logs,
  };
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskTimeSummary,
};
