// src/routes/admin/products/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
    const page = url.searchParams.get('page') || '1';
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';

    const params = new URLSearchParams({
        page,
        pageSize: '50'
    });

    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await fetch(`/api/products?${params}`);
    const { products, pagination } = await response.json();

    return {
        products,
        pagination,
        filters: {
            page: parseInt(page),
            status,
            search
        }
    };
};