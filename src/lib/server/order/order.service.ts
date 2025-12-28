import { db } from '../db';
import { orderRepository } from './order.repository';
import { cartRepository } from '../cart/cart.repository';
import { productRepository } from '../product/product.repository';
import { addressRepository } from '../address/address.repository';

/**
 * 订单业务错误类（OrderError）
 * 用于定义订单处理过程中可能出现的业务异常，包含错误消息、错误代码和HTTP状态码。
 * 继承自原生Error类，便于统一错误处理和区分不同类型的错误。
 */
export class OrderError extends Error {
    constructor(message: string, public code: string, public statusCode: number = 400) {
        super(message);
        this.name = 'OrderError';
    }

    /** 订单未找到错误 */
    static NotFound = new OrderError('Order not found', 'ORDER_NOT_FOUND', 404);
    /** 库存不足错误 */
    static InsufficientStock = new OrderError('Insufficient stock', 'INSUFFICIENT_STOCK', 400);
    /** 无效地址错误 */
    static InvalidAddress = new OrderError('Invalid address', 'INVALID_ADDRESS', 400);
    /** 购物车为空错误 */
    static EmptyCart = new OrderError('Cart is empty', 'EMPTY_CART', 400);
}

/**
 * 订单业务服务层（OrderService）
 * 封装了订单相关的核心业务逻辑，包括从购物车创建订单、取消订单、支付成功处理、发货、确认收货等。
 * 核心职责：
 * 1. 实现订单全生命周期的业务流程控制
 * 2. 处理订单创建时的库存检查、金额计算、事务管理等复杂逻辑
 * 3. 协调多个Repository（订单、购物车、商品、地址）完成业务操作
 * 4. 统一处理业务异常，返回标准化的错误信息
 * 5. 提供简洁的业务接口供上层控制器调用
 */
