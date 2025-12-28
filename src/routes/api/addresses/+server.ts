import { json } from '@sveltejs/kit';
import { addressRepository } from '$lib/server/address/address.repository';
import { requireAuth } from '$lib/server/auth/auth.guard';
import type { RequestHandler } from './$types';

/**
 * 获取用户地址列表 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含地址列表的 JSON 响应
 * @description
 * - 接口路径: `GET /api/addresses`
 * - 权限: 需要用户登录 (通过 `requireAuth` 验证)
 * - 响应数据: { addresses: Address[] }
 * - 错误处理: 捕获异常并返回 500 状态码及错误信息
 */
export const GET: RequestHandler = async ({ locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 从数据库获取当前用户的所有地址
        const addresses = await addressRepository.findByUserId(locals.user.id);

        // 返回地址列表数据
        return json({ addresses });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};

/**
 * 创建新地址 API
 * @param {RequestEvent} event - SvelteKit 请求事件对象
 * @returns {Promise<Response>} - 返回包含新创建地址的 JSON 响应
 * @description
 * - 接口路径: `POST /api/addresses`
 * - 权限: 需要用户登录
 * - 请求体: { receiverName, receiverPhone, province, city, district, street, detailAddress, postalCode?, label?, isDefault? }
 * - 响应数据: { address: Address } (201 Created)
 * - 错误处理: 
 *   - 400: 请求参数缺失
 *   - 500: 服务器内部错误
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 验证用户是否登录
        requireAuth(locals.user);

        // 解析请求体数据
        const data = await request.json();

        // 验证必填字段
        if (!data.receiverName || !data.receiverPhone || !data.province || !data.city || !data.detailAddress) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 调用地址仓库创建新地址
        const address = await addressRepository.create({
            userId: locals.user.id, // 当前登录用户ID
            receiverName: data.receiverName, // 收货人姓名
            receiverPhone: data.receiverPhone, // 收货人电话
            province: data.province, // 省份
            city: data.city, // 城市
            district: data.district || '', // 区县（可选）
            street: data.street || '', // 街道（可选）
            detailAddress: data.detailAddress, // 详细地址
            postalCode: data.postalCode, // 邮政编码（可选）
            label: data.label, // 地址标签（可选，如"家"、"公司"）
            isDefault: data.isDefault || false // 是否默认地址（可选，默认false）
        });

        // 返回新创建的地址数据，状态码 201
        return json({ address }, { status: 201 });
    } catch (err: any) {
        // 错误处理：返回 500 状态码和错误信息
        return json({ error: err.message }, { status: 500 });
    }
};