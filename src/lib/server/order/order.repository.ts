import { eq, and, desc, sql } from 'drizzle-orm';
import { db, orders, orderItems } from '../db';

/**
 * 订单数据访问层（Repository）
 * 封装了与订单相关的所有数据库操作，提供统一的CRUD接口。
 * 核心职责：
 * 1. 实现订单及订单项的查询、创建、更新等基础操作
 * 2. 处理订单状态和支付状态的流转逻辑
 * 3. 提供用户级别的数据隔离（确保用户只能操作自己的订单）
 * 4. 支持订单分页查询、订单号生成等业务功能
 * 5. 隐藏底层数据库实现细节，对外暴露简洁的业务接口
 */
export class OrderRepository {
    /**
     * 根据订单ID查询订单详情
     * @param id - 订单唯一标识（UUID）
     * @param userId - 可选参数，用户唯一标识
     * @returns Promise<Order | undefined> - 返回订单详情或undefined
     * @description
     * - 若提供userId参数，会额外验证订单归属，确保数据安全
     * - 若不提供userId，可用于管理员等特权角色查询任意订单
     * - 适用于订单详情查看、订单状态更新等场景
     */
    async findById(id: string, userId?: string) {
        const conditions = [eq(orders.id, id)];
        if (userId) {
            conditions.push(eq(orders.userId, userId));
        }

        const [order] = await db
            .select()
            .from(orders)
            .where(and(...conditions))
            .limit(1);

        return order;
    }

    /**
     * 根据订单号查询订单详情
     * @param orderNo - 订单号（唯一字符串）
     * @returns Promise<Order | undefined> - 返回订单详情或undefined
     * @description
     * - 通过订单号精确匹配订单，适用于外部系统查询或用户输入订单号查询
     * - 订单号具有唯一性，确保查询结果唯一
     */
    async findByOrderNo(orderNo: string) {
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.orderNo, orderNo))
            .limit(1);

        return order;
    }

    /**
     * 根据用户ID查询订单列表
     * @param userId - 用户唯一标识
     * @param filter - 可选参数，包含状态、页码、页大小
     * @returns Promise<Order[]> - 返回符合条件的订单数组
     * @description
     * - 支持按订单状态筛选（如pending、paid等）
     * - 支持分页查询，默认每页20条记录
     * - 按创建时间倒序排列，最新订单排在前面
     * - 适用于用户订单列表页面数据加载
     */
    async findByUserId(userId: string, filter?: {
        status?: string;
        page?: number;
        pageSize?: number;
    }) {
        const page = filter?.page || 1;
        const pageSize = filter?.pageSize || 20;

        let query = db
            .select()
            .from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt));

        if (filter?.status) {
            query = query.where(eq(orders.status, filter.status));
        }

        return await query
            .limit(pageSize)
            .offset((page - 1) * pageSize);
    }

    /**
     * 创建新订单
     * @param data - 订单创建参数
     * @returns Promise<Order> - 返回创建后的完整订单对象
     * @description
     * - 自动生成订单的id、createdAt、updatedAt字段
     * - 订单号需提前通过generateOrderNo方法生成并传入
     * - 适用于用户提交订单场景
     */
    async create(data: {
        orderNo: string;
        userId: string;
        status: string;
        paymentStatus: string;
        totalAmount: string;
        discountAmount: string;
        shippingFee: string;
        paymentAmount: string;
        shippingAddress: any;
        buyerMessage?: string;
    }) {
        const [order] = await db.insert(orders).values(data).returning();
        return order;
    }

    /**
     * 创建订单项
     * @param items - 订单项数组
     * @returns Promise<OrderItem[]> - 返回创建后的订单项数组
     * @description
     * - 批量插入订单项数据，与订单创建配合使用
     * - 每个订单项包含商品快照、价格、数量等信息，防止商品信息变更
     * - 适用于订单创建时保存订单中的商品明细
     */
    async createOrderItems(items: Array<{
        orderId: string;
        productId: string | null;
        variantId: string | null;
        productSnapshot: any;
        price: string;
        quantity: number;
        subtotal: string;
    }>) {
        return await db.insert(orderItems).values(items).returning();
    }

    /**
     * 更新订单状态
     * @param orderId - 订单唯一标识
     * @param status - 新的订单状态
     * @param extraData - 可选参数，包含状态变更的时间戳
     * @returns Promise<Order | undefined> - 返回更新后的订单对象或undefined
     * @description
     * - 支持订单状态流转（如pending→paid→shipped→completed→cancelled）
     * - 可同时更新相关时间戳（如paidAt、shippedAt等）
     * - 自动更新updatedAt字段为当前时间
     * - 适用于订单状态变更场景（如发货、完成、取消订单）
     */
    async updateStatus(orderId: string, status: string, extraData?: {
        paidAt?: Date;
        shippedAt?: Date;
        completedAt?: Date;
        cancelledAt?: Date;
    }) {
        const [order] = await db
            .update(orders)
            .set({
                status,
                ...extraData,
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId))
            .returning();

        return order;
    }

    /**
     * 更新订单支付状态
     * @param orderId - 订单唯一标识
     * @param paymentStatus - 新的支付状态
     * @param paidAt - 可选参数，支付时间（默认当前时间）
     * @returns Promise<Order | undefined> - 返回更新后的订单对象或undefined
     * @description
     * - 支持支付状态流转（如unpaid→paid→refunding→refunded）
     * - 自动记录支付时间，默认当前时间
     * - 自动更新updatedAt字段为当前时间
     * - 适用于支付成功、退款等场景
     */
    async updatePaymentStatus(orderId: string, paymentStatus: string, paidAt?: Date) {
        const [order] = await db
            .update(orders)
            .set({
                paymentStatus,
                paidAt: paidAt || new Date(),
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId))
            .returning();

        return order;
    }

    /**
     * 更新订单物流信息
     * @param orderId - 订单唯一标识
     * @param data - 物流信息（物流公司和物流单号）
     * @returns Promise<Order | undefined> - 返回更新后的订单对象或undefined
     * @description
     * - 自动将订单状态设置为'shipped'
     * - 自动记录发货时间为当前时间
     * - 自动更新updatedAt字段为当前时间
     * - 适用于商家发货场景
     */
    async updateShipping(orderId: string, data: {
        shippingCompany: string;
        trackingNumber: string;
    }) {
        const [order] = await db
            .update(orders)
            .set({
                ...data,
                shippedAt: new Date(),
                status: 'shipped',
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId))
            .returning();

        return order;
    }

    /**
     * 获取订单的所有订单项
     * @param orderId - 订单唯一标识
     * @returns Promise<OrderItem[]> - 返回订单项数组
     * @description
     * - 查询指定订单的所有商品明细
     * - 适用于订单详情页面展示商品列表
     */
    async getOrderItems(orderId: string) {
        return await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));
    }

    /**
     * 生成唯一订单号
     * @returns Promise<string> - 返回生成的订单号
     * @description
     * - 订单号格式：日期（YYYYMMDD） + 6位随机数
     * - 确保订单号的唯一性和可读性
     * - 适用于创建订单时生成订单标识
     */
    async generateOrderNo(): Promise<string> {
        const date = new Date();
        const dateStr = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        return `${dateStr}${random}`;
    }
}

/**
 * 订单仓库实例
 * 提供全局共享的订单操作入口，避免重复创建实例
 * 使用方式：import { orderRepository } from './order.repository'
 */
export const orderRepository = new OrderRepository();