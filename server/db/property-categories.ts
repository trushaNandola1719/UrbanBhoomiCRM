import { db } from './client';
import { propertCategories, propertSubCategories } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getAllCategories() {
  return db.select().from(propertCategories);
}

export async function getAllSubCategoriesofCat(id: number) {
  return db.query.propertSubCategories.findMany({
    where: eq(propertSubCategories.categoryId, id),
    with: {
        category: true
    } 
  })
}

export async function getCategoryById(id: number) {
  return db.query.propertCategories.findFirst({ where: eq(propertCategories.id, id) });
}

export async function getSubCategoryById(id: number) {
  return db.query.propertSubCategories.findFirst({ 
    where: eq(propertSubCategories.id, id), 
    with: {
        category: true
    } 
 });
}