const express = require("express");
const prisma = require("../config/database");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const products = await prisma.customProduct.findMany({
      where: { farmId: req.user.farmId },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { name, category, unit } = req.body;
    const product = await prisma.customProduct.create({
      data: { name, category, unit, farmId: req.user.farmId },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
