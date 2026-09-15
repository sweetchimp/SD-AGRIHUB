const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const plots = await prisma.coffeePlot.findMany({
      where: { farmId: req.user.farmId },
      include: { productions: true },
    });
    res.json(plots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { name, acresPlanted, plantDate, expectedHarvest, status, notes } = req.body;
    if (!name || !acresPlanted || !plantDate) {
      return res.status(400).json({ error: "Name, acres, and plant date are required" });
    }
    const plot = await prisma.coffeePlot.create({
      data: {
        name,
        acresPlanted: parseFloat(acresPlanted),
        plantDate: new Date(plantDate),
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : null,
        status: status || "growing",
        notes: notes || "",
        farmId: req.user.farmId,
      },
    });
    res.status(201).json(plot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const plot = await prisma.coffeePlot.findUnique({
      where: { id: req.params.id },
      include: { productions: true },
    });
    if (!plot || plot.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Coffee plot not found" });
    }
    res.json(plot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name, acresPlanted, plantDate, expectedHarvest, status, notes } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (acresPlanted !== undefined) data.acresPlanted = parseFloat(acresPlanted);
    if (plantDate !== undefined) data.plantDate = new Date(plantDate);
    if (expectedHarvest !== undefined) data.expectedHarvest = expectedHarvest ? new Date(expectedHarvest) : null;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const plot = await prisma.coffeePlot.update({
      where: { id: req.params.id },
      data,
    });
    res.json(plot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.coffeePlot.delete({ where: { id: req.params.id } });
    res.json({ message: "Coffee plot deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
