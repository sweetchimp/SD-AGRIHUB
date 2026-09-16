const express = require("express");
const prisma = require("../config/database");
const { inventoryItemSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(items);
  } catch (error) {
    handleError(res, error, "Fetch inventory");
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = inventoryItemSchema.parse(req.body);
    const item = await prisma.inventoryItem.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(item);
  } catch (error) {
    handleError(res, error, "Create inventory item");
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
    });
    if (!item || item.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  } catch (error) {
    handleError(res, error, "Fetch inventory item");
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
    });
    if (!item || item.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    const data = inventoryItemSchema.partial().parse(req.body);
    const updated = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (error) {
    handleError(res, error, "Update inventory item");
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
    });
    if (!item || item.farmId !== req.user.farmId) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    await prisma.inventoryItem.delete({ where: { id: req.params.id } });
    res.json({ message: "Inventory item deleted" });
  } catch (error) {
    handleError(res, error, "Delete inventory item");
  }
});

module.exports = router;
