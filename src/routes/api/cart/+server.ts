import { json } from '@sveltejs/kit';
import { cartRepository } from '$lib/server/cart/cart.repository';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 获取用户购物车 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含购物车商品列表的 JSON 响应
 * @description
 * - 接口路径: `GET /api/cart`
 * - 权限: 需要用户登录 (通过 `requireAuth` 验证)
 * - 响应数据: { items: CartItemWithDetails[] }
 * - 错误处理: 捕获异常并返回对应状态码及错误信息
 */
export const GET: RequestHandler = async ({ locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 从数据库获取当前用户的购物车商品列表
        const items = await cartRepository.findByUserId(locals.user.id);

        // 返回购物车商品列表数据
        return json({ items });
    } catch (err: any) {
        // 错误处理：返回错误信息和对应的 HTTP 状态码
        return json({ error: err.message }, { status: err.statusCode || 500 });
    }
};

/**
 * 添加商品到购物车 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含添加或更新后购物车项的 JSON 响应
 * @description
 * - 接口路径: `POST /api/cart`
 * - 权限: 需要用户登录
 * - 请求体: { productId: string; variantId?: string; quantity?: number }
 * - 响应数据: { item: CartItem } (201 Created)
 * - 错误处理:
 *   - 400: 缺少商品ID
 *   - 500: 服务器内部错误
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 解析请求体数据
        const { productId, variantId, quantity = 1 } = await request.json();

        // 验证必填字段
        if (!productId) {
            return json({ error: 'Product ID is required' }, { status: 400 });
        }

        // 调用购物车仓库添加商品
        const item = await cartRepository.add({
            userId: locals.user.id, // 当前登录用户ID
            productId, // 商品ID
            variantId, // 商品变体ID（可选）
            quantity // 商品数量（默认1）
        });

        // 返回添加或更新后的购物车项数据，状态码 201
        return json({ item }, { status: 201 });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};