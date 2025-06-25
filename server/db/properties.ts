import { db } from './client';
import { properties, type InsertProperty } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getAllProperties() {
  return db.select().from(properties);
}

export async function getPropertyById(id: number) {
  return db.query.properties.findFirst({ where: eq(properties.id, id) });
}

export async function createProperty(data: InsertProperty) {
  const [result] = await db.insert(properties).values(data).returning();
  return result;
}

export async function updateProperty(id: number, data: any) {
  return db.update(properties).set(data).where(eq(properties.id, id)).returning();
} 

export async function deleteProperty(id: number) {
  return db.delete(properties).where(eq(properties.id, id));
}
