import { json } from '@sveltejs/kit';
import { orderService, OrderError } from '$lib/server/order/order.service';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 取消订单 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含取消后订单的 JSON 响应
 * @description
 * - 接口路径: `POST /api/orders/[id]/cancel`
 * - 权限: 需要用户登录且必须是订单的所有者
 * - 请求参数: id (订单ID，从URL路径获取)
 * - 响应数据: { order: Order }
 * - 错误处理:
 *   - 404: 订单未找到
 *   - 400: 订单状态不允许取消
 *   - 500: 服务器内部错误
 */
export const POST: RequestHandler = async ({ params, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 调用订单服务取消订单
        const order = await orderService.cancelOrder(params.id, locals.user.id);

        // 返回取消后的订单数据
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