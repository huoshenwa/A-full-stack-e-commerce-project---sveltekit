import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, fetch }) => {
    // 假设存在用户详情 API
    const response = await fetch(`/api/users/${params.id}`);
    if (!response.ok) {
        throw error(404, '用户不存在');
    }
    const { user } = await response.json();
    // 为了演示，我们也获取一下该用户的订单或统计数据
    const statsRes = await fetch(`/api/orders?userId=${params.id}`);
    const { orders } = await statsRes.json();
    return {
        user,
        orderCount: orders?.length || 0
    };
};