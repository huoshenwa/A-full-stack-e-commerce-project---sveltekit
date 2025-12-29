import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, fetch }) => {
    // 调用提供的订单详情 API
    const res = await fetch(`/api/orders/${params.id}`);
    if (!res.ok) {
        // 如果 API 返回 404 或其他错误，抛出 SvelteKit 错误
        throw error(res.status, '加载订单详情失败');
    }
    const data = await res.json();
    return {
        order: data.order
    };
};