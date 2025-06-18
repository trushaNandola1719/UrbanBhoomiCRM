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
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data", error });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data", error });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data", error });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, validatedData);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data", error });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProperty(id);
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Broker routes
  app.get("/api/brokers", async (req, res) => {
    try {
      const brokers = await storage.getBrokers();
      res.json(brokers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brokers" });
    }
  });

  app.get("/api/brokers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const broker = await storage.getBroker(id);
      if (!broker) {
        return res.status(404).json({ message: "Broker not found" });
      }
      res.json(broker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch broker" });
    }
  });

  app.post("/api/brokers", async (req, res) => {
    try {
      const validatedData = insertBrokerSchema.parse(req.body);
      const broker = await storage.createBroker(validatedData);
      res.status(201).json(broker);
    } catch (error) {
      res.status(400).json({ message: "Invalid broker data", error });
    }
  });

  app.put("/api/brokers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBrokerSchema.partial().parse(req.body);
      const broker = await storage.updateBroker(id, validatedData);
      if (!broker) {
        return res.status(404).json({ message: "Broker not found" });
      }
      res.json(broker);
    } catch (error) {
      res.status(400).json({ message: "Invalid broker data", error });
    }
  });

  app.delete("/api/brokers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBroker(id);
      if (!deleted) {
        return res.status(404).json({ message: "Broker not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete broker" });
    }
  });

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
  app.get("/api/interactions", async (req, res) => {
    try {
      const interactions = await storage.getInteractions();
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  app.get("/api/interactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const interaction = await storage.getInteraction(id);
      if (!interaction) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      res.json(interaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interaction" });
    }
  });

  app.post("/api/interactions", async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data", error });
    }
  });

  app.put("/api/interactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInteractionSchema.partial().parse(req.body);
      const interaction = await storage.updateInteraction(id, validatedData);
      if (!interaction) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      res.json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data", error });
    }
  });

  app.delete("/api/interactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInteraction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete interaction" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
