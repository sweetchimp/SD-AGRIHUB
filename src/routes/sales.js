const express = require("express");
const prisma = require("../config/database");
const { saleSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const { logAction } = require("../utils/audit");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(sales);
  } catch (error) {
    handleError(res, error, "Fetch sales");
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = saleSchema.parse(req.body);
    const totalPrice = data.quantity * data.pricePerUnit;
    const sale = await prisma.sale.create({
      data: { ...data, totalPrice, farmId: req.user.farmId },
    });
    await logAction(req.user.id, req.user.farmId, "CREATE", "Sale", sale.id, { product: data.product, totalPrice }, req.ip);
    res.status(201).json(sale);
  } catch (error) {
    handleError(res, error, "Create sale");
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
    handleError(res, error, "Fetch sale");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.sale.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Sale not found" });
    }
    const data = saleSchema.partial().parse(req.body);
    if (data.quantity !== undefined || data.pricePerUnit !== undefined) {
      data.totalPrice = (data.quantity ?? existing.quantity) * (data.pricePerUnit ?? existing.pricePerUnit);
    }
    const sale = await prisma.sale.update({
      where: { id: req.params.id },
      data,
    });
    if (data.paymentReceived !== undefined && data.paymentReceived !== existing.paymentReceived) {
      await logAction(req.user.id, req.user.farmId, "UPDATE", "Sale", req.params.id, { paymentReceived: data.paymentReceived }, req.ip);
    }
    res.json(sale);
  } catch (error) {
    handleError(res, error, "Update sale");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.sale.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Sale not found" });
    }
    await prisma.sale.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, req.user.farmId, "DELETE", "Sale", req.params.id, { product: existing.product, totalPrice: existing.totalPrice }, req.ip);
    res.json({ message: "Sale deleted" });
  } catch (error) {
    handleError(res, error, "Delete sale");
  }
});

module.exports = router;
