import { db } from './client';
import { brokers, type InsertBroker } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getAllBrokers() {
  return db.select().from(brokers);
}

export async function createBroker(data: InsertBroker) {
  const [result] = await db.insert(brokers).values(data).returning();
  return result;
}

export async function getBrokerById(id: number) {
  return db.query.brokers.findFirst({ where: eq(brokers.id, id) });
}

export async function updateBroker(id: number, data: any) {
  return db.update(brokers).set(data).where(eq(brokers.id, id)).returning();
} 

export async function deleteBroker(id: number) {
  return db.delete(brokers).where(eq(brokers.id, id));
}
