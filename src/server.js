require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET not set in .env");
  process.exit(1);
}

const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { sanitizeInput } = require("./middleware/sanitize");
const { requestId } = require("./middleware/requestId");
const authRoutes = require("./routes/auth");
const animalsRoutes = require("./routes/animals");
const productionRoutes = require("./routes/production");
const expensesRoutes = require("./routes/expenses");
const salesRoutes = require("./routes/sales");
const workersRoutes = require("./routes/workers");
const inventoryRoutes = require("./routes/inventory");
const productsRoutes = require("./routes/products");
const coffeeRoutes = require("./routes/coffee");

const app = express();

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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/animals", animalsRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/workers", workersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/coffee", coffeeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FarmOS S&D AGRIHUB Backend v1.0" });
});

// Serve frontend static files in production
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

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✓ FarmOS backend running on http://localhost:${PORT}`);
  console.log(`✓ Security: helmet, rate limiting, sanitization active`);
  console.log(`✓ Frontend served from ${frontendDist}`);
  console.log(`✓ All API routes ready`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n✓ ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log("✓ HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("✗ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
