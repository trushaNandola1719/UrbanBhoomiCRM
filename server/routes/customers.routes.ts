import { Router } from "express";
import * as customerDb from "../db/customers";
import { insertCustomerSchema } from "@shared/schema";

const router = Router();

router.get("/", async (_, res) => {
  const data = await customerDb.getAllCustomers();
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const customer = await customerDb.getCustomerById(+req.params.id);
  customer ? res.json(customer) : res.status(404).json({ message: "Not found" });
});

router.post("/", async (req, res) => {
  try {
    const validated = insertCustomerSchema.parse(req.body);
    const created = await customerDb.createCustomer(validated);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validated = insertCustomerSchema.partial().parse(req.body);
    const updated = await customerDb.updateCustomer(+req.params.id, validated);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error });
  }
});

router.delete("/:id", async (req, res) => {
  await customerDb.deleteCustomer(+req.params.id);
  res.status(204).send();
});

export default router;
