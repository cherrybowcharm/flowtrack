require("dotenv").config();
require("express-async-errors"); // patches Express to forward async errors to next()

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("./utils/logger");

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const timeLogRoutes = require("./routes/timeLog.routes");
const summaryRoutes = require("./routes/summary.routes");

// ─── Middleware Imports ───────────────────────────────────────────────────────
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Must come before all routes so preflight OPTIONS requests are handled correctly
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // required for HTTP-only cookies to be sent cross-origin
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // limit prevents large payload attacks
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parsing ───────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level](`${req.method} ${req.path} ${res.statusCode} — ${duration}ms`, {
      userId: req.user?.id,
      ip: req.ip,
    });
  });
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time-logs", timeLogRoutes);
app.use("/api/summary", summaryRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
