const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const { calcDurationSeconds } = require("../utils/formatTime");
const logger = require("../utils/logger");

// ─── Start Timer ──────────────────────────────────────────────────────────────

async function startTimer(userId, taskId) {
  // 1. Verify task belongs to this user and is not deleted
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
  });

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  // 2. Enforce one active timer per user
  const existingActive = await prisma.timeLog.findFirst({
    where: { userId, endTime: null },
    include: { task: { select: { id: true, title: true } } },
  });

  if (existingActive) {
    logger.warn("Timer conflict — user already has active timer", {
      userId,
      activeTaskId: existingActive.taskId,
      requestedTaskId: taskId,
    });
    throw new AppError(
      `You already have an active timer on "${existingActive.task.title}". Please stop it before starting a new one.`,
      409
    );
  }

  // 3. Create the time log entry with endTime = null (signals active)
  const timeLog = await prisma.timeLog.create({
    data: {
      userId,
      taskId,
      startTime: new Date(),
      endTime: null,
      durationSeconds: null,
      source: "TIMER",
    },
  });

  // 4. Optionally update task status to IN_PROGRESS (only if it was PENDING)
  if (task.status === "PENDING") {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "IN_PROGRESS" },
    });
  }

  logger.info("Timer started", { userId, taskId, timeLogId: timeLog.id });

  return { timeLog, task };
}

// ─── Stop Timer ───────────────────────────────────────────────────────────────

async function stopTimer(userId, taskId) {
  // 1. Verify task belongs to user
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId, deletedAt: null },
  });

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  // 2. Find the active log for this specific task
  const activeLog = await prisma.timeLog.findFirst({
    where: { taskId, userId, endTime: null },
  });

  if (!activeLog) {
    throw new AppError("No active timer found for this task.", 404);
  }

  // 3. Calculate final duration
  const endTime = new Date();
  const durationSeconds = calcDurationSeconds(activeLog.startTime, endTime);

  // 4. Save the completed log
  const completed = await prisma.timeLog.update({
    where: { id: activeLog.id },
    data: { endTime, durationSeconds },
  });

  logger.info("Timer stopped", {
    userId,
    taskId,
    timeLogId: completed.id,
    durationSeconds,
  });

  return completed;
}

// ─── Get Active Timer ─────────────────────────────────────────────────────────
// Critical for frontend resume after page refresh

async function getActiveTimer(userId) {
  const activeLog = await prisma.timeLog.findFirst({
    where: { userId, endTime: null },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          tags: true,
        },
      },
    },
  });

  return activeLog || null;
}

// ─── Get All Time Logs ────────────────────────────────────────────────────────

async function getTimeLogs(userId, query) {
  const { taskId, dateFrom, dateTo, source, page = 1, limit = 50 } = query;

  const where = {
    userId,
    endTime: { not: null }, // Only show completed logs in the list view
  };

  if (taskId) where.taskId = taskId;
  if (source && ["TIMER", "MANUAL"].includes(source)) where.source = source;

  if (dateFrom || dateTo) {
    where.startTime = {};
    if (dateFrom) where.startTime.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.startTime.lte = end;
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    prisma.timeLog.findMany({
      where,
      orderBy: { startTime: "desc" },
      skip,
      take: Number(limit),
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
    }),
    prisma.timeLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

// ─── Add Manual Time Log ──────────────────────────────────────────────────────

async function createManualTimeLog(userId, data) {
  // Verify task ownership
  const task = await prisma.task.findFirst({
    where: { id: data.taskId, userId, deletedAt: null },
  });

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  const durationSeconds = calcDurationSeconds(startTime, endTime);

  if (durationSeconds <= 0) {
    throw new AppError("End time must be after start time.", 400);
  }

  const timeLog = await prisma.timeLog.create({
    data: {
      userId,
      taskId: data.taskId,
      startTime,
      endTime,
      durationSeconds,
      source: "MANUAL",
    },
    include: {
      task: { select: { id: true, title: true } },
    },
  });

  logger.info("Manual time log created", {
    userId,
    taskId: data.taskId,
    durationSeconds,
  });

  return timeLog;
}

// ─── Update Time Log ──────────────────────────────────────────────────────────

async function updateTimeLog(userId, logId, data) {
  // Verify ownership
  const existing = await prisma.timeLog.findFirst({
    where: { id: logId, userId },
  });

  if (!existing) {
    throw new AppError("Time log not found.", 404);
  }

  if (existing.endTime === null) {
    throw new AppError("Cannot edit an active timer. Stop it first.", 400);
  }

  const newStart = data.startTime ? new Date(data.startTime) : existing.startTime;
  const newEnd = data.endTime ? new Date(data.endTime) : existing.endTime;

  if (newEnd <= newStart) {
    throw new AppError("End time must be after start time.", 400);
  }

  const durationSeconds = calcDurationSeconds(newStart, newEnd);

  const updated = await prisma.timeLog.update({
    where: { id: logId },
    data: {
      startTime: newStart,
      endTime: newEnd,
      durationSeconds,
    },
  });

  return { updated, previous: existing };
}

// ─── Delete Time Log ──────────────────────────────────────────────────────────

async function deleteTimeLog(userId, logId) {
  const existing = await prisma.timeLog.findFirst({
    where: { id: logId, userId },
  });

  if (!existing) {
    throw new AppError("Time log not found.", 404);
  }

  if (existing.endTime === null) {
    throw new AppError("Cannot delete an active timer session. Stop it first.", 400);
  }

  await prisma.timeLog.delete({ where: { id: logId } });

  return existing;
}

module.exports = {
  startTimer,
  stopTimer,
  getActiveTimer,
  getTimeLogs,
  createManualTimeLog,
  updateTimeLog,
  deleteTimeLog,
};
