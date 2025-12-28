import { json } from '@sveltejs/kit';
import { orderService, OrderError } from '$lib/server/order/order.service';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 获取订单详情 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含订单详情的 JSON 响应
 * @description
 * - 接口路径: `GET /api/orders/[id]`
 * - 权限: 需要用户登录且必须是订单的所有者
 * - 请求参数: id (订单ID，从URL路径获取)
 * - 响应数据: { order: OrderWithItems }
 * - 错误处理:
 *   - 404: 订单未找到
 *   - 500: 服务器内部错误
 */
export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 调用订单服务获取订单详情
        const order = await orderService.getOrderDetail(params.id, locals.user.id);

        // 返回订单详情数据
        return json({ order });
    } catch (err: any) {
        // 处理订单业务错误
        if (err instanceof OrderError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        // 处理其他服务器错误
        return json({ error: err.message }, { status: 500 });
    }
};