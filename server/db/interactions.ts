import { db } from './client';
import { InsertInteraction, interactions,  } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getAllInteractions() {
  return db.select().from(interactions);
}

export async function getInteractionById(id: number) {
  return db.query.interactions.findFirst({ where: eq(interactions.id, id) });
}

export async function createInteraction(data: InsertInteraction) {
  const [result] = await db.insert(interactions).values(data).returning();
  return result;
}

export async function updateInteraction(id: number, data: any) {
  return db.update(interactions).set(data).where(eq(interactions.id, id)).returning();
} 

export async function deleteInteraction(id: number) {
  return db.delete(interactions).where(eq(interactions.id, id));
}
