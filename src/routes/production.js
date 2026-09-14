const express = require("express");
const prisma = require("../config/database");
const { productionSchema } = require("../utils/validation");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const production = await prisma.production.findMany({
      where: { farmId: req.user.farmId },
      include: { animal: true, plot: true, product: true },
    });
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = productionSchema.parse(req.body);
    const production = await prisma.production.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(production);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const production = await prisma.production.findUnique({
      where: { id: req.params.id },
    });
    if (!production || production.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Production record not found" });
    }
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const data = productionSchema.partial().parse(req.body);
    const production = await prisma.production.update({
      where: { id: req.params.id },
      data,
    });
    res.json(production);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.production.delete({ where: { id: req.params.id } });
    res.json({ message: "Production record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
