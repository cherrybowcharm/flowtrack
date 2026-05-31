const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

// Prevent multiple Prisma instances in development (hot-reload creates new instances)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

// Log slow queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    if (e.duration > 200) {
      logger.warn("Slow Prisma query", {
        query: e.query,
        duration: `${e.duration}ms`,
      });
    }
  });
}

prisma.$on("error", (e) => {
  logger.error("Prisma error", { message: e.message, target: e.target });
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
