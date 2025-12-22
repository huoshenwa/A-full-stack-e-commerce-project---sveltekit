// src/lib/server/db/schema/review.ts
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { products } from './product';
import { users } from './user';

export const reviews = pgTable('reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    rating: integer('rating').notNull(), // 1-5
    title: text('title'),
    content: text('content').notNull(),

    // 图片
    images: jsonb('images').$type<string[]>().default([]),

    // 购买验证
    isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),

    // 有用投票
    helpfulCount: integer('helpful_count').default(0).notNull(),

    // 状态
    isApproved: boolean('is_approved').default(false).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const reviewVotes = pgTable('review_votes', {
    id: uuid('id').defaultRandom().primaryKey(),
    reviewId: uuid('review_id').references(() => reviews.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    isHelpful: boolean('is_helpful').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;