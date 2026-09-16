const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many registration attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter };
