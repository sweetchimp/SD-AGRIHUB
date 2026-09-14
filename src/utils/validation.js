const { z } = require("zod");

const animalSchema = z.object({
  type: z.enum(["cattle", "goat", "chicken", "pig", "sheep", "duck"]),
  tagNumber: z.string().optional(),
  birthDate: z.string().datetime(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().positive().optional(),
  notes: z.string().optional(),
});

const productionSchema = z.object({
  date: z.string().datetime().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  animalId: z.string().optional(),
  plotId: z.string().optional(),
  productId: z.string().optional(),
  notes: z.string().optional(),
});

const expenseSchema = z.object({
  date: z.string().datetime().optional(),
  category: z.enum(["feed", "medicine", "labor", "fuel", "equipment", "fertilizer", "seeds", "other"]),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

const saleSchema = z.object({
  date: z.string().datetime().optional(),
  product: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  pricePerUnit: z.number().positive(),
  buyer: z.string().optional(),
  paymentMethod: z.enum(["cash", "mtn_money", "airtel_money", "bank_transfer"]).optional(),
  notes: z.string().optional(),
});

const workerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.string(),
});

const taskSchema = z.object({
  task: z.string(),
  hours: z.number().positive().optional(),
  ratePerHour: z.number().positive().optional(),
  paymentMethod: z.enum(["cash", "mtn_money", "airtel_money", "bank_transfer"]).optional(),
  notes: z.string().optional(),
});

module.exports = {
  animalSchema,
  productionSchema,
  expenseSchema,
  saleSchema,
  workerSchema,
  taskSchema,
};
