// src/lib/server/db/schema/product.ts
import { pgTable, uuid, varchar, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './user';

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    description: text('description'),
    parentId: uuid('parent_id').references((): any => categories.id, { onDelete: 'cascade' }),
    imageUrl: varchar('image_url', { length: 500 }),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    // 基础信息
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    description: text('description'),
    shortDescription: varchar('short_description', { length: 500 }),

    // 价格
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }), // 划线价
    cost: decimal('cost', { precision: 10, scale: 2 }), // 成本价（仅商家可见）

    // 库存
    sku: varchar('sku', { length: 100 }).unique(),
    stock: integer('stock').default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(10).notNull(),

    // 商品属性（灵活扩展）
    attributes: jsonb('attributes').$type<{
        brand?: string;
        color?: string[];
        size?: string[];
        weight?: number;
        dimensions?: { length: number; width: number; height: number };
        material?: string;
        [key: string]: any;
    }>(),

    // 图片
    images: jsonb('images').$type<string[]>().default([]),

    // 状态
    status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, active, archived
    isPublished: boolean('is_published').default(false).notNull(),
    publishedAt: timestamp('published_at'),

    // SEO
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    metaKeywords: varchar('meta_keywords', { length: 500 }),

    // 统计
    viewCount: integer('view_count').default(0).notNull(),
    salesCount: integer('sales_count').default(0).notNull(),
    rating: decimal('rating', { precision: 3, scale: 2 }).default('0').notNull(),
    reviewCount: integer('review_count').default(0).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const productVariants = pgTable('product_variants', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),

    name: varchar('name', { length: 255 }).notNull(), // 例如："红色-L"
    sku: varchar('sku', { length: 100 }).unique().notNull(),

    // 变体属性
    attributes: jsonb('attributes').$type<{
        color?: string;
        size?: string;
        [key: string]: any;
    }>().notNull(),

    // 价格和库存
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
    stock: integer('stock').default(0).notNull(),

    image: varchar('image', { length: 500 }),

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;