const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

/**
 * Handle Prisma-specific errors and convert them to AppErrors.
 */
function handlePrismaError(error) {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const field = error.meta?.target?.join(", ") || "field";
      return new AppError(`A record with this ${field} already exists.`, 409);

    case "P2025":
      // Record not found (e.g. findUniqueOrThrow)
      return new AppError("The requested record was not found.", 404);

    case "P2003":
      // Foreign key constraint
      return new AppError("Related record not found.", 400);

    case "P2014":
      // Required relation violation
      return new AppError("Invalid relationship data provided.", 400);

    default:
      return null; // Let it fall through to generic 500
  }
}

/**
 * Global Express error handling middleware.
 * Must be registered LAST in app.js (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // ── Convert Prisma errors ──────────────────────────────────────────────────
  if (err.constructor?.name?.startsWith("Prisma")) {
    const converted = handlePrismaError(err);
    if (converted) error = converted;
  }

  // ── JWT errors (shouldn't reach here, handled in middleware, but just in case)
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Authentication token has expired.", 401);
  }

  // ── Determine if operational (safe to show message) or programming error ───
  const isOperational = error.isOperational === true;
  const statusCode = error.statusCode || 500;
  const message = isOperational ? error.message : "An internal server error occurred.";

  // ── Log the error ──────────────────────────────────────────────────────────
  if (statusCode >= 500) {
    logger.error("Unhandled server error", {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip,
    });
  } else {
    logger.warn("Client error", {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    });
  }

  // ── Send response ──────────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Include validation details in development only
    ...(process.env.NODE_ENV === "development" && !isOperational && { stack: err.stack }),
  });
}

/**
 * Catch-all for unmatched routes (404).
 */
function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.path} not found.`, 404));
}

module.exports = { errorHandler, notFound };
