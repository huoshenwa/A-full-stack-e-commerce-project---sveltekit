// src/routes/seller/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
    const page = url.searchParams.get('page') || '1';
    const status = url.searchParams.get('status') || '';

    // 构建查询参数（只查询自己的商品）
    const params = new URLSearchParams({
        sellerId: locals.user!.id,
        page,
        pageSize: '20'
    });

    if (status) params.append('status', status);

    const response = await fetch(`/api/products?${params}`);
    const { products, pagination } = await response.json();

    return {
        products,
        pagination,
        filters: {
            page: parseInt(page),
            status
        }
    };
};