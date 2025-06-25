import { Router } from "express";
import * as propertyDb from "../db/properties";
import { insertPropertySchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
try {
    const properties = await propertyDb.getAllProperties();
    res.json(properties);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
}
});

router.get("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const property = await propertyDb.getPropertyById(id);
    if (!property) {
    return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch property" });
}
});

router.post("/", async (req, res) => {
try {
    const validatedData = insertPropertySchema.parse(req.body);
    const property = await propertyDb.createProperty(validatedData);
    res.status(201).json(property);
} catch (error) {
    res.status(400).json({ message: "Invalid property data", error });
}
});

router.put("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const validatedData = insertPropertySchema.partial().parse(req.body);
    const property = await propertyDb.updateProperty(id, validatedData);
    if (!property) {
    return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
} catch (error) {
    res.status(400).json({ message: "Invalid property data", error });
}
});

router.delete("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const deleted = await propertyDb.deleteProperty(id);
    if (!deleted) {
    return res.status(404).json({ message: "Property not found" });
    }
    res.status(204).send();
} catch (error) {
    res.status(500).json({ message: "Failed to delete property" });
}
});

export default router;