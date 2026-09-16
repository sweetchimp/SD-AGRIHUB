const express = require("express");
const prisma = require("../config/database");
const {
  coffeeFieldSchema,
  coffeeActivitySchema,
  coffeeHarvestSchema,
} = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const authenticate = require("../middleware/auth");

const router = express.Router();

// ─── Coffee Fields ───────────────────────────────────────────

router.get("/fields", authenticate, async (req, res) => {
  try {
    const fields = await prisma.coffeeField.findMany({
      where: { farmId: req.user.farmId },
      include: { activities: true, harvests: true },
    });
    res.json(fields);
  } catch (error) {
    handleError(res, error, "Fetch coffee fields");
  }
});

router.post("/fields", authenticate, async (req, res) => {
  try {
    const data = coffeeFieldSchema.parse(req.body);
    const field = await prisma.coffeeField.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(field);
  } catch (error) {
    handleError(res, error, "Create coffee field");
  }
});

router.put("/fields/:id", authenticate, async (req, res) => {
  try {
    const field = await prisma.coffeeField.findUnique({
      where: { id: req.params.id },
    });
    if (!field || field.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Coffee field not found" });
    }
    const data = coffeeFieldSchema.partial().parse(req.body);
    const updated = await prisma.coffeeField.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (error) {
    handleError(res, error, "Update coffee field");
  }
});

router.delete("/fields/:id", authenticate, async (req, res) => {
  try {
    const field = await prisma.coffeeField.findUnique({
      where: { id: req.params.id },
    });
    if (!field || field.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Coffee field not found" });
    }
    await prisma.coffeeField.delete({ where: { id: req.params.id } });
    res.json({ message: "Coffee field deleted" });
  } catch (error) {
    handleError(res, error, "Delete coffee field");
  }
});

// ─── Coffee Activities ───────────────────────────────────────

router.get("/activities", authenticate, async (req, res) => {
  try {
    const activities = await prisma.coffeeActivity.findMany({
      where: { farmId: req.user.farmId },
      include: { field: true, worker: true },
      orderBy: { date: "desc" },
    });
    res.json(activities);
  } catch (error) {
    handleError(res, error, "Fetch coffee activities");
  }
});

router.post("/activities", authenticate, async (req, res) => {
  try {
    const data = coffeeActivitySchema.parse(req.body);
    const field = await prisma.coffeeField.findUnique({
      where: { id: data.fieldId },
    });
    if (!field || field.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Coffee field not found" });
    }
    const activity = await prisma.coffeeActivity.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(activity);
  } catch (error) {
    handleError(res, error, "Create coffee activity");
  }
});

router.put("/activities/:id", authenticate, async (req, res) => {
  try {
    const activity = await prisma.coffeeActivity.findUnique({
      where: { id: req.params.id },
    });
    if (!activity || activity.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Activity not found" });
    }
    const data = coffeeActivitySchema.partial().parse(req.body);
    const updated = await prisma.coffeeActivity.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (error) {
    handleError(res, error, "Update coffee activity");
  }
});

router.delete("/activities/:id", authenticate, async (req, res) => {
  try {
    const activity = await prisma.coffeeActivity.findUnique({
      where: { id: req.params.id },
    });
    if (!activity || activity.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Activity not found" });
    }
    await prisma.coffeeActivity.delete({ where: { id: req.params.id } });
    res.json({ message: "Activity deleted" });
  } catch (error) {
    handleError(res, error, "Delete coffee activity");
  }
});

// ─── Coffee Harvests ─────────────────────────────────────────

router.get("/harvests", authenticate, async (req, res) => {
  try {
    const harvests = await prisma.coffeeHarvest.findMany({
      where: { farmId: req.user.farmId },
      include: { field: true },
      orderBy: { date: "desc" },
    });
    res.json(harvests);
  } catch (error) {
    handleError(res, error, "Fetch coffee harvests");
  }
});

router.post("/harvests", authenticate, async (req, res) => {
  try {
    const data = coffeeHarvestSchema.parse(req.body);
    const field = await prisma.coffeeField.findUnique({
      where: { id: data.fieldId },
    });
    if (!field || field.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Coffee field not found" });
    }
    const harvest = await prisma.coffeeHarvest.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(harvest);
  } catch (error) {
    handleError(res, error, "Create coffee harvest");
  }
});

router.put("/harvests/:id", authenticate, async (req, res) => {
  try {
    const harvest = await prisma.coffeeHarvest.findUnique({
      where: { id: req.params.id },
    });
    if (!harvest || harvest.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Harvest not found" });
    }
    const data = coffeeHarvestSchema.partial().parse(req.body);
    const updated = await prisma.coffeeHarvest.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (error) {
    handleError(res, error, "Update coffee harvest");
  }
});

router.delete("/harvests/:id", authenticate, async (req, res) => {
  try {
    const harvest = await prisma.coffeeHarvest.findUnique({
      where: { id: req.params.id },
    });
    if (!harvest || harvest.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Harvest not found" });
    }
    await prisma.coffeeHarvest.delete({ where: { id: req.params.id } });
    res.json({ message: "Harvest deleted" });
  } catch (error) {
    handleError(res, error, "Delete coffee harvest");
  }
});

module.exports = router;
