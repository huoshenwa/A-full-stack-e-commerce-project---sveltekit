// src/lib/server/product/category.repository.ts
import { eq, isNull, sql } from 'drizzle-orm';
import { db, categories } from '../db';

export class CategoryRepository {
    async findById(id: string) {
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);
        return category;
    }

    async findBySlug(slug: string) {
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, slug))
            .limit(1);
        return category;
    }

    async findAll(includeInactive = false) {
        const conditions = includeInactive ? undefined : eq(categories.isActive, true);

        return await db
            .select()
            .from(categories)
            .where(conditions)
            .orderBy(categories.sortOrder, categories.name);
    }

    async findRootCategories() {
        return await db
            .select()
            .from(categories)
            .where(isNull(categories.parentId))
            .orderBy(categories.sortOrder);
    }

    async findChildren(parentId: string) {
        return await db
            .select()
            .from(categories)
            .where(eq(categories.parentId, parentId))
            .orderBy(categories.sortOrder);
    }

    async findTree() {
        // 获取所有分类
        const allCategories = await this.findAll();

        // 构建树形结构
        const categoryMap = new Map();
        const roots: any[] = [];

        allCategories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        allCategories.forEach(cat => {
            const node = categoryMap.get(cat.id);
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    async create(data: {
        name: string;
        slug: string;
        description?: string;
        parentId?: string;
        imageUrl?: string;
        sortOrder?: number;
    }) {
        const [category] = await db.insert(categories).values(data).returning();
        return category;
    }

    async update(id: string, data: Partial<{
        name: string;
        slug: string;
        description: string;
        parentId: string;
        imageUrl: string;
        sortOrder: number;
        isActive: boolean;
    }>) {
        const [category] = await db
            .update(categories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(categories.id, id))
            .returning();
        return category;
    }

    async delete(id: string) {
        await db.delete(categories).where(eq(categories.id, id));
    }

    async getProductCount(categoryId: string) {
        const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE category_id = ${categoryId}
    `);
        return Number(result.rows[0]?.count || 0);
    }
}

export const categoryRepository = new CategoryRepository();