export class OrderService {
    /**
     * 从购物车创建订单（核心逻辑，使用事务保证原子性）
     * @param userId - 用户唯一标识
     * @param data - 订单创建参数（收货地址ID、买家留言）
     * @returns Promise<Order> - 返回创建后的订单对象
     * @throws {OrderError} - 可能抛出无效地址、购物车为空、商品不可用、库存不足等错误
     * @description
     * - 完整的订单创建流程：验证地址→获取购物车选中商品→开启事务→检查商品状态和库存→计算金额→生成订单号→创建订单和订单项→扣减库存→清空购物车选中商品
     * - 使用数据库事务确保所有操作要么全部成功，要么全部失败，避免数据不一致
     * - 自动处理商品变体和主商品的库存扣减逻辑
     * - 支持运费计算（满99免运费）和优惠金额（暂未实现）
     */
    async createOrderFromCart(userId: string, data: {
        addressId: string;
        buyerMessage?: string;
    }) {
        // 1. 验证收货地址
        const address = await addressRepository.findById(data.addressId, userId);
        if (!address) {
            throw OrderError.InvalidAddress;
        }

        // 2. 获取购物车已选中商品
        const cartItemsData = await cartRepository.findByUserId(userId);
        const selectedItems = cartItemsData.filter(item => item.isSelected);

        if (selectedItems.length === 0) {
            throw OrderError.EmptyCart;
        }

        // 3. 开启数据库事务，确保订单创建的原子性
        return await db.transaction(async (tx) => {
            // 3.1 检查商品状态和库存，并计算订单总金额
            let totalAmount = 0;
            const orderItemsData: any[] = [];

            for (const item of selectedItems) {
                // 使用变体价格和库存（如果有变体），否则使用商品价格和库存
                const price = item.variantPrice || item.productPrice;
                const stock = item.variantStock ?? item.productStock;

                // 检查商品是否可用（价格和库存必须存在）
                if (!price || stock === null) {
                    throw new OrderError(
                        `Product ${item.productName} is unavailable`,
                        'PRODUCT_UNAVAILABLE',
                        400
                    );
                }

                // 检查库存是否充足
                if (stock < item.quantity) {
                    throw new OrderError(
                        `Insufficient stock for ${item.productName}`,
                        'INSUFFICIENT_STOCK',
                        400
                    );
                }

                // 检查商品是否已下架
                if (!item.productIsPublished) {
                    throw new OrderError(
                        `Product ${item.productName} is no longer available`,
                        'PRODUCT_UNAVAILABLE',
                        400
                    );
                }

                // 计算商品小计和订单总金额
                const priceNum = parseFloat(price);
                const subtotal = priceNum * item.quantity;
                totalAmount += subtotal;

                // 构建订单项数据（包含商品快照，防止商品信息变更）
                orderItemsData.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    productSnapshot: {
                        name: item.productName,
                        slug: item.productSlug,
                        image: item.productImages?.[0] || '',
                        sku: item.variantName || '',
                        variantName: item.variantName,
                        attributes: item.variantAttributes
                    },
                    price: price,
                    quantity: item.quantity,
                    subtotal: subtotal.toFixed(2)
                });
            }

            // 3.2 计算运费和优惠金额（简化处理）
            const shippingFee = totalAmount >= 99 ? 0 : 10; // 满99元免运费
            const discountAmount = 0; // 暂不处理优惠券
            const paymentAmount = totalAmount + shippingFee - discountAmount;

            // 3.3 生成唯一订单号
            const orderNo = await orderRepository.generateOrderNo();

            // 3.4 创建订单主记录
            const order = await orderRepository.create({
                orderNo,
                userId,
                status: 'pending', // 初始状态：待付款
                paymentStatus: 'unpaid', // 初始支付状态：未付款
                totalAmount: totalAmount.toFixed(2),
                discountAmount: discountAmount.toFixed(2),
                shippingFee: shippingFee.toFixed(2),
                paymentAmount: paymentAmount.toFixed(2),
                shippingAddress: {
                    receiverName: address.receiverName,
                    receiverPhone: address.receiverPhone,
                    province: address.province,
                    city: address.city,
                    district: address.district,
                    street: address.street,
                    detailAddress: address.detailAddress,
                    postalCode: address.postalCode
                },
                buyerMessage: data.buyerMessage
            });

            // 3.5 创建订单项记录
            const orderItemsWithOrderId = orderItemsData.map(item => ({
                ...item,
                orderId: order.id
            }));
            await orderRepository.createOrderItems(orderItemsWithOrderId);

            // 3.6 扣减商品库存（关键操作）
            for (const item of selectedItems) {
                if (item.variantId) {
                    // 有变体则扣减变体库存
                    await productRepository.updateVariant(item.variantId, {
                        stock: (item.variantStock ?? 0) - item.quantity
                    });
                } else {
                    // 无变体则扣减商品库存
                    await productRepository.updateStock(item.productId, -item.quantity);
                }
            }

            // 3.7 清空购物车中已选中的商品
            for (const item of selectedItems) {
                await cartRepository.remove(item.id, userId);
            }

            // 3.8 返回创建成功的订单对象
            return order;
        });
    }

    /**
     * 取消订单（恢复库存）
     * @param orderId - 订单唯一标识
     * @param userId - 用户唯一标识
     * @returns Promise<Order> - 返回更新后的订单对象
     * @throws {OrderError} - 可能抛出订单未找到、订单状态不允许取消等错误
     * @description
     * - 仅允许取消状态为'pending'（待付款）的订单
     * - 使用事务确保库存恢复和订单状态更新的原子性
     * - 自动恢复商品或变体的库存数量
     * - 更新订单状态为'cancelled'并记录取消时间
     */
    async cancelOrder(orderId: string, userId: string) {
        // 1. 查找订单并验证归属
        const order = await orderRepository.findById(orderId, userId);
        if (!order) {
            throw OrderError.NotFound;
        }

        // 2. 检查订单状态是否允许取消
        if (order.status !== 'pending') {
            throw new OrderError('Order cannot be cancelled', 'INVALID_STATUS', 400);
        }

        // 3. 开启事务恢复库存并更新订单状态
        return await db.transaction(async (tx) => {
            // 3.1 获取订单中的所有商品
            const items = await orderRepository.getOrderItems(orderId);

            // 3.2 恢复商品库存
            for (const item of items) {
                if (item.variantId) {
                    // 恢复变体库存
                    const variant = await productRepository.findById(item.productId!);
                    if (variant) {
                        await productRepository.updateVariant(item.variantId, {
                            stock: (variant.stock || 0) + item.quantity
                        });
                    }
                } else if (item.productId) {
                    // 恢复商品库存
                    await productRepository.updateStock(item.productId, item.quantity);
                }
            }

            // 3.3 更新订单状态为已取消
            return await orderRepository.updateStatus(orderId, 'cancelled', {
                cancelledAt: new Date()
            });
        });
    }

    /**
     * 支付成功回调处理
     * @param orderNo - 订单号
     * @returns Promise<Order> - 返回更新后的订单对象
     * @throws {OrderError} - 可能抛出订单未找到错误
     * @description
     * - 处理支付成功后的订单状态更新逻辑
     * - 支持幂等处理，避免重复支付
     * - 同时更新支付状态为'paid'和订单状态为'paid'
     * - 记录支付时间为当前时间
     */
    async handlePaymentSuccess(orderNo: string) {
        // 1. 根据订单号查找订单
        const order = await orderRepository.findByOrderNo(orderNo);
        if (!order) {
            throw OrderError.NotFound;
        }

        // 2. 幂等处理：如果已支付则直接返回
        if (order.paymentStatus === 'paid') {
            return order;
        }

        // 3. 更新支付状态和订单状态
        await orderRepository.updatePaymentStatus(order.id, 'paid', new Date());
        return await orderRepository.updateStatus(order.id, 'paid', {
            paidAt: new Date()
        });
    }

    /**
     * 商家发货操作
     * @param orderId - 订单唯一标识
     * @param sellerId - 商家唯一标识（TODO: 待实现商家验证逻辑）
     * @param data - 物流信息（物流公司和物流单号）
     * @returns Promise<Order> - 返回更新后的订单对象
     * @throws {OrderError} - 可能抛出订单未找到、订单状态不允许发货等错误
     * @description
     * - 仅允许发货状态为'paid'（已付款）的订单
     * - 自动更新订单状态为'shipped'
     * - 记录发货时间为当前时间
     * - 保存物流公司和物流单号信息
     * - TODO: 需补充商家权限验证逻辑，确保只有订单所属商家可以发货
     */
    async shipOrder(orderId: string, sellerId: string, data: {
        shippingCompany: string;
        trackingNumber: string;
    }) {
        // 1. 查找订单
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw OrderError.NotFound;
        }

        // TODO: 检查商家是否有权限操作该订单（需关联商品和商家信息）

        // 2. 检查订单状态是否允许发货
        if (order.status !== 'paid') {
            throw new OrderError('Order must be paid before shipping', 'INVALID_STATUS', 400);
        }

        // 3. 更新物流信息和订单状态
        return await orderRepository.updateShipping(orderId, data);
    }

    /**
     * 用户确认收货操作
     * @param orderId - 订单唯一标识
     * @param userId - 用户唯一标识
     * @returns Promise<Order> - 返回更新后的订单对象
     * @throws {OrderError} - 可能抛出订单未找到、订单状态不允许确认收货等错误
     * @description
     * - 仅允许确认收货状态为'shipped'（已发货）的订单
     * - 自动更新订单状态为'completed'
     * - 记录完成时间为当前时间
     * - 确认收货后订单生命周期结束
     */
    async completeOrder(orderId: string, userId: string) {
        // 1. 查找订单并验证归属
        const order = await orderRepository.findById(orderId, userId);
        if (!order) {
            throw OrderError.NotFound;
        }

        // 2. 检查订单状态是否允许确认收货
        if (order.status !== 'shipped') {
            throw new OrderError('Order must be shipped before completion', 'INVALID_STATUS', 400);
        }

        // 3. 更新订单状态为已完成
        return await orderRepository.updateStatus(orderId, 'completed', {
            completedAt: new Date()
        });
    }

    /**
     * 获取订单详情（包含订单项）
     * @param orderId - 订单唯一标识
     * @param userId - 用户唯一标识
     * @returns Promise<OrderWithItems> - 返回包含订单项的订单详情
     * @throws {OrderError} - 可能抛出订单未找到错误
     * @description
     * - 查询订单主信息和关联的订单项信息
     * - 确保用户只能查看自己的订单
     * - 返回结构化的订单详情数据，便于前端展示
     */
    async getOrderDetail(orderId: string, userId: string) {
        // 1. 查找订单并验证归属
        const order = await orderRepository.findById(orderId, userId);
        if (!order) {
            throw OrderError.NotFound;
        }

        // 2. 获取订单中的所有商品
        const items = await orderRepository.getOrderItems(orderId);

        // 3. 返回包含订单项的订单详情
        return {
            ...order,
            items
        };
    }

    /**
     * 获取用户订单列表
     * @param userId - 用户唯一标识
     * @param filter - 可选参数（订单状态、页码、页大小）
     * @returns Promise<Order[]> - 返回用户的订单列表
     * @description
     * - 支持按订单状态筛选（如pending、paid、shipped等）
     * - 支持分页查询，默认每页20条记录
     * - 按创建时间倒序排列，最新订单排在前面
     * - 适用于用户订单列表页面数据加载
     */
    async getUserOrders(userId: string, filter?: {
        status?: string;
        page?: number;
        pageSize?: number;
    }) {
        return await orderRepository.findByUserId(userId, filter);
    }
}

/**
 * 订单服务实例
 * 提供全局共享的订单业务操作入口，避免重复创建实例
 * 使用方式：import { orderService } from './order.service'
 */
export const orderService = new OrderService();