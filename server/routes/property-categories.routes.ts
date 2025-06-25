import { Router } from "express";
import * as categoryDb from "../db/property-categories";

const router = Router();

router.get("/", async (req, res) => {
try {
    const properties = await categoryDb.getAllCategories();
    res.json(properties);
} catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
}
});

router.get("/sub/:id", async (req, res) => {
try {
    const id = parseInt(req.params.id);
    const property = await categoryDb.getAllSubCategoriesofCat(id);
    if (!property) {
    return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
} catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to fetch property" });
}
});

export default router;