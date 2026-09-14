const express = require("express");
const prisma = require("../config/database");
const { workerSchema, taskSchema } = require("../utils/validation");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      where: { farmId: req.user.farmId },
      include: { tasks: true },
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = workerSchema.parse(req.body);
    const worker = await prisma.worker.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id/tasks", authenticate, async (req, res) => {
  try {
    const tasks = await prisma.workerTask.findMany({
      where: { workerId: req.params.id },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/tasks", authenticate, async (req, res) => {
  try {
    const data = taskSchema.parse(req.body);
    const task = await prisma.workerTask.create({
      data: { ...data, workerId: req.params.id },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
