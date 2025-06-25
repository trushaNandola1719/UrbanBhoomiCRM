import { Router } from "express";
import * as brokerDb from "../db/brokers";
import { insertBrokerSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
try {
    const brokers = await brokerDb.getAllBrokers();
    res.json(brokers);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch brokers" });
}
});

router.get("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const broker = await brokerDb.getBrokerById(id);
    if (!broker) {
    return res.status(404).json({ message: "Broker not found" });
    }
    res.json(broker);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch broker" });
}
});

router.post("/", async (req, res) => {
try {
    const validatedData = insertBrokerSchema.parse(req.body);
    const broker = await brokerDb.createBroker(validatedData);
    res.status(201).json(broker);
} catch (error) {
    res.status(400).json({ message: "Invalid broker data", error });
}
});

router.put("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const validatedData = insertBrokerSchema.partial().parse(req.body);
    const broker = await brokerDb.updateBroker(id, validatedData);
    if (!broker) {
    return res.status(404).json({ message: "Broker not found" });
    }
    res.json(broker);
} catch (error) {
    res.status(400).json({ message: "Invalid broker data", error });
}
});

router.delete("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const deleted = await brokerDb.deleteBroker(id);
    if (!deleted) {
    return res.status(404).json({ message: "Broker not found" });
    }
    res.status(204).send();
} catch (error) {
    res.status(500).json({ message: "Failed to delete broker" });
}
});

export default router;