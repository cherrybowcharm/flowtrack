/**
 * AppError — Operational errors that should be shown to the client.
 * All other errors are treated as programming errors and return 500.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // flag to distinguish from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
