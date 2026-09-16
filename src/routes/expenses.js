const express = require("express");
const prisma = require("../config/database");
const { expenseSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const { logAction } = require("../utils/audit");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(expenses);
  } catch (error) {
    handleError(res, error, "Fetch expenses");
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(expense);
  } catch (error) {
    handleError(res, error, "Create expense");
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });
    if (!expense || expense.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    handleError(res, error, "Fetch expense");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Expense not found" });
    }
    const data = expenseSchema.partial().parse(req.body);
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data,
    });
    res.json(expense);
  } catch (error) {
    handleError(res, error, "Update expense");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Expense not found" });
    }
    await prisma.expense.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, req.user.farmId, "DELETE", "Expense", req.params.id, { category: existing.category, amount: existing.amount }, req.ip);
    res.json({ message: "Expense deleted" });
  } catch (error) {
    handleError(res, error, "Delete expense");
  }
});

module.exports = router;
