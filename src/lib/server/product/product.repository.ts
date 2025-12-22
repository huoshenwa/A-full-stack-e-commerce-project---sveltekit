// src/lib/server/product/product.repository.ts
import { eq, and, gte, lte, ilike, desc, asc, sql, or } from 'drizzle-orm';
import { db, products, categories, users, productVariants, reviews } from '../db';
import type { ProductFilter, CreateProductData, UpdateProductData } from './product.types';

export class ProductRepository {
    async findById(id: string) {
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, id))
            .limit(1);
        return product;
    }

    async findBySlug(slug: string) {
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.slug, slug))
            .limit(1);
        return product;
    }

    async findWithDetails(id: string) {
        const [product] = await db
            .select({
                id: products.id,
                categoryId: products.categoryId,
                categoryName: categories.name,
                categorySlug: categories.slug,
                sellerId: products.sellerId,
                sellerName: users.displayName,
                name: products.name,
                slug: products.slug,
                description: products.description,
                shortDescription: products.shortDescription,
                price: products.price,
                compareAtPrice: products.compareAtPrice,
                sku: products.sku,
                stock: products.stock,
                images: products.images,
                attributes: products.attributes,
                status: products.status,
                isPublished: products.isPublished,
                rating: products.rating,
                reviewCount: products.reviewCount,
                salesCount: products.salesCount,
                viewCount: products.viewCount,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(users, eq(products.sellerId, users.id))
            .where(eq(products.id, id))
            .limit(1);

        return product;
    }

    async findMany(filter: ProductFilter) {
        const conditions = [];

        if (filter.categoryId) {
            conditions.push(eq(products.categoryId, filter.categoryId));
        }

        if (filter.sellerId) {
            conditions.push(eq(products.sellerId, filter.sellerId));
        }

        if (filter.status) {
            conditions.push(eq(products.status, filter.status));
        }

        if (filter.isPublished !== undefined) {
            conditions.push(eq(products.isPublished, filter.isPublished));
        }

        if (filter.minPrice) {
            conditions.push(gte(products.price, filter.minPrice.toString()));
        }

        if (filter.maxPrice) {
            conditions.push(lte(products.price, filter.maxPrice.toString()));
        }

        if (filter.inStock) {
            conditions.push(sql`${products.stock} > 0`);
        }

        if (filter.search) {
            conditions.push(
                or(
                    ilike(products.name, `%${filter.search}%`),
                    ilike(products.description, `%${filter.search}%`)
                )!
            );
        }

        let query = db
            .select({
                id: products.id,
                categoryId: products.categoryId,
                categoryName: categories.name,
                sellerId: products.sellerId,
                sellerName: users.displayName,
                name: products.name,
                slug: products.slug,
                shortDescription: products.shortDescription,
                price: products.price,
                compareAtPrice: products.compareAtPrice,
                stock: products.stock,
                images: products.images,
                status: products.status,
                isPublished: products.isPublished,
                rating: products.rating,
                reviewCount: products.reviewCount,
                salesCount: products.salesCount,
                createdAt: products.createdAt
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(users, eq(products.sellerId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        // 排序
        switch (filter.sortBy) {
            case 'price_asc':
                query = query.orderBy(asc(products.price));
                break;
            case 'price_desc':
                query = query.orderBy(desc(products.price));
                break;
            case 'sales_desc':
                query = query.orderBy(desc(products.salesCount));
                break;
            case 'rating_desc':
                query = query.orderBy(desc(products.rating));
                break;
            default:
                query = query.orderBy(desc(products.createdAt));
        }

        // 分页
        const page = filter.page || 1;
        const pageSize = filter.pageSize || 20;
        query = query.limit(pageSize).offset((page - 1) * pageSize);

        return await query;
    }

    async create(data: CreateProductData & { sellerId: string }) {
        const [product] = await db.insert(products).values(data).returning();
        return product;
    }

    async update(id: string, data: UpdateProductData) {
        const [product] = await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();
        return product;
    }

    async delete(id: string) {
        await db.delete(products).where(eq(products.id, id));
    }

    async incrementViewCount(id: string) {
        await db
            .update(products)
            .set({ viewCount: sql`${products.viewCount} + 1` })
            .where(eq(products.id, id));
    }

    async updateStock(id: string, quantity: number) {
        await db
            .update(products)
            .set({
                stock: sql`${products.stock} + ${quantity}`,
                updatedAt: new Date()
            })
            .where(eq(products.id, id));
    }

    async updateRating(productId: string) {
        const result = await db
            .select({
                avgRating: sql<number>`AVG(${reviews.rating})`,
                count: sql<number>`COUNT(*)`
            })
            .from(reviews)
            .where(and(eq(reviews.productId, productId), eq(reviews.isPublished, true)))
            .groupBy(reviews.productId);

        if (result.length > 0) {
            await db
                .update(products)
                .set({
                    rating: result[0].avgRating.toFixed(2),
                    reviewCount: result[0].count
                })
                .where(eq(products.id, productId));
        }
    }

    async findVariants(productId: string) {
        return await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, productId));
    }

    async createVariant(data: {
        productId: string;
        name: string;
        sku: string;
        attributes: Record<string, any>;
        price: number;
        stock: number;
        image?: string;
    }) {
        const [variant] = await db.insert(productVariants).values(data).returning();
        return variant;
    }

    async updateVariant(id: string, data: Partial<{
        price: number;
        stock: number;
        isActive: boolean;
    }>) {
        const [variant] = await db
            .update(productVariants)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(productVariants.id, id))
            .returning();
        return variant;
    }
}

export const productRepository = new ProductRepository();