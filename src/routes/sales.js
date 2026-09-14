const express = require("express");
const prisma = require("../config/database");
const { saleSchema } = require("../utils/validation");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = saleSchema.parse(req.body);
    const sale = await prisma.sale.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
    });
    if (!sale || sale.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const data = saleSchema.partial().parse(req.body);
    const sale = await prisma.sale.update({
      where: { id: req.params.id },
      data,
    });
    res.json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.sale.delete({ where: { id: req.params.id } });
    res.json({ message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
