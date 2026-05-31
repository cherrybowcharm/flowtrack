const authService = require("../services/auth.service");
const auditService = require("../services/audit.service");
const { sendSuccess } = require("../utils/response");
const logger = require("../utils/logger");

// POST /api/auth/signup
async function signup(req, res) {
  const { name, email, password } = req.body;

  const { user, token } = await authService.signup({ name, email, password });

  authService.setAuthCookie(res, token);

  // Audit log (fire and forget)
  auditService.log({
    userId: user.id,
    action: auditService.ACTIONS.LOGIN_SUCCESS,
    entityType: "USER",
    entityId: user.id,
    metadata: { event: "signup" },
  });

  return sendSuccess(res, {
    message: "Account created successfully.",
    data: { user },
    statusCode: 201,
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  let user, token;
  try {
    ({ user, token } = await authService.login({ email, password }));
  } catch (error) {
    // Log failed attempt before re-throwing
    auditService.log({
      userId: "anonymous",
      action: auditService.ACTIONS.LOGIN_FAILED,
      entityType: "USER",
      entityId: null,
      metadata: { email },
    });
    throw error;
  }

  authService.setAuthCookie(res, token);

  auditService.log({
    userId: user.id,
    action: auditService.ACTIONS.LOGIN_SUCCESS,
    entityType: "USER",
    entityId: user.id,
    metadata: { event: "login" },
  });

  return sendSuccess(res, {
    message: "Logged in successfully.",
    data: { user },
  });
}

// POST /api/auth/logout
async function logout(req, res) {
  auditService.log({
    userId: req.user.id,
    action: auditService.ACTIONS.LOGOUT,
    entityType: "USER",
    entityId: req.user.id,
    metadata: null,
  });

  authService.clearAuthCookie(res);

  return sendSuccess(res, { message: "Logged out successfully." });
}

// GET /api/auth/me
async function me(req, res) {
  // req.user is already attached by auth middleware (no DB call needed)
  return sendSuccess(res, {
    message: "User fetched successfully.",
    data: { user: req.user },
  });
}

module.exports = { signup, login, logout, me };
