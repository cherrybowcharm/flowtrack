const prisma = require("../config/db");
const { getDayBounds, getWeekBounds, toDateString } = require("../utils/formatTime");

// ─── Daily Summary ────────────────────────────────────────────────────────────

async function getDailySummary(userId) {
  const { start, end } = getDayBounds(new Date());

  // 1. Fetch all COMPLETED time logs that started today
  const todayLogs = await prisma.timeLog.findMany({
    where: {
      userId,
      startTime: { gte: start, lte: end },
      endTime: { not: null },
    },
    include: {
      task: {
        select: { id: true, title: true, status: true, priority: true, tags: true },
      },
    },
  });

  // 2. Aggregate time per task
  const timeByTask = {};
  for (const log of todayLogs) {
    const key = log.taskId;
    if (!timeByTask[key]) {
      timeByTask[key] = {
        taskId: log.task.id,
        title: log.task.title,
        status: log.task.status,
        priority: log.task.priority,
        tags: log.task.tags,
        timeSpentSeconds: 0,
        sessionCount: 0,
      };
    }
    timeByTask[key].timeSpentSeconds += log.durationSeconds || 0;
    timeByTask[key].sessionCount += 1;
  }

  const tasksWorkedOn = Object.values(timeByTask).sort(
    (a, b) => b.timeSpentSeconds - a.timeSpentSeconds
  );

  const totalTrackedSeconds = tasksWorkedOn.reduce(
    (acc, t) => acc + t.timeSpentSeconds,
    0
  );

  // 3. Fetch task status counts for this user (not deleted)
  const [completedCount, pendingCount, inProgressCount] = await Promise.all([
    prisma.task.count({ where: { userId, status: "COMPLETED", deletedAt: null } }),
    prisma.task.count({ where: { userId, status: "PENDING", deletedAt: null } }),
    prisma.task.count({ where: { userId, status: "IN_PROGRESS", deletedAt: null } }),
  ]);

  return {
    date: toDateString(new Date()),
    totalTrackedSeconds,
    completedTasks: completedCount,
    pendingTasks: pendingCount,
    inProgressTasks: inProgressCount,
    tasksWorkedOn,
  };
}

// ─── Weekly Summary ───────────────────────────────────────────────────────────

async function getWeeklySummary(userId) {
  const { start: weekStart, end: weekEnd } = getWeekBounds(new Date());

  // 1. Fetch all completed time logs for the week
  const weekLogs = await prisma.timeLog.findMany({
    where: {
      userId,
      startTime: { gte: weekStart, lte: weekEnd },
      endTime: { not: null },
    },
    include: {
      task: {
        select: { id: true, title: true, status: true, tags: true },
      },
    },
  });

  // 2. Compute daily totals (for trend chart)
  //    Build a map: "YYYY-MM-DD" → totalSeconds
  const dailyMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dailyMap[toDateString(d)] = 0;
  }

  for (const log of weekLogs) {
    const day = toDateString(log.startTime);
    if (day in dailyMap) {
      dailyMap[day] = (dailyMap[day] || 0) + (log.durationSeconds || 0);
    }
  }

  const dailyBreakdown = Object.entries(dailyMap).map(([date, seconds]) => ({
    date,
    totalSeconds: seconds,
  }));

  // 3. Most productive day
  const mostProductiveDay = dailyBreakdown.reduce(
    (best, curr) => (curr.totalSeconds > best.totalSeconds ? curr : best),
    { date: null, totalSeconds: 0 }
  );

  // 4. Total and average
  const totalTrackedSeconds = dailyBreakdown.reduce((acc, d) => acc + d.totalSeconds, 0);
  const avgDailySeconds = Math.floor(totalTrackedSeconds / 7);

  // 5. Time per tag (category breakdown for pie chart)
  const tagMap = {};
  for (const log of weekLogs) {
    const tags = log.task.tags || [];
    if (tags.length === 0) {
      tagMap["Uncategorised"] = (tagMap["Uncategorised"] || 0) + (log.durationSeconds || 0);
    }
    for (const tag of tags) {
      tagMap[tag] = (tagMap[tag] || 0) + (log.durationSeconds || 0);
    }
  }

  const timeByTag = Object.entries(tagMap)
    .map(([tag, seconds]) => ({ tag, totalSeconds: seconds }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);

  // 6. Tasks completed this week
  const completedThisWeek = await prisma.task.count({
    where: {
      userId,
      status: "COMPLETED",
      deletedAt: null,
      updatedAt: { gte: weekStart, lte: weekEnd },
    },
  });

  // 7. Top tasks by time this week
  const taskMap = {};
  for (const log of weekLogs) {
    const key = log.taskId;
    if (!taskMap[key]) {
      taskMap[key] = {
        taskId: log.task.id,
        title: log.task.title,
        status: log.task.status,
        tags: log.task.tags,
        timeSpentSeconds: 0,
      };
    }
    taskMap[key].timeSpentSeconds += log.durationSeconds || 0;
  }

  const topTasks = Object.values(taskMap)
    .sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds)
    .slice(0, 5);

  return {
    weekStart: toDateString(weekStart),
    weekEnd: toDateString(weekEnd),
    totalTrackedSeconds,
    avgDailySeconds,
    completedTasksThisWeek: completedThisWeek,
    mostProductiveDay,
    dailyBreakdown,
    timeByTag,
    topTasks,
  };
}

module.exports = { getDailySummary, getWeeklySummary };
