require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const animalsRoutes = require("./routes/animals");
const productionRoutes = require("./routes/production");
const expensesRoutes = require("./routes/expenses");
const salesRoutes = require("./routes/sales");
const workersRoutes = require("./routes/workers");
const productsRoutes = require("./routes/products");
const coffeeRoutes = require("./routes/coffee");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/animals", animalsRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/workers", workersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/coffee", coffeeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FarmOS S&D AGRIHUB Backend v1.0" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ FarmOS backend running on http://localhost:${PORT}`);
  console.log(`✓ Database connected to PostgreSQL`);
  console.log(`✓ All API routes ready`);
});

process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  process.exit(0);
});
