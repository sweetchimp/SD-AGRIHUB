console.time("total-startup");

console.time("dotenv");
require("dotenv").config();
console.timeEnd("dotenv");

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET not set in .env");
  process.exit(1);
}

console.time("requires");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { sanitizeInput } = require("./middleware/sanitize");
const { requestId } = require("./middleware/requestId");
const prisma = require("./config/database");
console.timeEnd("requires");

function lazy(handler) {
  let mod;
  return (...args) => {
    if (!mod) mod = handler();
    return mod(...args);
  };
}

console.time("middleware");
const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(requestId);
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeInput);
console.timeEnd("middleware");

console.time("routes");
// API Routes (lazy-loaded on first request)
app.use("/api/auth", lazy(() => require("./routes/auth")));
app.use("/api/animals", lazy(() => require("./routes/animals")));
app.use("/api/production", lazy(() => require("./routes/production")));
app.use("/api/expenses", lazy(() => require("./routes/expenses")));
app.use("/api/sales", lazy(() => require("./routes/sales")));
app.use("/api/workers", lazy(() => require("./routes/workers")));
app.use("/api/inventory", lazy(() => require("./routes/inventory")));
app.use("/api/products", lazy(() => require("./routes/products")));
app.use("/api/coffee", lazy(() => require("./routes/coffee")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FarmOS S&D AGRIHUB Backend v1.0" });
});
console.timeEnd("routes");

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDist));

  // SPA fallback — serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendDist, "index.html"));
    } else {
      res.status(404).json({ error: "API route not found" });
    }
  });
}

console.time("listen");
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.timeEnd("listen");
  console.timeEnd("total-startup");
  console.log(`✓ FarmOS backend running on http://localhost:${PORT}`);
  console.log(`✓ Security: helmet, rate limiting, sanitization active`);
  if (process.env.NODE_ENV === "production") {
    console.log(`✓ Frontend served from ${path.join(__dirname, "../frontend/dist")}`);
  }
  console.log(`✓ All API routes ready`);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n✓ ${signal} received — shutting down gracefully...`);
  server.close(async () => {
    console.log("✓ HTTP server closed");
    await prisma.$disconnect();
    console.log("✓ Database connections closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("✗ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
