const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/database");
const { registerSchema, loginSchema } = require("../utils/validation");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const failedAttempts = new Map();

function isLockedOut(username) {
  const record = failedAttempts.get(username);
  if (!record) return false;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < LOCKOUT_DURATION_MS) return true;
    failedAttempts.delete(username);
  }
  return false;
}

function recordFailedAttempt(username) {
  const record = failedAttempts.get(username) || { count: 0, lastAttempt: 0 };
  record.count += 1;
  record.lastAttempt = Date.now();
  failedAttempts.set(username, record);
}

function clearFailedAttempts(username) {
  failedAttempts.delete(username);
}

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, farmId: user.farmId },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const farm = await prisma.farm.create({
      data: { name: data.farmName || `${data.fullName}'s Farm`, location: "Uganda" },
    });

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName,
        farmId: farm.id,
        role: "admin",
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });

    setRefreshCookie(res, refreshTokenValue);

    res.json({
      accessToken,
      user: { id: user.id, username: data.username, fullName: data.fullName, farmId: farm.id },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    if (isLockedOut(data.username)) {
      return res.status(423).json({
        error: "Account temporarily locked due to too many failed attempts. Try again in 15 minutes.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (!user) {
      recordFailedAttempt(data.username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      recordFailedAttempt(data.username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    clearFailedAttempts(data.username);

    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });

    setRefreshCookie(res, refreshTokenValue);

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, fullName: user.fullName, farmId: user.farmId },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "No refresh token" });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (new Date() > stored.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, fullName: user.fullName, farmId: user.farmId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ message: "Logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;
