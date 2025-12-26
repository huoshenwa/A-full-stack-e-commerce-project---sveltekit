// src/lib/server/db/schema/promotion.ts
import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { products } from './product'; // 导入商品表schema，用于关联促销活动适用商品

/**
 * 促销活动表（promotions）
 * 存储优惠券/满减/买赠等促销活动的核心信息，支持多类型折扣、使用限制、时间范围等规则配置
 * 是电商营销体系的核心表，关联商品表实现「指定商品参与促销」的业务逻辑
 */
export const promotions = pgTable('promotions', {
    /** 促销活动唯一标识（主键）：UUID类型，默认自动生成随机值 */
    id: uuid('id').defaultRandom().primaryKey(),

    /** 促销活动名称（必填）：字符串类型（最长255字符），用于后台展示和用户端提示（如"618全场8折"） */
    name: varchar('name', { length: 255 }).notNull(),
    /** 促销活动描述（可选）：长文本类型，用于详细说明活动规则（如"限移动端使用，不与其他优惠叠加"） */
    description: text('description'),
    /** 优惠券码（可选，唯一）：字符串类型（最长50字符），用户输入该码可领取/使用优惠（如"618VIP888"），unique约束避免重复码 */
    code: varchar('code', { length: 50 }).unique(),

    /**
     * 折扣类型（必填）：字符串类型（最长20字符），限定促销计算方式，支持以下枚举值：
     * - percentage：百分比折扣（如8折=80%）
     * - fixed：固定金额减免（如满100减20）
     * - buy_x_get_y：买X送Y（如买2送1，discountValue存储Y的数量）
     */
    discountType: varchar('discount_type', { length: 20 }).notNull(),
    /** 折扣值（必填）：高精度十进制数（总10位，小数2位），配合discountType使用：
     * - percentage类型：值为80表示8折（80%）
     * - fixed类型：值为20表示减免20元
     * - buy_x_get_y类型：值为1表示买X送1
     */
    discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),

    /** 最低消费金额（可选）：高精度十进制数（总10位，小数2位），满足该金额才可使用优惠（如满100元可用） */
    minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }),
    /** 最大减免金额（可选）：高精度十进制数（总10位，小数2位），限制折扣上限（如8折但最高减50元） */
    maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),

    /** 使用限制-总使用次数（可选）：整数类型，限定该促销活动的总使用次数（如仅限1000次使用），无值则不限制 */
    usageLimit: integer('usage_limit'),
    /** 使用限制-单用户使用次数（必填，默认1）：整数类型，限定单个用户最多使用次数（如每人限用1张） */
    usageLimitPerUser: integer('usage_limit_per_user').default(1).notNull(),
    /** 已使用次数（必填，默认0）：整数类型，记录该促销活动当前已使用的总次数，用于判断是否达到usageLimit */
    usedCount: integer('used_count').default(0).notNull(),

    /** 活动开始时间（必填）：时间戳类型，活动生效的起始时间（如2025-06-01 00:00:00） */
    startAt: timestamp('start_at').notNull(),
    /** 活动结束时间（必填）：时间戳类型，活动失效的截止时间（如2025-06-20 23:59:59） */
    endAt: timestamp('end_at').notNull(),

    /** 活动是否启用（必填，默认true）：布尔类型，控制活动是否生效（true=启用，false=暂停） */
    isActive: boolean('is_active').default(true).notNull(),
    /** 活动创建时间（必填）：时间戳类型，默认当前时间，记录活动创建时间 */
    createdAt: timestamp('created_at').defaultNow().notNull(),
    /** 活动更新时间（必填）：时间戳类型，默认当前时间，记录活动最后修改时间（如调整折扣、时间） */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * 促销活动-商品关联表（promotion_products）
 * 多对多关联表，实现「一个促销活动适用多个商品、一个商品参与多个促销活动」的业务逻辑
 */
export const promotionProducts = pgTable('promotion_products', {
    /** 促销活动ID（必填）：外键关联promotions表，级联删除（活动删除时，关联关系也删除） */
    promotionId: uuid('promotion_id').references(() => promotions.id, { onDelete: 'cascade' }).notNull(),
    /** 商品ID（必填）：外键关联products表，级联删除（商品删除时，关联关系也删除） */
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull()
}, (table) => ([
    /** 复合主键：promotionId + productId
     * 核心作用：保证「一个商品在同一个促销活动中只关联一次」，避免重复配置
     */
    primaryKey({ columns: [table.promotionId, table.productId] })
]));

/**
 * Promotion - 促销活动查询返回类型
 * 从promotions表结构自动推断的类型，包含所有字段，用于查询结果的类型提示
 */
export type Promotion = typeof promotions.$inferSelect;

/**
 * NewPromotion - 促销活动创建传入类型
 * 从promotions表结构自动推断的类型，排除自动生成字段（如id、createdAt），用于创建活动时的参数校验
 */
export type NewPromotion = typeof promotions.$inferInsert;