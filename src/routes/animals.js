const express = require("express");
const prisma = require("../config/database");
const { animalSchema } = require("../utils/validation");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const data = animalSchema.partial().parse(req.body);
    const animal = await prisma.animal.update({
      where: { id: req.params.id },
      data,
    });
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.animal.delete({ where: { id: req.params.id } });
    res.json({ message: "Animal deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
