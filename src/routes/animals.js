const express = require("express");
const prisma = require("../config/database");
const { animalSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const { logAction } = require("../utils/audit");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(animals);
  } catch (error) {
    handleError(res, error, "Fetch animals");
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = animalSchema.parse(req.body);
    const animal = await prisma.animal.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(animal);
  } catch (error) {
    handleError(res, error, "Create animal");
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const animal = await prisma.animal.findUnique({
      where: { id: req.params.id },
      include: { productions: true },
    });
    if (!animal || animal.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Animal not found" });
    }
    res.json(animal);
  } catch (error) {
    handleError(res, error, "Fetch animal");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.animal.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Animal not found" });
    }
    const data = animalSchema.partial().parse(req.body);
    const animal = await prisma.animal.update({
      where: { id: req.params.id },
      data,
    });
    res.json(animal);
  } catch (error) {
    handleError(res, error, "Update animal");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.animal.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Animal not found" });
    }
    await prisma.animal.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, req.user.farmId, "DELETE", "Animal", req.params.id, { type: existing.type, tagNumber: existing.tagNumber }, req.ip);
    res.json({ message: "Animal deleted" });
  } catch (error) {
    handleError(res, error, "Delete animal");
  }
});

module.exports = router;
