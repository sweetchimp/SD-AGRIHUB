const express = require("express");
const prisma = require("../config/database");
const { productionSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const { logAction } = require("../utils/audit");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const production = await prisma.production.findMany({
      where: { farmId: req.user.farmId },
      include: { animal: true, field: true, product: true },
    });
    res.json(production);
  } catch (error) {
    handleError(res, error, "Fetch production");
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
    handleError(res, error, "Create production");
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
    handleError(res, error, "Fetch production");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.production.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Production record not found" });
    }
    const data = productionSchema.partial().parse(req.body);
    const production = await prisma.production.update({
      where: { id: req.params.id },
      data,
    });
    res.json(production);
  } catch (error) {
    handleError(res, error, "Update production");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.production.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Production record not found" });
    }
    await prisma.production.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, req.user.farmId, "DELETE", "Production", req.params.id, { quantity: existing.quantity, unit: existing.unit }, req.ip);
    res.json({ message: "Production record deleted" });
  } catch (error) {
    handleError(res, error, "Delete production");
  }
});

module.exports = router;
