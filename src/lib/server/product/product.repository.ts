// src/lib/server/product/product.repository.ts
/**
 * 产品数据访问层（Repository）
 * 负责产品相关的数据库操作，封装所有与products表、productVariants表的交互逻辑
 * 包含产品CRUD、详情查询、筛选分页、库存/评分更新、变体管理等核心功能
 */
import { eq, and, gte, lte, ilike, desc, asc, sql, or } from 'drizzle-orm';
// 数据库连接实例、表schema（产品、分类、用户、产品变体、评论表）
import { db, products, categories, users, productVariants, reviews } from '../db';
// 产品相关类型定义（筛选条件、创建/更新数据结构）
import type { ProductFilter, CreateProductData, UpdateProductData } from './product.types';

/**
 * 产品仓库类
 * 提供产品全生命周期的数据库操作方法，包含基础CRUD、关联查询、统计更新、变体管理等
 */
export class ProductRepository {
    /**
     * 根据ID查询单个产品（仅基础字段）
     * @param id 产品ID
     * @returns 单个产品对象（不存在则返回undefined）
     */
    async findById(id: string) {
        // 1. 从products表查询指定ID的产品
        // 2. 使用eq条件匹配ID，limit 1确保只返回一条结果
        const [product] = await db
            .select() // 查询所有基础字段
            .from(products) // 操作products表
            .where(eq(products.id, id)) // 条件：产品ID匹配
            .limit(1); // 限制结果数量为1

        // 3. 返回查询到的产品对象（无匹配则为undefined）
        return product;
    }

