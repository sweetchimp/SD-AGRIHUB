const express = require("express");
const prisma = require("../config/database");
const { customProductSchema } = require("../utils/validation");
const { handleError } = require("../utils/handleError");
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

router.post("/", authenticate, async (req, res) => {
  try {
    const data = customProductSchema.parse(req.body);
    const product = await prisma.customProduct.create({
      data: { ...data, farmId: req.user.farmId },
    });
    res.status(201).json(product);
  } catch (error) {
    handleError(res, error, "Create product");
  }
});

module.exports = router;
