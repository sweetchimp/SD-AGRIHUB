const { z } = require("zod");

const registerSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(2).max(100).trim(),
  farmName: z.string().min(2).max(100).trim().optional(),
});

const loginSchema = z.object({
  username: z.string().min(1).max(30).trim(),
  password: z.string().min(1).max(100),
});

const customProductSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  category: z.string().min(1).max(50).trim(),
  unit: z.string().min(1).max(30).trim(),
});

const animalSchema = z.object({
  type: z.enum(["cattle", "goat", "chicken", "pig", "sheep", "duck"]),
  breed: z.string().max(50).trim().optional(),
  sex: z.enum(["male", "female"]).optional(),
  tagNumber: z.string().max(30).trim().optional(),
  birthDate: z.string().datetime(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().positive().optional(),
  status: z.enum(["active", "sold", "deceased"]).optional(),
  notes: z.string().max(500).trim().optional(),
});

const productionSchema = z.object({
  date: z.string().datetime().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(30).trim(),
  animalId: z.string().optional(),
  fieldId: z.string().optional(),
  productId: z.string().optional(),
  managerId: z.string().optional(),
  notes: z.string().max(500).trim().optional(),
});

const expenseSchema = z.object({
  date: z.string().datetime().optional(),
  category: z.enum(["feed", "medicine", "labor", "fuel", "equipment", "fertilizer", "seeds", "other"]),
  amount: z.number().positive(),
  managerId: z.string().optional(),
  notes: z.string().max(500).trim().optional(),
});

const saleSchema = z.object({
  date: z.string().datetime().optional(),
  product: z.string().min(1).max(100).trim(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(30).trim(),
  pricePerUnit: z.number().positive(),
  buyer: z.string().max(100).trim().optional(),
  paymentMethod: z.enum(["cash", "mtn_money", "airtel_money", "bank_transfer"]).optional(),
  managerId: z.string().optional(),
  notes: z.string().max(500).trim().optional(),
});

const workerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  phone: z.string().max(20).trim().optional(),
  role: z.string().min(1).max(50).trim(),
});

const taskSchema = z.object({
  task: z.string().min(1).max(200).trim(),
  hours: z.number().positive().optional(),
  ratePerHour: z.number().positive().optional(),
  paymentMethod: z.enum(["cash", "mtn_money", "airtel_money", "bank_transfer"]).optional(),
  notes: z.string().max(500).trim().optional(),
});

const coffeeFieldSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  acres: z.number().positive(),
  coffeeVariety: z.string().min(1).max(100).trim(),
  numberOfTrees: z.number().int().positive(),
  yearPlanted: z.number().int(),
  status: z.enum(["active", "inactive", "mature", "new"]).optional(),
  notes: z.string().max(500).trim().optional(),
});

const coffeeActivitySchema = z.object({
  fieldId: z.string().min(1),
  activityType: z.enum(["pruning", "weeding", "fertilizing", "spraying", "harvesting", "other"]),
  date: z.string().datetime().optional(),
  managerId: z.string().optional(),
  notes: z.string().max(500).trim().optional(),
});

const coffeeHarvestSchema = z.object({
  fieldId: z.string().min(1),
  date: z.string().datetime().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(30).trim(),
  notes: z.string().max(500).trim().optional(),
});

const inventoryItemSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  category: z.enum(["fertilizer", "chemicals", "feed", "medicine", "coffee_supplies", "other"]),
  quantity: z.number().min(0),
  unit: z.string().min(1).max(30).trim(),
  minimumStock: z.number().min(0).optional(),
  supplier: z.string().max(100).trim().optional(),
  purchasePrice: z.number().positive().optional(),
  notes: z.string().max(500).trim().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  customProductSchema,
  animalSchema,
  productionSchema,
  expenseSchema,
  saleSchema,
  workerSchema,
  taskSchema,
  coffeeFieldSchema,
  coffeeActivitySchema,
  coffeeHarvestSchema,
  inventoryItemSchema,
};
