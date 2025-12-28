import { json } from '@sveltejs/kit';
import { cartRepository } from '$lib/server/cart/cart.repository';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 更新购物车商品 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含更新后购物车项的 JSON 响应
 * @description
 * - 接口路径: `PATCH /api/cart/[id]`
 * - 权限: 需要用户登录且必须是购物车项的所有者
 * - 请求参数: id (购物车项ID，从URL路径获取)
 * - 请求体: { quantity?: number; isSelected?: boolean }
 * - 响应数据: { item: CartItem | undefined }
 * - 错误处理: 捕获异常并返回 500 状态码及错误信息
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 解析请求体数据
        const { quantity, isSelected } = await request.json();

        let item;

        // 如果请求体包含 quantity，则更新商品数量
        if (quantity !== undefined) {
            item = await cartRepository.updateQuantity(params.id, locals.user.id, quantity);
        }

        // 如果请求体包含 isSelected，则切换商品选择状态
        if (isSelected !== undefined) {
            item = await cartRepository.toggleSelected(params.id, locals.user.id, isSelected);
        }

        // 返回更新后的购物车项数据
        return json({ item });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};

/**
 * 删除购物车商品 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回删除成功的 JSON 响应
 * @description
 * - 接口路径: `DELETE /api/cart/[id]`
 * - 权限: 需要用户登录且必须是购物车项的所有者
 * - 请求参数: id (购物车项ID，从URL路径获取)
 * - 响应数据: { success: true }
 * - 错误处理: 捕获异常并返回 500 状态码及错误信息
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 调用购物车仓库删除商品
        await cartRepository.remove(params.id, locals.user.id);

        // 返回删除成功的响应
        return json({ success: true });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};