const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const auditService = require("../services/audit.service");

/**
 * Protects routes by verifying the JWT from HTTP-only cookie.
 * Attaches the full user object to req.user on success.
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      // Log unauthorized attempts (no token at all)
      logger.warn("Unauthenticated request — no token", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      throw new AppError("Authentication required. Please log in.", 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        logger.warn("Expired JWT token", { path: req.path, ip: req.ip });
        throw new AppError("Session expired. Please log in again.", 401);
      }
      logger.warn("Invalid JWT token", {
        path: req.path,
        ip: req.ip,
        error: jwtError.message,
      });
      throw new AppError("Invalid token. Please log in again.", 401);
    }

    // Fetch user from DB to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      logger.warn("Token valid but user not found", { userId: decoded.userId });
      throw new AppError("User not found. Please sign up.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    // Fire-and-forget audit log for unauthorized attempts
    if (error.statusCode === 401 || error.statusCode === 403) {
      auditService
        .log({
          userId: req.user?.id || "anonymous",
          action: "UNAUTHORIZED_ACCESS_ATTEMPT",
          entityType: "ROUTE",
          entityId: null,
          metadata: { path: req.path, method: req.method, ip: req.ip },
        })
        .catch(() => {}); // never let audit failure break request
    }
    next(error);
  }
}

module.exports = { authenticate };
