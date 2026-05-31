const { createLogger, format, transports } = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, errors, json } = format;

// ─── Custom Console Format ────────────────────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  if (stack) log += `\n${stack}`;
  if (Object.keys(meta).length) log += `\n${JSON.stringify(meta, null, 2)}`;
  return log;
});

// ─── Logger Instance ──────────────────────────────────────────────────────────
const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json()
  ),
  transports: [
    // Always log to console
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        consoleFormat
      ),
    }),
  ],
  exitOnError: false,
  silent: process.env.NODE_ENV === "test",
});

// ─── Add File Transports in Production ───────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const logDir = path.join(process.cwd(), "logs");

  logger.add(
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
      tailable: true,
    })
  );

  logger.add(
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10,
      tailable: true,
    })
  );
}

module.exports = logger;
