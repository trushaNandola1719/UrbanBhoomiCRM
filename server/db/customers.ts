import { db } from './client';
import { customers, type InsertCustomer, insertCustomerSchema  } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getAllCustomers() {
  return db.select().from(customers);
}

export async function getCustomerById(id: number) {
  return db.query.customers.findFirst({
    where: eq(customers.id, id),
  });
}

export async function createCustomer(data: InsertCustomer) {
  const [result] = await db.insert(customers).values(data).returning();
  return result;
}

export async function updateCustomer(id: number, data: any) {
  return db.update(customers).set(data).where(eq(customers.id, id)).returning();
} 

export async function deleteCustomer(id: number) {
  return db.delete(customers).where(eq(customers.id, id));
}
