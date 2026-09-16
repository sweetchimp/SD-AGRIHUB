const express = require("express");
const prisma = require("../config/database");
const { workerSchema, taskSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const { logAction } = require("../utils/audit");
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
    handleError(res, error, "Fetch workers");
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
    handleError(res, error, "Create worker");
  }
});

router.get("/tasks/all", authenticate, async (req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      where: { farmId: req.user.farmId },
      include: { tasks: true },
    });
    const allTasks = workers.flatMap((w) =>
      w.tasks.map((t) => ({ ...t, workerName: w.name }))
    );
    res.json(allTasks);
  } catch (error) {
    handleError(res, error, "Fetch all tasks");
  }
});

router.get("/:id/tasks", authenticate, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({ where: { id: req.params.id } });
    if (!worker || worker.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Worker not found" });
    }
    const tasks = await prisma.workerTask.findMany({
      where: { workerId: req.params.id },
    });
    res.json(tasks);
  } catch (error) {
    handleError(res, error, "Fetch tasks");
  }
});

router.post("/:id/tasks", authenticate, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({ where: { id: req.params.id } });
    if (!worker || worker.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Worker not found" });
    }
    const data = taskSchema.parse(req.body);
    const task = await prisma.workerTask.create({
      data: { ...data, workerId: req.params.id },
    });
    res.status(201).json(task);
  } catch (error) {
    handleError(res, error, "Create task");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.worker.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Worker not found" });
    }
    const data = workerSchema.partial().parse(req.body);
    const worker = await prisma.worker.update({
      where: { id: req.params.id },
      data,
    });
    res.json(worker);
  } catch (error) {
    handleError(res, error, "Update worker");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.worker.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Worker not found" });
    }
    await prisma.worker.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, req.user.farmId, "DELETE", "Worker", req.params.id, { name: existing.name, role: existing.role }, req.ip);
    res.json({ message: "Worker deleted" });
  } catch (error) {
    handleError(res, error, "Delete worker");
  }
});

module.exports = router;
