import { pgTable, uuid, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user';
import { products, productVariants } from './product';

/**
 * 购物车项表（cart_items）
 * 用于存储用户购物车中的商品条目信息，实现用户购物车的持久化管理。
 * 支持用户将商品及其变体加入购物车，并记录数量、选择状态等关键信息。
 * 表设计遵循以下原则：
 * 1. 与用户、商品、商品变体强关联，确保数据一致性。
 * 2. 支持商品或变体删除时的级联操作，防止数据孤立。
 * 3. 记录创建和更新时间，便于追踪购物车状态变化。
 */
export const cartItems = pgTable('cart_items', {
    /**
     * 购物车项唯一标识（必填）
     * 使用UUID作为主键，默认生成随机值，确保全局唯一性。
     * 用于唯一标识每一个购物车中的商品条目。
     */
    id: uuid('id').defaultRandom().primaryKey(),

    /**
     * 所属用户ID（必填）
     * 外键关联用户表（users）的id字段，级联删除。
     * 表示该购物车项属于哪个用户，确保用户只能访问自己的购物车数据。
     * 用户删除时，其所有购物车项也会被自动删除。
     */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    /**
     * 商品ID（必填）
     * 外键关联商品表（products）的id字段，级联删除。
     * 表示购物车项对应的商品。
     * 商品删除时，其在所有用户购物车中的对应项也会被自动删除。
     */
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),

    /**
     * 商品变体ID（可选）
     * 外键关联商品变体表（productVariants）的id字段，级联删除。
     * 表示购物车项对应的商品变体（如颜色、尺寸等）。
     * 变体删除时，其在所有用户购物车中的对应项也会被自动删除。
     * 若商品无变体，则该字段可为null。
     */
    variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),

    /**
     * 商品数量（必填）
     * 整数类型，默认值为1。
     * 表示用户在购物车中添加的该商品（或变体）的数量。
     * 数量必须大于0，确保购物车项的有效性。
     */
    quantity: integer('quantity').notNull().default(1),

    /**
     * 是否选中（用于结算）（必填）
     * 布尔类型，默认值为true。
     * 标识该购物车项是否被用户选中，用于结算时确定需要购买的商品。
     * 用户可以在购物车页面勾选或取消勾选该商品。
     */
    isSelected: boolean('is_selected').default(true).notNull(),

    /**
     * 记录创建时间（必填）
     * 默认值为当前时间，记录购物车项被添加的时间。
     * 用于追踪用户添加商品到购物车的历史记录。
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /**
     * 记录更新时间（必填）
     * 默认值为当前时间，记录购物车项最后一次更新的时间。
     * 用于追踪用户修改购物车项（如数量、选择状态）的历史记录。
     */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * CartItem - 查询返回类型
 * 从cartItems表结构自动推断的类型，包含所有字段，用于查询结果的类型提示。
 * 确保在获取购物车项数据时，TypeScript能够提供准确的类型检查和自动补全。
 */
export type CartItem = typeof cartItems.$inferSelect;

/**
 * NewCartItem - 插入数据类型
 * 从cartItems表结构自动推断的类型，用于插入新购物车项时的类型提示。
 * 确保在添加新购物车项时，TypeScript能够提供准确的类型检查和自动补全。
 * 注意：该类型不包含id、createdAt和updatedAt字段，因为这些字段会在插入时自动生成。
 */
export type NewCartItem = typeof cartItems.$inferInsert;