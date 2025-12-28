import { json } from '@sveltejs/kit';
import { addressRepository } from '$lib/server/address/address.repository';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 更新地址 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含更新后地址的 JSON 响应
 * @description
 * - 接口路径: `PATCH /api/addresses/[id]`
 * - 权限: 需要用户登录且必须是地址的所有者
 * - 请求参数: id (地址ID，从URL路径获取)
 * - 请求体: { receiverName?, receiverPhone?, province?, city?, district?, street?, detailAddress?, postalCode?, label?, isDefault? }
 * - 响应数据: { address: Address }
 * - 错误处理:
 *   - 404: 地址不存在或不属于当前用户
 *   - 500: 服务器内部错误
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 解析请求体数据
        const data = await request.json();

        // 调用地址仓库更新地址
        const address = await addressRepository.update(params.id, locals.user.id, data);

        // 检查地址是否存在（或是否属于当前用户）
        if (!address) {
            return json({ error: 'Address not found' }, { status: 404 });
        }

        // 返回更新后的地址数据
        return json({ address });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};

/**
 * 删除地址 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回删除成功的 JSON 响应
 * @description
 * - 接口路径: `DELETE /api/addresses/[id]`
 * - 权限: 需要用户登录且必须是地址的所有者
 * - 请求参数: id (地址ID，从URL路径获取)
 * - 响应数据: { success: true }
 * - 错误处理: 捕获异常并返回 500 状态码及错误信息
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 调用地址仓库删除地址
        await addressRepository.delete(params.id, locals.user.id);

        // 返回删除成功的响应
        return json({ success: true });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};