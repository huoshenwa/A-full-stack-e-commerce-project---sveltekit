/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/server/db/schema/product.ts
import { pgTable, uuid, varchar, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './user'; // 导入用户表schema，用于关联商家ID

/**
 * 分类表（categories）
 * 存储商品分类信息，支持树形结构（父子分类）
 */
export const categories = pgTable('categories', {
    // 分类唯一标识：UUID类型，默认自动生成随机值，作为主键
    id: uuid('id').defaultRandom().primaryKey(),
    // 分类名称：字符串类型（最长100字符），必填，用于展示（如"电子产品"）
    name: varchar('name', { length: 100 }).notNull(),
    // 分类URL标识符：字符串类型（最长100字符），唯一且必填，用于URL路径（如"electronics"）
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    // 分类描述：长文本类型，可选，用于详细说明分类含义
    description: text('description'),
    // 父分类ID：关联当前分类的父分类，级联删除（父分类删除时，子分类也删除），支持树形结构
    parentId: uuid('parent_id').references((): any => categories.id, { onDelete: 'cascade' }),
    // 分类图片URL：字符串类型（最长500字符），可选，用于分类列表展示图片
    imageUrl: varchar('image_url', { length: 500 }),
    // 排序序号：整数类型，默认0，必填，用于控制分类展示顺序（值越小越靠前）
    sortOrder: integer('sort_order').default(0).notNull(),
    // 是否活跃：布尔类型，默认true，必填，控制分类是否对外展示（true=展示，false=隐藏）
    isActive: boolean('is_active').default(true).notNull(),
    // 创建时间：时间戳类型，默认当前时间，必填，记录分类创建时间
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // 更新时间：时间戳类型，默认当前时间，必填，记录分类最后修改时间（更新时自动刷新）
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * 商品表（products）
 * 存储商品核心信息，关联分类、商家，包含基础信息、价格、库存等核心字段
 */
export const products = pgTable('products', {
    // 商品唯一标识：UUID类型，默认自动生成随机值，作为主键
    id: uuid('id').defaultRandom().primaryKey(),
    // 分类ID：关联商品所属分类，父分类删除时设为null（商品保留，仅解除分类关联）
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    // 商家ID：关联商品所属商家（用户表），级联删除（商家账号删除时，商品也删除），必填
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    // 基础信息区域
    // 商品名称：字符串类型（最长255字符），必填，用于商品展示（如"iPhone 15 Pro"）
    name: varchar('name', { length: 255 }).notNull(),
    // 商品URL标识符：字符串类型（最长255字符），唯一且必填，用于商品详情页URL（如"iphone-15-pro"）
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    // 商品详细描述：长文本类型，可选，支持Markdown，用于商品详情页展示完整介绍
    description: text('description'),
    // 商品简短描述：字符串类型（最长500字符），可选，用于商品列表页展示简介
    shortDescription: varchar('short_description', { length: 500 }),

    // 价格区域
    // 销售价格：高精度十进制数（总10位，小数2位），必填，商品实际售价（如7999.00元）
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    // 划线价（原价）：高精度十进制数（总10位，小数2位），可选，用于展示优惠力度（如8999.00元）
    compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
    // 成本价：高精度十进制数（总10位，小数2位），可选，仅商家可见，用于核算利润
    cost: decimal('cost', { precision: 10, scale: 2 }),

    // 库存区域
    // 商品SKU：字符串类型（最长100字符），唯一，库存单位标识符（如"IP15PRO-128GB-BLACK"）
    sku: varchar('sku', { length: 100 }).unique(),
    // 库存数量：整数类型，默认0，必填，当前商品可用库存数量
    stock: integer('stock').default(0).notNull(),
    // 低库存预警阈值：整数类型，默认10，必填，库存低于该值时触发预警（如库存≤10时提示补货）
    lowStockThreshold: integer('low_stock_threshold').default(10).notNull(),

    // 商品属性区域（灵活扩展）
    // 商品属性：JSONB类型，关联TS类型约束，支持动态扩展（不同商品可设置不同属性）
    attributes: jsonb('attributes').$type<{
        brand?: string; // 品牌（如"Apple"）
        color?: string[]; // 颜色选项（如["黑色", "白色"]）
        size?: string[]; // 尺寸选项（如["S", "M", "L"]）
        weight?: number; // 重量（如187g）
        dimensions?: { length: number; width: number; height: number }; // 长宽高（如手机尺寸）
        material?: string; // 材质（如"钛金属"）
        [key: string]: any; // 允许自定义其他属性（如"processor": "A17 Pro"）
    }>(),

    // 图片区域
    // 商品图片URL列表：JSONB类型，约束为字符串数组，默认空数组，存储商品多图URL（主图+详情图）
    images: jsonb('images').$type<string[]>().default([]),

    // 状态区域
    // 商品状态：字符串类型（最长20字符），默认"draft"（草稿），必填，可选值：draft(草稿)/active(上架)/archived(归档)
    status: varchar('status', { length: 20 }).default('draft').notNull(),
    // 是否发布：布尔类型，默认false，必填，控制商品是否对外展示（true=已发布，false=未发布）
    isPublished: boolean('is_published').default(false).notNull(),
    // 发布时间：时间戳类型，可选，记录商品首次发布的时间
    publishedAt: timestamp('published_at'),

    // SEO优化区域
    // SEO标题：字符串类型（最长255字符），可选，用于网页标题（提升搜索排名）
    metaTitle: varchar('meta_title', { length: 255 }),
    // SEO描述：长文本类型，可选，用于搜索引擎结果页描述（提升点击率）
    metaDescription: text('meta_description'),
    // SEO关键词：字符串类型（最长500字符），可选，用于搜索引擎关键词匹配（如"iPhone,苹果手机"）
    metaKeywords: varchar('meta_keywords', { length: 500 }),

    // 统计区域
    // 浏览次数：整数类型，默认0，必填，记录商品被浏览的总次数（详情页访问一次+1）
    viewCount: integer('view_count').default(0).notNull(),
    // 销量：整数类型，默认0，必填，记录商品累计销售数量
    salesCount: integer('sales_count').default(0).notNull(),
    // 平均评分：高精度十进制数（总3位，小数2位），默认0，必填，记录商品平均评分（0-5分）
    rating: decimal('rating', { precision: 3, scale: 2 }).default('0').notNull(),
    // 评论数量：整数类型，默认0，必填，记录商品有效评论的总数量
    reviewCount: integer('review_count').default(0).notNull(),

    // 时间戳区域
    // 创建时间：时间戳类型，默认当前时间，必填，记录商品创建时间
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // 更新时间：时间戳类型，默认当前时间，必填，记录商品最后修改时间（更新时自动刷新）
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * 商品变体表（product_variants）
 * 存储同一商品的不同规格（如颜色、尺寸组合），关联主商品表
 */
export const productVariants = pgTable('product_variants', {
    // 变体唯一标识：UUID类型，默认自动生成随机值，作为主键
    id: uuid('id').defaultRandom().primaryKey(),
    // 关联主商品ID：关联商品表，级联删除（主商品删除时，变体也删除），必填
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),

    // 变体名称：字符串类型（最长255字符），必填，明确区分变体（如"黑色-128GB"）
    name: varchar('name', { length: 255 }).notNull(),
    // 变体SKU：字符串类型（最长100字符），唯一且必填，变体专属库存标识符（如"IP15PRO-BLACK-128"）
    sku: varchar('sku', { length: 100 }).unique().notNull(),

    // 变体属性区域
    // 变体属性：JSONB类型，关联TS类型约束，必填，存储变体的具体规格（如颜色、尺寸）
    attributes: jsonb('attributes').$type<{
        color?: string; // 变体颜色（如"黑色"）
        size?: string; // 变体尺寸（如"128GB"）
        [key: string]: any; // 允许自定义其他变体属性（如"storage": "128GB"）
    }>().notNull(),

    // 价格和库存区域
    // 变体销售价格：高精度十进制数（总10位，小数2位），必填，变体实际售价（可与主商品价格不同）
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    // 变体划线价：高精度十进制数（总10位，小数2位），可选，变体原价（用于展示优惠）
    compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
    // 变体库存数量：整数类型，默认0，必填，当前变体的可用库存数量
    stock: integer('stock').default(0).notNull(),

    // 变体图片：字符串类型（最长500字符），可选，变体专属展示图片（无则使用主商品图片）
    image: varchar('image', { length: 500 }),

    // 变体状态：布尔类型，默认true，必填，控制变体是否可用（true=可购买，false=下架）
    isActive: boolean('is_active').default(true).notNull(),
    // 创建时间：时间戳类型，默认当前时间，必填，记录变体创建时间
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // 更新时间：时间戳类型，默认当前时间，必填，记录变体最后修改时间（更新时自动刷新）
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * 类型推断：从表结构自动生成查询返回类型（包含所有字段）
 */
// 分类查询返回类型（对应categories表所有字段）
export type Category = typeof categories.$inferSelect;
// 分类创建传入类型（对应categories表可插入字段，排除自动生成的字段如id、createdAt）
export type NewCategory = typeof categories.$inferInsert;
// 商品查询返回类型（对应products表所有字段）
export type Product = typeof products.$inferSelect;
// 商品创建传入类型（对应products表可插入字段，排除自动生成的字段如id、createdAt）
export type NewProduct = typeof products.$inferInsert;
// 商品变体查询返回类型（对应productVariants表所有字段）
export type ProductVariant = typeof productVariants.$inferSelect;
// 商品变体创建传入类型（对应productVariants表可插入字段，排除自动生成的字段如id、createdAt）
export type NewProductVariant = typeof productVariants.$inferInsert;