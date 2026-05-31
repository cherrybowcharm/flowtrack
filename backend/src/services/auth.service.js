const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const SALT_ROUNDS = 12;
const COOKIE_NAME = "token";

// ─── Token Helpers ────────────────────────────────────────────────────────────

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,          // not accessible by JS — prevents XSS token theft
    secure: isProd,          // HTTPS only in production
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/",
  };
}

// ─── Signup ───────────────────────────────────────────────────────────────────

async function signup({ name, email, password }) {
  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = generateToken(user.id);

  logger.info("New user signed up", { userId: user.id, email: user.email });

  return { user, token };
}

// ─── Login ────────────────────────────────────────────────────────────────────

async function login({ email, password }) {
  // Always find by email first
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Generic message — don't reveal whether email exists
    logger.warn("Login failed — email not found", { email });
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    logger.warn("Login failed — wrong password", { userId: user.id, email });
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user.id);

  logger.info("User logged in", { userId: user.id });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  return { user: safeUser, token };
}

// ─── Set / Clear Cookie ───────────────────────────────────────────────────────

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
}

module.exports = { signup, login, setAuthCookie, clearAuthCookie };
