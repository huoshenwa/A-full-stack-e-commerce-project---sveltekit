import { eq, and, sql } from 'drizzle-orm';
import { db, cartItems, products, productVariants } from '../db';

/**
 * 购物车数据访问层（Repository）
 * 封装了与用户购物车相关的所有数据库操作，提供统一的CRUD接口。
 * 核心职责：
 * 1. 实现购物车项的查询、添加、更新、删除等基础操作
 * 2. 处理购物车项与商品、商品变体的关联查询
 * 3. 提供用户级别的数据隔离（确保用户只能操作自己的购物车）
 * 4. 支持购物车项的选择状态管理和批量操作
 * 5. 隐藏底层数据库实现细节，对外暴露简洁的业务接口
 */
export class CartRepository {
    /**
     * 根据用户ID查询购物车所有商品
     * @param userId - 用户唯一标识（UUID）
     * @returns Promise<CartItemWithDetails[]> - 返回包含商品和变体详细信息的购物车项数组
     * @description 
     * - 联表查询购物车项、商品表和商品变体表，获取完整的商品信息
     * - 包含商品名称、价格、库存、图片等关键信息，便于前端展示
     * - 按创建时间排序，先加入购物车的商品排在前面
     * - 适用于购物车页面数据加载
     */
    async findByUserId(userId: string) {
        return await db
            .select({
                id: cartItems.id,
                productId: cartItems.productId,
                variantId: cartItems.variantId,
                quantity: cartItems.quantity,
                isSelected: cartItems.isSelected,
                createdAt: cartItems.createdAt,
                // 商品信息
                productName: products.name,
                productSlug: products.slug,
                productPrice: products.price,
                productStock: products.stock,
                productImages: products.images,
                productIsPublished: products.isPublished,
                // 变体信息
                variantName: productVariants.name,
                variantPrice: productVariants.price,
                variantStock: productVariants.stock,
                variantAttributes: productVariants.attributes
            })
            .from(cartItems)
            .leftJoin(products, eq(cartItems.productId, products.id))
            .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
            .where(eq(cartItems.userId, userId))
            .orderBy(cartItems.createdAt);
    }

    /**
     * 根据商品ID和变体ID查询购物车项
     * @param userId - 用户唯一标识
     * @param productId - 商品唯一标识
     * @param variantId - 可选参数，商品变体唯一标识
     * @returns Promise<CartItem | undefined> - 返回购物车项或undefined
     * @description
     * - 用于检查用户购物车中是否已存在某个商品（或变体）
     * - 若提供variantId，精确匹配该商品变体；若不提供，匹配无变体的商品
     * - 适用于添加商品到购物车时的重复性检查
     */
    async findByProductId(userId: string, productId: string, variantId?: string) {
        const conditions = [
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId)
        ];

        if (variantId) {
            conditions.push(eq(cartItems.variantId, variantId));
        } else {
            conditions.push(sql`${cartItems.variantId} IS NULL`);
        }

        const [item] = await db
            .select()
            .from(cartItems)
            .where(and(...conditions))
            .limit(1);

        return item;
    }

    /**
     * 添加商品到购物车
     * @param data - 购物车项添加参数
     * @returns Promise<CartItem> - 返回添加或更新后的购物车项
     * @description
     * - 自动处理重复添加逻辑：若商品已在购物车中，增加数量；否则新增购物车项
     * - 支持添加带变体或不带变体的商品
     * - 适用于用户将商品加入购物车场景
     */
    async add(data: {
        userId: string;
        productId: string;
        variantId?: string;
        quantity: number;
    }) {
        // 检查商品是否已在购物车中
        const existing = await this.findByProductId(
            data.userId,
            data.productId,
            data.variantId
        );

        if (existing) {
            // 已存在则更新数量
            const [updated] = await db
                .update(cartItems)
                .set({
                    quantity: existing.quantity + data.quantity,
                    updatedAt: new Date()
                })
                .where(eq(cartItems.id, existing.id))
                .returning();

            return updated;
        } else {
            // 不存在则新增购物车项
            const [item] = await db
                .insert(cartItems)
                .values(data)
                .returning();

            return item;
        }
    }

    /**
     * 更新购物车项数量
     * @param id - 购物车项唯一标识
     * @param userId - 用户唯一标识
     * @param quantity - 新的商品数量
     * @returns Promise<CartItem | undefined> - 返回更新后的购物车项或undefined
     * @description
     * - 强制验证购物车项归属（userId必须匹配），防止越权操作
     * - 自动更新updatedAt字段为当前时间
     * - 适用于用户修改购物车中商品数量场景
     */
    async updateQuantity(id: string, userId: string, quantity: number) {
        const [item] = await db
            .update(cartItems)
            .set({ quantity, updatedAt: new Date() })
            .where(and(
                eq(cartItems.id, id),
                eq(cartItems.userId, userId)
            ))
            .returning();

        return item;
    }

    /**
     * 切换购物车项选择状态
     * @param id - 购物车项唯一标识
     * @param userId - 用户唯一标识
     * @param isSelected - 新的选择状态（true/false）
     * @returns Promise<CartItem | undefined> - 返回更新后的购物车项或undefined
     * @description
     * - 用于标记购物车项是否被选中，影响结算时的商品列表
     * - 强制验证购物车项归属，防止越权操作
     * - 适用于购物车页面勾选/取消勾选商品场景
     */
    async toggleSelected(id: string, userId: string, isSelected: boolean) {
        const [item] = await db
            .update(cartItems)
            .set({ isSelected, updatedAt: new Date() })
            .where(and(
                eq(cartItems.id, id),
                eq(cartItems.userId, userId)
            ))
            .returning();

        return item;
    }

    /**
     * 从购物车中移除单个商品
     * @param id - 购物车项唯一标识
     * @param userId - 用户唯一标识
     * @returns Promise<void>
     * @description
     * - 强制验证购物车项归属，防止越权删除
     * - 无返回值，删除成功即完成操作
     * - 适用于用户删除购物车中某个商品场景
     */
    async remove(id: string, userId: string) {
        await db
            .delete(cartItems)
            .where(and(
                eq(cartItems.id, id),
                eq(cartItems.userId, userId)
            ));
    }

    /**
     * 清空用户购物车
     * @param userId - 用户唯一标识
     * @returns Promise<void>
     * @description
     * - 删除该用户的所有购物车项
     * - 适用于用户结算完成后清空购物车场景
     */
    async clear(userId: string) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
    }

    /**
     * 获取用户已选中的购物车项
     * @param userId - 用户唯一标识
     * @returns Promise<CartItem[]> - 返回已选中的购物车项数组
     * @description
     * - 查询条件：userId匹配且isSelected为true
     * - 适用于结算页面加载需要购买的商品列表
     */
    async getSelectedItems(userId: string) {
        return await db
            .select()
            .from(cartItems)
            .where(and(
                eq(cartItems.userId, userId),
                eq(cartItems.isSelected, true)
            ));
    }

    /**
     * 获取用户购物车商品总数
     * @param userId - 用户唯一标识
     * @returns Promise<number> - 返回购物车商品总数量
     * @description
     * - 统计该用户购物车中的所有商品项数量（不区分是否选中）
     * - 适用于展示购物车图标上的数量提示
     */
    async getCount(userId: string) {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(cartItems)
            .where(eq(cartItems.userId, userId));

        return Number(result[0]?.count || 0);
    }
}

/**
 * 购物车仓库实例
 * 提供全局共享的购物车操作入口，避免重复创建实例
 * 使用方式：import { cartRepository } from './cart.repository'
 */
export const cartRepository = new CartRepository();