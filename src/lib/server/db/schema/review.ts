// src/lib/server/db/schema/review.ts
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { products } from './product'; // 导入商品表schema，关联评论所属商品
import { users } from './user';       // 导入用户表schema，关联评论发布用户

/**
 * 商品评论表（reviews）
 * 存储用户对商品的评价信息，包含评分、文字内容、图片等核心数据，
 * 支持评论审核、购买验证、有用投票等电商评论场景的核心功能
 */
export const reviews = pgTable('reviews', {
    /** 评论唯一标识（主键）：UUID类型，默认自动生成随机值 */
    id: uuid('id').defaultRandom().primaryKey(),

    /** 关联商品ID（必填）：外键关联products表，级联删除（商品删除时，关联评论也删除）
     * 核心作用：绑定评论到具体商品，实现「商品-评论」的一对多关联
     */
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),

    /** 评论发布用户ID（必填）：外键关联users表，级联删除（用户删除时，关联评论也删除）
     * 核心作用：绑定评论到具体用户，实现「用户-评论」的一对多关联，防止匿名乱评论
     */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    /** 评分（必填）：整数类型，取值范围1-5分，对应商品星级评分（如5=五星好评，1=一星差评） */
    rating: integer('rating').notNull(),

    /** 评论标题（可选）：长文本类型，用于概括评论核心观点（如"电池续航超预期"） */
    title: text('title'),

    /** 评论正文内容（必填）：长文本类型，用户对商品的详细评价描述 */
    content: text('content').notNull(),

    /** 评论配图（可选）：JSONB类型，约束为字符串数组，默认空数组
     * 存储用户上传的评论图片URL，支持多张配图展示，适配电商评论晒图场景
     */
    images: jsonb('images').$type<string[]>().default([]),

    /** 购买验证标识（必填，默认false）：布尔类型
     * true=该用户实际购买过此商品（已验证订单），false=未验证购买
     * 核心作用：区分「真实购买评论」和「非购买评论」，提升评论可信度
     */
    isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),

    /** 有用投票数（必填，默认0）：整数类型
     * 记录其他用户对该评论的“有用”投票总数，用于排序优质评论（如“有10人觉得有用”）
     */
    helpfulCount: integer('helpful_count').default(0).notNull(),

    /** 审核状态（必填，默认false）：布尔类型
     * true=评论已通过平台审核，false=待审核/审核未通过
     * 核心作用：防止违规评论展示，需管理员/系统审核后才可视
     */
    isApproved: boolean('is_approved').default(false).notNull(),

    /** 发布状态（必填，默认false）：布尔类型
     * true=评论对外公开展示，false=隐藏（未审核/违规/用户删除）
     * 关联逻辑：通常isApproved=true时，isPublished才会设为true
     */
    isPublished: boolean('is_published').default(false).notNull(),

    /** 评论创建时间（必填）：时间戳类型，默认当前时间，记录评论发布时间 */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /** 评论更新时间（必填）：时间戳类型，默认当前时间，记录评论最后修改/审核时间 */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * 评论投票表（review_votes）
 * 存储用户对评论的“有用/无用”投票记录，实现「评论有用性投票」功能，
 * 保证同一用户对同一评论只能投一次票（需业务层约束）
 */
export const reviewVotes = pgTable('review_votes', {
    /** 投票记录唯一标识（主键）：UUID类型，默认自动生成随机值 */
    id: uuid('id').defaultRandom().primaryKey(),

    /** 关联评论ID（必填）：外键关联reviews表，级联删除（评论删除时，投票记录也删除） */
    reviewId: uuid('review_id').references(() => reviews.id, { onDelete: 'cascade' }).notNull(),

    /** 投票用户ID（必填）：外键关联users表，级联删除（用户删除时，投票记录也删除） */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    /** 投票类型（必填）：布尔类型
     * true=认为该评论“有用”，false=认为该评论“无用”
     * 核心作用：统计评论的有用性，辅助排序优质评论
     */
    isHelpful: boolean('is_helpful').notNull(),

    /** 投票创建时间（必填）：时间戳类型，默认当前时间，记录投票时间 */
    createdAt: timestamp('created_at').defaultNow().notNull()
});

/**
 * Review - 评论查询返回类型
 * 从reviews表结构自动推断的类型，包含所有字段，用于查询评论结果的类型提示
 */
export type Review = typeof reviews.$inferSelect;

/**
 * NewReview - 评论创建传入类型
 * 从reviews表结构自动推断的类型，排除自动生成字段（如id、createdAt），用于创建评论时的参数校验
 */
export type NewReview = typeof reviews.$inferInsert;