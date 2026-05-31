require("dotenv").config();

const app = require("./app");
const prisma = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // Verify DB connection before accepting traffic
    await prisma.$connect();
    logger.info("Database connection established");

    const server = app.listen(PORT, () => {
      logger.info(`Server running`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        url: `http://localhost:${PORT}`,
      });
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────
    async function shutdown(signal) {
      logger.info(`${signal} received — shutting down gracefully`);

      server.close(async () => {
        logger.info("HTTP server closed");
        await prisma.$disconnect();
        logger.info("Database connection closed");
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    }

    process.on("SIGTERM", () => shutdown("SIGTERM")); // Render/Railway sends this
    process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C in development

    // ─── Unhandled Errors ────────────────────────────────────────────────────
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Promise Rejection", {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception — shutting down", {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
