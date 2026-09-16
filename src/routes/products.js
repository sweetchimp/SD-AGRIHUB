const express = require("express");
const prisma = require("../config/database");
const { customProductSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const { logAction } = require("../utils/audit");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const products = await prisma.customProduct.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(products);
  } catch (error) {
    handleError(res, error, "Fetch products");
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const product = await prisma.customProduct.findUnique({
      where: { id: req.params.id },
    });
    if (!product || product.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    handleError(res, error, "Fetch product");
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = customProductSchema.parse(req.body);
    const product = await prisma.customProduct.create({
      data: { ...data, farmId: req.user.farmId },
    });
    await logAction(req.user.id, req.user.farmId, "CREATE", "Product", product.id, { name: data.name }, req.ip);
    res.status(201).json(product);
  } catch (error) {
    handleError(res, error, "Create product");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.customProduct.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Product not found" });
    }
    const data = customProductSchema.partial().parse(req.body);
    const product = await prisma.customProduct.update({
      where: { id: req.params.id },
      data,
    });
    await logAction(req.user.id, req.user.farmId, "UPDATE", "Product", req.params.id, { name: product.name }, req.ip);
    res.json(product);
  } catch (error) {
    handleError(res, error, "Update product");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const existing = await prisma.customProduct.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Product not found" });
    }
    await prisma.customProduct.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, req.user.farmId, "DELETE", "Product", req.params.id, { name: existing.name }, req.ip);
    res.json({ message: "Product deleted" });
  } catch (error) {
    handleError(res, error, "Delete product");
  }
});

module.exports = router;