    /**
     * 根据Slug查询单个产品（仅基础字段）
     * @param slug 产品别名（URL友好的唯一标识）
     * @returns 单个产品对象（不存在则返回undefined）
     */
    async findBySlug(slug: string) {
        // 1. 从products表查询指定slug的产品
        // 2. 使用eq条件匹配slug，limit 1确保只返回一条结果
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.slug, slug)) // 条件：产品slug匹配
            .limit(1);

        // 3. 返回查询到的产品对象
        return product;
    }

    /**
     * 根据ID查询产品详情（关联分类、用户信息）
     * @param id 产品ID
     * @returns 包含关联信息的产品详情对象（不存在则返回undefined）
     */
    async findWithDetails(id: string) {
        // 1. 构建关联查询：
        //    - 左连接categories表：关联分类信息
        //    - 左连接users表：关联卖家信息
        //    - 自定义返回字段，整合产品、分类、卖家的核心信息
        const [product] = await db
            .select({
                // 产品基础字段
                id: products.id,
                categoryId: products.categoryId,
                // 关联分类信息
                categoryName: categories.name,
                categorySlug: categories.slug,
                // 关联卖家信息
                sellerId: products.sellerId,
                sellerName: users.displayName,
                // 产品核心字段
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
            // 左连接分类表：产品categoryId = 分类id
            .leftJoin(categories, eq(products.categoryId, categories.id))
            // 左连接用户表：产品sellerId = 用户id
            .leftJoin(users, eq(products.sellerId, users.id))
            .where(eq(products.id, id)) // 条件：产品ID匹配
            .limit(1);

        // 2. 返回包含关联信息的产品详情
        return product;
    }

    /**
     * 多条件筛选查询产品列表（支持分页、排序、关联查询）
     * @param filter 产品筛选条件（分类、卖家、价格、库存、搜索关键词等）
     * @returns 分页后的产品列表数组（包含分类、卖家关联信息）
     */
    async findMany(filter: ProductFilter) {
        // 步骤1：构建筛选条件数组（动态拼接多条件）
        const conditions = [];

        // 条件1：按分类ID筛选
        if (filter.categoryId) {
            conditions.push(eq(products.categoryId, filter.categoryId));
        }

        // 条件2：按卖家ID筛选
        if (filter.sellerId) {
            conditions.push(eq(products.sellerId, filter.sellerId));
        }

        // 条件3：按产品状态筛选
        if (filter.status) {
            conditions.push(eq(products.status, filter.status));
        }

        // 条件4：按发布状态筛选
        if (filter.isPublished !== undefined) {
            conditions.push(eq(products.isPublished, filter.isPublished));
        }

        // 条件5：按最低价格筛选
        if (filter.minPrice) {
            conditions.push(gte(products.price, filter.minPrice.toString()));
        }

        // 条件6：按最高价格筛选
        if (filter.maxPrice) {
            conditions.push(lte(products.price, filter.maxPrice.toString()));
        }

        // 条件7：按库存筛选（仅显示有库存的产品）
        if (filter.inStock) {
            conditions.push(sql`${products.stock} > 0`); // 原生SQL判断库存大于0
        }

        // 条件8：按关键词模糊搜索（名称/描述）
        if (filter.search) {
            conditions.push(
                or(
                    ilike(products.name, `%${filter.search}%`), // 名称模糊匹配
                    ilike(products.description, `%${filter.search}%`) // 描述模糊匹配
                )!
            );
        }

        // 步骤2：构建基础查询（关联分类、卖家，应用筛选条件）
        let query = db
            .select({
                // 自定义返回字段（精简版，适合列表展示）
                id: products.id,
                categoryId: products.categoryId,
                categoryName: categories.name, // 关联分类名称
                sellerId: products.sellerId,
                sellerName: users.displayName, // 关联卖家名称
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
            .leftJoin(categories, eq(products.categoryId, categories.id)) // 关联分类表
            .leftJoin(users, eq(products.sellerId, users.id)) // 关联用户表
            // 应用筛选条件：有条件则用and拼接，无条件则不设置where
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        // 步骤3：应用排序规则
        switch (filter.sortBy) {
            case 'price_asc':
                query = query.orderBy(asc(products.price)); // 价格升序
                break;
            case 'price_desc':
                query = query.orderBy(desc(products.price)); // 价格降序
                break;
            case 'sales_desc':
                query = query.orderBy(desc(products.salesCount)); // 销量降序
                break;
            case 'rating_desc':
                query = query.orderBy(desc(products.rating)); // 评分降序
                break;
            default:
                query = query.orderBy(desc(products.createdAt)); // 默认：创建时间降序
        }

        // 步骤4：应用分页逻辑
        const page = filter.page || 1; // 默认第1页
        const pageSize = filter.pageSize || 20; // 默认每页20条
        query = query
            .limit(pageSize) // 每页条数
            .offset((page - 1) * pageSize); // 计算偏移量（跳过前面的记录）

        // 步骤5：执行查询并返回分页后的产品列表
        return await query;
    }

    /**
     * 创建新产品
     * @param data 产品创建数据（包含CreateProductData字段 + sellerId）
     * @returns 新建的产品对象（包含数据库自动生成的字段如id、createdAt等）
     */
    async create(data: CreateProductData & { sellerId: string }) {
        // 1. 插入数据到products表

        // 核心修复：将业务层的number价格转为string，适配数据库类型
        const insertData = {
            ...data,
            price: data.price.toString(), // number → string
            compareAtPrice: data.compareAtPrice?.toString(), // 可选字段同理
            cost: data.cost?.toString(),
        };
        // 2. 使用returning()返回插入后的完整记录
        const [product] = await db
            .insert(products) // 执行插入操作
            .values(insertData) // 插入的数据对象（包含卖家ID）
            .returning(); // 返回插入后的记录

        // 3. 返回新建的产品对象
        return product;
    }

    /**
     * 更新指定ID的产品
     * @param id 产品ID
     * @param data 要更新的字段（支持部分更新）
     * @returns 更新后的产品对象（不存在则返回undefined）
     */
    async update(id: string, data: UpdateProductData) {
        // 1. 执行更新操作：
        //    - 合并更新数据和updatedAt字段（自动更新修改时间）
        //    - 条件匹配指定ID
        //    - 返回更新后的记录

        const updateData: Record<string, any> = { ...data };
        // 若传入price，将number转为string
        if (updateData.price !== undefined) {
            updateData.price = updateData.price.toString();
        }
        // 若传入compareAtPrice，同理转换
        if (updateData.compareAtPrice !== undefined) {
            updateData.compareAtPrice = updateData.compareAtPrice.toString();
        }
        // 若传入cost，同理转换
        if (updateData.cost !== undefined) {
            updateData.cost = updateData.cost.toString();
        }
        const [product] = await db
            .update(products) // 执行更新操作
            .set({
                ...updateData, // 传入的更新字段
                updatedAt: new Date() // 强制更新修改时间
            })
            .where(eq(products.id, id)) // 条件：产品ID匹配
            .returning(); // 返回更新后的记录

        // 2. 返回更新后的产品对象
        return product;
    }

    /**
     * 删除指定ID的产品
     * @param id 产品ID
     * @returns 无返回值（执行删除操作）
     */
    async delete(id: string) {
        // 1. 执行删除操作：条件匹配指定产品ID
        await db
            .delete(products) // 执行删除操作
            .where(eq(products.id, id)); // 条件：产品ID匹配

        // 2. 无返回值（删除成功无数据返回）
    }

    /**
     * 增加产品的浏览次数（原子操作）
     * @param id 产品ID
     * @returns 无返回值（仅执行更新操作）
     */
    async incrementViewCount(id: string) {
        // 1. 执行原子更新：viewCount字段自增1
        //    - 使用sql模板字符串确保原子性，避免并发问题
        await db
            .update(products)
            .set({ viewCount: sql`${products.viewCount} + 1` }) // 浏览次数+1
            .where(eq(products.id, id)); // 条件：产品ID匹配
    }

    /**
     * 更新产品库存（支持增减）
     * @param id 产品ID
     * @param quantity 库存变动量（正数增加，负数减少）
     * @returns 无返回值（仅执行更新操作）
     */
    async updateStock(id: string, quantity: number) {
        // 1. 执行库存更新：
        //    - 库存字段 += 传入的数量（支持增减）
        //    - 同步更新updatedAt字段
        await db
            .update(products)
            .set({
                stock: sql`${products.stock} + ${quantity}`, // 库存变动
                updatedAt: new Date() // 更新修改时间
            })
            .where(eq(products.id, id)); // 条件：产品ID匹配
    }

    /**
     * 更新产品的评分和评论数（基于已发布的评论数据）
     * @param productId 产品ID
     * @returns 无返回值（仅执行统计和更新操作）
     */
    async updateRating(productId: string) {
        // 步骤1：统计该产品已发布评论的平均分和总数
        const result = await db
            .select({
                avgRating: sql<number>`AVG(${reviews.rating})`, // 计算评分平均值
                count: sql<number>`COUNT(*)` // 统计评论数量
            })
            .from(reviews) // 操作评论表
            .where(
                and(
                    eq(reviews.productId, productId), // 条件1：关联当前产品
                    eq(reviews.isPublished, true) // 条件2：仅已发布的评论
                )
            )
            .groupBy(reviews.productId); // 按产品ID分组统计

        // 步骤2：若有评论数据，则更新产品的评分和评论数
        if (result.length > 0) {
            await db
                .update(products)
                .set({
                    rating: result[0].avgRating.toFixed(2), // 平均分保留2位小数
                    reviewCount: result[0].count // 更新评论总数
                })
                .where(eq(products.id, productId)); // 条件：产品ID匹配
        }
    }

    /**
     * 查询指定产品的所有变体
     * @param productId 产品ID
     * @returns 产品变体列表数组
     */
    async findVariants(productId: string) {
        // 1. 从productVariants表查询指定产品的所有变体
        // 2. 按productId匹配，返回所有结果
        return await db
            .select() // 查询变体所有字段
            .from(productVariants) // 操作产品变体表
            .where(eq(productVariants.productId, productId)); // 条件：关联当前产品
    }

    /**
     * 创建产品变体
     * @param data 变体创建数据（包含产品ID、名称、SKU、属性、价格、库存等）
     * @returns 新建的变体对象（包含数据库自动生成的字段如id、createdAt等）
     */
    async createVariant(data: {
        productId: string;
        name: string;
        sku: string;
        attributes: Record<string, any>;
        price: number;
        stock: number;
        image?: string;
    }) {
        // 1. 插入数据到productVariants表
        const insertData = {
            ...data,
            price: data.price.toString(), // number → string
        };
        // 2. 使用returning()返回插入后的完整记录
        const [variant] = await db
            .insert(productVariants) // 执行插入操作
            .values(insertData) // 插入的变体数据
            .returning(); // 返回插入后的记录

        // 3. 返回新建的变体对象
        return variant;
    }

    /**
     * 更新指定ID的产品变体
     * @param id 变体ID
     * @param data 要更新的字段（价格、库存、是否活跃）
     * @returns 更新后的变体对象（不存在则返回undefined）
     */
    async updateVariant(id: string, data: Partial<{
        price: number;
        stock: number;
        isActive: boolean;
    }>) {
        // 1. 执行变体更新操作：
        //    - 合并更新数据和updatedAt字段
        //    - 条件匹配变体ID
        //    - 返回更新后的记录
        const updateData: Record<string, any> = { ...data };
        // 若传入price，将number转为string
        if (updateData.price !== undefined) {
            updateData.price = updateData.price.toString();
        }
        const [variant] = await db
            .update(productVariants) // 执行更新操作
            .set({
                ...updateData, // 传入的更新字段
                updatedAt: new Date() // 强制更新修改时间
            })
            .where(eq(productVariants.id, id)) // 条件：变体ID匹配
            .returning(); // 返回更新后的记录

        // 2. 返回更新后的变体对象
        return variant;
    }
}

/**
 * 产品仓库实例化导出
 * 供业务层直接使用，无需重复创建实例
 */
export const productRepository = new ProductRepository();