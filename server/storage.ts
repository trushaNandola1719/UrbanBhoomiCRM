import { 
  customers, properties, brokers, visits, interactions, propertyInterests,
  type Customer, type InsertCustomer, 
  type Property, type InsertProperty,
  type Broker, type InsertBroker,
  type Visit, type InsertVisit,
  type VisitWithDetails,
  type Interaction, type InsertInteraction,
  type InteractionWithDetails,
  type PropertyInterest, type InsertPropertyInterest,
  type CustomerWithDetails,
  type BrokerWithStats
} from "@shared/schema";

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Broker operations
  getBrokers(): Promise<Broker[]>;
  getBroker(id: number): Promise<Broker | undefined>;
  createBroker(broker: InsertBroker): Promise<Broker>;
  updateBroker(id: number, broker: Partial<InsertBroker>): Promise<Broker | undefined>;
  deleteBroker(id: number): Promise<boolean>;
  
  // Visit operations
  getVisits(): Promise<VisitWithDetails[]>;
  getVisit(id: number): Promise<VisitWithDetails | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, visit: Partial<InsertVisit>): Promise<Visit | undefined>;
  deleteVisit(id: number): Promise<boolean>;
  
  // Interaction operations
  getInteractions(): Promise<InteractionWithDetails[]>;
  getInteraction(id: number): Promise<InteractionWithDetails | undefined>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  updateInteraction(id: number, interaction: Partial<InsertInteraction>): Promise<Interaction | undefined>;
  deleteInteraction(id: number): Promise<boolean>;
  
  // Property Interest operations
  getPropertyInterests(): Promise<PropertyInterest[]>;
  createPropertyInterest(interest: InsertPropertyInterest): Promise<PropertyInterest>;
  deletePropertyInterest(customerId: number, propertyId: number): Promise<boolean>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalCustomers: number;
    activeProperties: number;
    visitsThisMonth: number;
    totalRevenue: number;
    interactionsThisMonth: number;
    hotLeads: number;
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer> = new Map();
  private properties: Map<number, Property> = new Map();
  private brokers: Map<number, Broker> = new Map();
  private visits: Map<number, Visit> = new Map();
  private interactions: Map<number, Interaction> = new Map();
  private propertyInterests: Map<string, PropertyInterest> = new Map();
  private currentCustomerId = 1;
  private currentPropertyId = 1;
  private currentBrokerId = 1;
  private currentVisitId = 1;
  private currentInteractionId = 1;
  private currentPropertyInterestId = 1;

  constructor() {
    // Initialize with some sample data for development
    this.initializeData();
  }

  private initializeData() {
    // Sample customers
    const sampleCustomer1: Customer = {
      id: this.currentCustomerId++,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      phone: "+91 98765 43210",
      alternatePhone: null,
      address: "Andheri West, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      occupation: "Software Engineer",
      annualIncome: "1200000",
      budgetMin: "8000000",
      budgetMax: "12000000",
      preferredLocations: JSON.stringify(["Andheri", "Bandra", "Juhu"]),
      propertyType: "apartment",
      priority: "warm",
      source: "referral",
      assignedBrokerId: 1,
      notes: "Looking for properties in Andheri area",
      status: "active",
      lastInteractionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    const sampleCustomer2: Customer = {
      id: this.currentCustomerId++,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 87654 32109",
      alternatePhone: "+91 22345 67890",
      address: "Bandra East, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      occupation: "Business Owner",
      annualIncome: "2500000",
      budgetMin: "15000000",
      budgetMax: "20000000",
      preferredLocations: JSON.stringify(["Bandra", "Khar", "Santacruz"]),
      propertyType: "villa",
      priority: "hot",
      source: "website",
      assignedBrokerId: 1,
      notes: "Prefers properties with garden space",
      status: "active",
      lastInteractionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    this.customers.set(sampleCustomer1.id, sampleCustomer1);
    this.customers.set(sampleCustomer2.id, sampleCustomer2);

    // Sample properties
    const sampleProperty1: Property = {
      id: this.currentPropertyId++,
      title: "Sunrise Apartments",
      description: "Modern residential complex with swimming pool and landscaped gardens",
      category: "flats",
      price: "8500000",
      location: "Andheri West, Mumbai",
      address: "Plot No. 123, Andheri West, Mumbai - 400058",
      latitude: "19.1359",
      longitude: "72.8267",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      bedrooms: 3,
      bathrooms: 2,
      area: "1200",
      ownerName: "Sharma Builders",
      ownerContact: "+91 99887 76655",
      images: "[]",
      amenities: JSON.stringify(["Swimming Pool", "Gym", "Garden", "Parking"]),
      furnishing: "semi-furnished",
      parking: true,
      facing: "east",
      floor: 5,
      totalFloors: 12,
      age: 3,
      status: "available",
      createdAt: new Date(),
    };

    const sampleProperty2: Property = {
      id: this.currentPropertyId++,
      title: "Green Valley Bungalow",
      description: "Elegant single-family home with large windows and modern architecture",
      category: "bungalow",
      price: "12000000",
      location: "Bandra, Mumbai",
      address: "Bungalow No. 45, Bandra West, Mumbai - 400050",
      latitude: "19.0596",
      longitude: "72.8295",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      bedrooms: 4,
      bathrooms: 3,
      area: "2500",
      ownerName: "Ravi Patel",
      ownerContact: "+91 88776 65544",
      images: "[]",
      amenities: JSON.stringify(["Garden", "Terrace", "Parking", "Security"]),
      furnishing: "furnished",
      parking: true,
      facing: "north",
      floor: null,
      totalFloors: null,
      age: 5,
      status: "available",
      createdAt: new Date(),
    };

    this.properties.set(sampleProperty1.id, sampleProperty1);
    this.properties.set(sampleProperty2.id, sampleProperty2);

    // Sample brokers
    const sampleBroker1: Broker = {
      id: this.currentBrokerId++,
      name: "Amit Mehta",
      email: "amit.mehta@email.com",
      phone: "+91 99887 76655",
      alternatePhone: null,
      address: "Powai, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076",
      notes: "Expert in luxury properties",
      specialization: JSON.stringify(["Luxury Apartments", "Commercial Properties"]),
      experience: 8,
      commissionRate: "2.5",
      totalCommission: "240000",
      affiliation: "in-house",
      licenseNumber: "MH/REA/2016/AMT001",
      education: "MBA Real Estate",
      languages: JSON.stringify(["English", "Hindi", "Marathi"]),
      certifications: JSON.stringify(["RERA Certified", "Real Estate License"]),
      socialMediaLinks: JSON.stringify({"linkedin": "https://linkedin.com/in/amitmehta"}),
      performanceRating: "4.5",
      status: "active",
      createdAt: new Date(),
    };

    this.brokers.set(sampleBroker1.id, sampleBroker1);

    // Sample visits
    const sampleVisit1: Visit = {
      id: this.currentVisitId++,
      customerId: sampleCustomer1.id,
      propertyId: sampleProperty1.id,
      brokerId: sampleBroker1.id,
      visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      feedback: "Very impressed with the amenities and location. Considering making an offer.",
      rating: 5,
      notes: "Customer showed high interest",
      status: "completed",
      createdAt: new Date(),
    };

    this.visits.set(sampleVisit1.id, sampleVisit1);

    // Sample interactions
    const sampleInteraction1: Interaction = {
      id: this.currentInteractionId++,
      customerId: sampleCustomer1.id,
      brokerId: sampleBroker1.id,
      propertyId: sampleProperty1.id,
      type: "digital_sharing",
      method: "whatsapp",
      description: "Shared property details and virtual tour link",
      outcome: "interested",
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "high",
      duration: 15,
      customerFeedback: "Very interested, wants to schedule visit",
      notes: "Customer loved the amenities and location",
      status: "completed",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    };

    const sampleInteraction2: Interaction = {
      id: this.currentInteractionId++,
      customerId: sampleCustomer2.id,
      brokerId: sampleBroker1.id,
      propertyId: null,
      type: "follow_up",
      method: "phone",
      description: "Follow-up call to understand requirements better",
      outcome: "negotiating",
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: "medium",
      duration: 25,
      customerFeedback: "Considering multiple options",
      notes: "Needs properties with garden space",
      status: "completed",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };

    this.interactions.set(sampleInteraction1.id, sampleInteraction1);
    this.interactions.set(sampleInteraction2.id, sampleInteraction2);

    // Sample property interests
    const sampleInterest1: PropertyInterest = {
      id: this.currentPropertyInterestId++,
      customerId: sampleCustomer1.id,
      propertyId: sampleProperty1.id,
      interestLevel: "high",
      notes: "Primary choice for the customer",
      createdAt: new Date(),
    };

    this.propertyInterests.set(`${sampleCustomer1.id}-${sampleProperty1.id}`, sampleInterest1);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer: Customer = {
      id: this.currentCustomerId++,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      preferences: customer.preferences || null,
      budgetMin: customer.budgetMin || null,
      budgetMax: customer.budgetMax || null,
      notes: customer.notes || null,
      status: customer.status || "active",
      lastCallDate: customer.lastCallDate || null,
      createdAt: new Date(),
    };
    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...customer };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const newProperty: Property = {
      id: this.currentPropertyId++,
      title: property.title,
      description: property.description || null,
      category: property.category,
      price: property.price,
      location: property.location,
      address: property.address || null,
      latitude: property.latitude || null,
      longitude: property.longitude || null,
      city: property.city || null,
      state: property.state || null,
      pincode: property.pincode || null,
      bedrooms: property.bedrooms || null,
      bathrooms: property.bathrooms || null,
      area: property.area || null,
      ownerName: property.ownerName || null,
      ownerContact: property.ownerContact || null,
      images: property.images || null,
      amenities: property.amenities || null,
      furnishing: property.furnishing || null,
      parking: property.parking || false,
      facing: property.facing || null,
      floor: property.floor || null,
      totalFloors: property.totalFloors || null,
      age: property.age || null,
      status: property.status || "available",
      createdAt: new Date(),
    };
    this.properties.set(newProperty.id, newProperty);
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...property };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Broker operations
  async getBrokers(): Promise<Broker[]> {
    return Array.from(this.brokers.values());
  }

  async getBroker(id: number): Promise<Broker | undefined> {
    return this.brokers.get(id);
  }

  async createBroker(broker: InsertBroker): Promise<Broker> {
    const newBroker: Broker = {
      id: this.currentBrokerId++,
      name: broker.name,
      email: broker.email,
      phone: broker.phone,
      specialization: broker.specialization || null,
      commissionRate: broker.commissionRate || "2.5",
      totalCommission: broker.totalCommission || "0",
      status: broker.status || "active",
      createdAt: new Date(),
    };
    this.brokers.set(newBroker.id, newBroker);
    return newBroker;
  }

  async updateBroker(id: number, broker: Partial<InsertBroker>): Promise<Broker | undefined> {
    const existing = this.brokers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...broker };
    this.brokers.set(id, updated);
    return updated;
  }

  async deleteBroker(id: number): Promise<boolean> {
    return this.brokers.delete(id);
  }

  // Visit operations
  async getVisits(): Promise<VisitWithDetails[]> {
    const visits = Array.from(this.visits.values());
    return visits.map(visit => ({
      ...visit,
      customer: this.customers.get(visit.customerId)!,
      property: this.properties.get(visit.propertyId)!,
      broker: visit.brokerId ? this.brokers.get(visit.brokerId) : undefined,
    }));
  }

  async getVisit(id: number): Promise<VisitWithDetails | undefined> {
    const visit = this.visits.get(id);
    if (!visit) return undefined;
    
    return {
      ...visit,
      customer: this.customers.get(visit.customerId)!,
      property: this.properties.get(visit.propertyId)!,
      broker: visit.brokerId ? this.brokers.get(visit.brokerId) : undefined,
    };
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const newVisit: Visit = {
      id: this.currentVisitId++,
      customerId: visit.customerId,
      propertyId: visit.propertyId,
      brokerId: visit.brokerId || null,
      visitDate: visit.visitDate,
      feedback: visit.feedback || null,
      rating: visit.rating || null,
      notes: visit.notes || null,
      status: visit.status || "completed",
      createdAt: new Date(),
    };
    this.visits.set(newVisit.id, newVisit);
    return newVisit;
  }

  async updateVisit(id: number, visit: Partial<InsertVisit>): Promise<Visit | undefined> {
    const existing = this.visits.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...visit };
    this.visits.set(id, updated);
    return updated;
  }

  async deleteVisit(id: number): Promise<boolean> {
    return this.visits.delete(id);
  }

  // Interaction operations
  async getInteractions(): Promise<InteractionWithDetails[]> {
    const interactions = Array.from(this.interactions.values());
    return interactions.map(interaction => ({
      ...interaction,
      customer: this.customers.get(interaction.customerId)!,
      broker: this.brokers.get(interaction.brokerId)!,
      property: interaction.propertyId ? this.properties.get(interaction.propertyId) : undefined,
    }));
  }

  async getInteraction(id: number): Promise<InteractionWithDetails | undefined> {
    const interaction = this.interactions.get(id);
    if (!interaction) return undefined;
    
    return {
      ...interaction,
      customer: this.customers.get(interaction.customerId)!,
      broker: this.brokers.get(interaction.brokerId)!,
      property: interaction.propertyId ? this.properties.get(interaction.propertyId) : undefined,
    };
  }

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const newInteraction: Interaction = {
      id: this.currentInteractionId++,
      customerId: interaction.customerId,
      brokerId: interaction.brokerId,
      propertyId: interaction.propertyId || null,
      type: interaction.type,
      method: interaction.method,
      description: interaction.description,
      outcome: interaction.outcome,
      followUpRequired: interaction.followUpRequired || false,
      followUpDate: interaction.followUpDate || null,
      priority: interaction.priority || "medium",
      duration: interaction.duration || null,
      customerFeedback: interaction.customerFeedback || null,
      notes: interaction.notes || null,
      status: interaction.status || "completed",
      createdAt: new Date(),
    };
    this.interactions.set(newInteraction.id, newInteraction);
    return newInteraction;
  }

  async updateInteraction(id: number, interaction: Partial<InsertInteraction>): Promise<Interaction | undefined> {
    const existing = this.interactions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...interaction };
    this.interactions.set(id, updated);
    return updated;
  }

  async deleteInteraction(id: number): Promise<boolean> {
    return this.interactions.delete(id);
  }

  // Property Interest operations
  async getPropertyInterests(): Promise<PropertyInterest[]> {
    return Array.from(this.propertyInterests.values());
  }

  async createPropertyInterest(interest: InsertPropertyInterest): Promise<PropertyInterest> {
    const newInterest: PropertyInterest = {
      id: this.currentPropertyInterestId++,
      customerId: interest.customerId,
      propertyId: interest.propertyId,
      interestLevel: interest.interestLevel,
      notes: interest.notes || null,
      createdAt: new Date(),
    };
    this.propertyInterests.set(`${interest.customerId}-${interest.propertyId}`, newInterest);
    return newInterest;
  }

  async deletePropertyInterest(customerId: number, propertyId: number): Promise<boolean> {
    return this.propertyInterests.delete(`${customerId}-${propertyId}`);
  }

  async getDashboardMetrics(): Promise<{
    totalCustomers: number;
    activeProperties: number;
    visitsThisMonth: number;
    totalRevenue: number;
    interactionsThisMonth: number;
    hotLeads: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const visitsThisMonth = Array.from(this.visits.values()).filter(
      visit => visit.visitDate >= startOfMonth
    ).length;
    
    const interactionsThisMonth = Array.from(this.interactions.values()).filter(
      interaction => interaction.createdAt >= startOfMonth
    ).length;
    
    const hotLeads = Array.from(this.customers.values()).filter(
      customer => customer.priority === "hot"
    ).length;

    const totalRevenue = Array.from(this.properties.values())
      .filter(p => p.status === "sold")
      .reduce((sum, p) => sum + parseFloat(p.price || "0"), 0);

    return {
      totalCustomers: this.customers.size,
      activeProperties: Array.from(this.properties.values()).filter(p => p.status === "available").length,
      visitsThisMonth,
      totalRevenue,
      interactionsThisMonth,
      hotLeads,
    };
  }
}

export const storage = new MemStorage();
