import { json } from '@sveltejs/kit';
import { orderService, OrderError } from '$lib/server/order/order.service';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 获取用户订单列表 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含订单列表的 JSON 响应
 * @description
 * - 接口路径: `GET /api/orders`
 * - 权限: 需要用户登录 (通过 `requireAuth` 验证)
 * - 请求参数:
 *   - `status` (可选): 订单状态筛选 (如 pending, paid, shipped 等)
 *   - `page` (可选): 页码，默认 1
 *   - `pageSize` (可选): 每页条数，默认 20
 * - 响应数据: { orders: Order[] }
 * - 错误处理: 捕获异常并返回对应状态码及错误信息
 */
export const GET: RequestHandler = async ({ url, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 从 URL 查询参数中获取筛选条件和分页参数
        const status = url.searchParams.get('status') || undefined;
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

        // 调用订单服务获取用户订单列表
        const orders = await orderService.getUserOrders(locals.user.id, {
            status,
            page,
            pageSize
        });

        // 返回订单列表数据
        return json({ orders });
    } catch (err: any) {
        // 错误处理：返回错误信息和对应的 HTTP 状态码
        return json({ error: err.message }, { status: err.statusCode || 500 });
    }
};

/**
 * 创建订单 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含新创建订单的 JSON 响应
 * @description
 * - 接口路径: `POST /api/orders`
 * - 权限: 需要用户登录
 * - 请求体: { addressId: string; buyerMessage?: string }
 * - 响应数据: { order: Order } (201 Created)
 * - 错误处理:
 *   - 400: 缺少地址ID
 *   - 404: 订单未找到
 *   - 500: 服务器内部错误
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 解析请求体数据
        const { addressId, buyerMessage } = await request.json();

        // 验证必填字段
        if (!addressId) {
            return json({ error: 'Address ID is required' }, { status: 400 });
        }

        // 调用订单服务从购物车创建订单
        const order = await orderService.createOrderFromCart(locals.user.id, {
            addressId,
            buyerMessage
        });

        // 返回新创建的订单数据，状态码 201
        return json({ order }, { status: 201 });
    } catch (err: any) {
        // 处理订单业务错误
        if (err instanceof OrderError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        // 处理其他服务器错误
        return json({ error: err.message }, { status: 500 });
    }
};