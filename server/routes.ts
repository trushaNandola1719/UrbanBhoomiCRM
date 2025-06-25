import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertPropertySchema, 
  insertBrokerSchema, 
  insertVisitSchema,
  insertInteractionSchema,
  insertPropertyInterestSchema
} from "@shared/schema";
import customers from "./routes/customers.routes";
import properties from "./routes/properties.routes";
import brokers from "./routes/brokers.routes";
import interactions from "./routes/interactions.routes";
import categories from "./routes/property-categories.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Customer routes


  // Property routes
  

  // Broker routes
  

  // Visit routes
  app.get("/api/visits", async (req, res) => {
    try {
      const visits = await storage.getVisits();
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });

  app.get("/api/visits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const visit = await storage.getVisit(id);
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      res.json(visit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visit" });
    }
  });

  app.post("/api/visits", async (req, res) => {
    try {
      const validatedData = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(validatedData);
      res.status(201).json(visit);
    } catch (error) {
      res.status(400).json({ message: "Invalid visit data", error });
    }
  });

  app.put("/api/visits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVisitSchema.partial().parse(req.body);
      const visit = await storage.updateVisit(id, validatedData);
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      res.json(visit);
    } catch (error) {
      res.status(400).json({ message: "Invalid visit data", error });
    }
  });

  app.delete("/api/visits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVisit(id);
      if (!deleted) {
        return res.status(404).json({ message: "Visit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete visit" });
    }
  });

  // Interaction routes


  // Property Interest routes
  app.get("/api/property-interests", async (req, res) => {
    try {
      const interests = await storage.getPropertyInterests();
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property interests" });
    }
  });

  app.post("/api/property-interests", async (req, res) => {
    try {
      const validatedData = insertPropertyInterestSchema.parse(req.body);
      const interest = await storage.createPropertyInterest(validatedData);
      res.status(201).json(interest);
    } catch (error) {
      res.status(400).json({ message: "Invalid property interest data", error });
    }
  });

  app.delete("/api/property-interests/:customerId/:propertyId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const propertyId = parseInt(req.params.propertyId);
      const deleted = await storage.deletePropertyInterest(customerId, propertyId);
      if (!deleted) {
        return res.status(404).json({ message: "Property interest not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property interest" });
    }
  });

  app.use("/api/customers", customers);
  app.use("/api/properties", properties);
  app.use("/api/brokers", brokers);
  // app.use("/api/visits", visits);
  app.use("/api/interactions", interactions);
  app.use("/api/categories", categories);
  // app.use("/api/property-interests", interests);

  return createServer(app);

  const httpServer = createServer(app);
  return httpServer;
}
