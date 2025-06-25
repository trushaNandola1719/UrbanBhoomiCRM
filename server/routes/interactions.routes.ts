import { Router } from "express";
import * as interactionDb from "../db/interactions";
import { insertInteractionSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
try {
    const interactions = await interactionDb.getAllInteractions();
    res.json(interactions);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch interactions" });
}
});

router.get("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const interaction = await interactionDb.getInteractionById(id);
    if (!interaction) {
    return res.status(404).json({ message: "Interaction not found" });
    }
    res.json(interaction);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch interaction" });
}
});

router.post("/", async (req, res) => {
try {
    const validatedData = insertInteractionSchema.parse(req.body);
    const interaction = await interactionDb.createInteraction(validatedData);
    res.status(201).json(interaction);
} catch (error) {
    res.status(400).json({ message: "Invalid interaction data", error });
}
});

router.put("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const validatedData = insertInteractionSchema.partial().parse(req.body);
    const interaction = await interactionDb.updateInteraction(id, validatedData);
    if (!interaction) {
    return res.status(404).json({ message: "Interaction not found" });
    }
    res.json(interaction);
} catch (error) {
    res.status(400).json({ message: "Invalid interaction data", error });
}
});

router.delete("/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const deleted = await interactionDb.deleteInteraction(id);
    if (!deleted) {
    return res.status(404).json({ message: "Interaction not found" });
    }
    res.status(204).send();
} catch (error) {
    res.status(500).json({ message: "Failed to delete interaction" });
}
});

export default router;