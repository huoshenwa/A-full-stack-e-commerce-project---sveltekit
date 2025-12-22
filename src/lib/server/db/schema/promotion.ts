// src/lib/server/db/schema/promotion.ts
import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { products } from './product';

export const promotions = pgTable('promotions', {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    code: varchar('code', { length: 50 }).unique(), // 优惠券码

    // 折扣类型
    discountType: varchar('discount_type', { length: 20 }).notNull(), // percentage, fixed, buy_x_get_y
    discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),

    // 最低消费
    minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }),
    maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),

    // 使用限制
    usageLimit: integer('usage_limit'), // 总使用次数限制
    usageLimitPerUser: integer('usage_limit_per_user').default(1).notNull(),
    usedCount: integer('used_count').default(0).notNull(),

    // 时间限制
    startAt: timestamp('start_at').notNull(),
    endAt: timestamp('end_at').notNull(),

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const promotionProducts = pgTable('promotion_products', {
    promotionId: uuid('promotion_id').references(() => promotions.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull()
}, (table) => ({
    pk: primaryKey({ columns: [table.promotionId, table.productId] })
}));

export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;