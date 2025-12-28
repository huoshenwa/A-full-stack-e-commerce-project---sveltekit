import { pgTable, uuid, varchar, text, decimal, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './user';
import { products, productVariants } from './product';

/**
 * 订单表（orders）
 * 用于存储用户的订单信息，包括订单状态、支付状态、金额、收货地址等。
 * 与用户表、商品表和商品变体表有关联。
 */
export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    /**
     * 订单号（必填）
     * 唯一字符串，用于外部展示和订单查询，最长50字符。
     */
    orderNo: varchar('order_no', { length: 50 }).unique().notNull(),
    /**
     * 所属用户ID（必填）
     * 外键关联用户表的id字段，用户删除时设置为null。
     * 表示该订单属于哪个用户。
     */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }).notNull(),

    /**
     * 订单状态（必填）
     * 字符串类型，默认值为'pending'。
     * 状态流转：pending(待付款) → paid(已付款) → shipped(已发货) → completed(已完成) → cancelled(已取消)
     */
    status: varchar('status', { length: 20 }).notNull().default('pending'),

    /**
     * 支付状态（必填）
     * 字符串类型，默认值为'unpaid'。
     * 状态流转：unpaid(未付款) → paid(已付款) → refunding(退款中) → refunded(已退款)
     */
    paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('unpaid'),

    /**
     * 总金额（必填）
     * 精确到小数点后两位，包含商品总价、运费等。
     */
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),

    /**
     * 优惠金额（必填）
     * 精确到小数点后两位，默认值为0。
     * 包括优惠券、满减等优惠。
     */
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(),

    /**
     * 运费（必填）
     * 精确到小数点后两位，默认值为0。
     */
    shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).default('0').notNull(),

    /**
     * 实付金额（必填）
     * 精确到小数点后两位，即用户实际支付的金额。
     */
    paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }).notNull(),

    /**
     * 收货地址（必填）
     * JSONB类型，存储地址的完整信息，防止地址被删除后订单信息丢失。
     * 包含收货人姓名、电话、省市区、详细地址、邮编等。
     */
    shippingAddress: jsonb('shipping_address').$type<{
        receiverName: string;
        receiverPhone: string;
        province: string;
        city: string;
        district: string;
        street: string;
        detailAddress: string;
        postalCode?: string;
    }>().notNull(),

    /**
     * 物流公司（可选）
     * 字符串类型，最长50字符，记录配送的物流公司名称。
     */
    shippingCompany: varchar('shipping_company', { length: 50 }),

    /**
     * 物流单号（可选）
     * 字符串类型，最长100字符，用于查询物流状态。
     */
    trackingNumber: varchar('tracking_number', { length: 100 }),

    /**
     * 买家留言（可选）
     * 文本类型，记录买家在下单时的备注信息。
     */
    buyerMessage: text('buyer_message'),

    /**
     * 卖家备注（可选）
     * 文本类型，记录卖家对订单的备注信息。
     */
    sellerNote: text('seller_note'),

    /**
     * 支付时间（可选）
     * 时间戳类型，记录用户支付订单的时间。
     */
    paidAt: timestamp('paid_at'),

    /**
     * 发货时间（可选）
     * 时间戳类型，记录订单发货的时间。
     */
    shippedAt: timestamp('shipped_at'),

    /**
     * 完成时间（可选）
     * 时间戳类型，记录订单完成的时间。
     */
    completedAt: timestamp('completed_at'),

    /**
     * 取消时间（可选）
     * 时间戳类型，记录订单取消的时间。
     */
    cancelledAt: timestamp('cancelled_at'),

    /**
     * 记录创建时间（必填）
     * 默认值为当前时间，记录订单创建的时间。
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /**
     * 记录更新时间（必填）
     * 默认值为当前时间，记录订单最后更新的时间。
     */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * 订单项表（order_items）
 * 用于存储订单中的商品信息，包括商品快照、价格、数量等。
 * 与订单表、商品表和商品变体表有关联。
 */
export const orderItems = pgTable('order_items', {
    /**
     * 订单项唯一标识（必填）
     * 使用UUID作为主键，默认生成随机值，确保全局唯一性。
     */
    id: uuid('id').defaultRandom().primaryKey(),

    /**
     * 所属订单ID（必填）
     * 外键关联订单表的id字段，级联删除。
     * 表示该订单项属于哪个订单。
     */
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),

    /**
     * 商品ID（可选）
     * 外键关联商品表的id字段，商品删除时设置为null。
     * 记录订单项对应的商品。
     */
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),

    /**
     * 商品变体ID（可选）
     * 外键关联商品变体表的id字段，变体删除时设置为null。
     * 记录订单项对应的商品变体。
     */
    variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

    /**
     * 商品信息快照（必填）
     * JSONB类型，存储下单时的商品信息，防止商品信息变更后订单数据不一致。
     * 包含商品名称、slug、图片、SKU等。
     */
    productSnapshot: jsonb('product_snapshot').$type<{
        name: string;
        slug: string;
        image: string;
        sku?: string;
    }>().notNull(),

    /**
     * 商品单价（必填）
     * 精确到小数点后两位，记录下单时的商品单价。
     */
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),

    /**
     * 商品数量（必填）
     * 整数类型，记录订单项中商品的数量。
     */
    quantity: integer('quantity').notNull(),

    /**
     * 小计金额（必填）
     * 精确到小数点后两位，等于price * quantity。
     */
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),

    /**
     * 记录创建时间（必填）
     * 默认值为当前时间，记录订单项创建的时间。
     */
    createdAt: timestamp('created_at').defaultNow().notNull()
});

/**
 * Order - 查询返回类型
 * 从orders表结构自动推断的类型，包含所有字段，用于查询结果的类型提示。
 */
export type Order = typeof orders.$inferSelect;

/**
 * NewOrder - 插入数据类型
 * 从orders表结构自动推断的类型，用于插入新订单时的类型提示。
 */
export type NewOrder = typeof orders.$inferInsert;

/**
 * OrderItem - 查询返回类型
 * 从orderItems表结构自动推断的类型，包含所有字段，用于查询结果的类型提示。
 */
export type OrderItem = typeof orderItems.$inferSelect;

/**
 * NewOrderItem - 插入数据类型
 * 从orderItems表结构自动推断的类型，用于插入新订单项时的类型提示。
 */
export type NewOrderItem = typeof orderItems.$inferInsert;