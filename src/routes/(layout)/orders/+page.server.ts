// src/routes/orders/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
    if (!locals.user) {
        throw redirect(302, '/auth/login');
    }

    const status = url.searchParams.get('status') || '';
    const page = url.searchParams.get('page') || '1';

    const params = new URLSearchParams({ page, pageSize: '20' });
    if (status) params.append('status', status);

    const response = await fetch(`/api/orders?${params}`);
    const { orders } = await response.json();

    return {
        orders,
        filters: { status, page: parseInt(page) }
    };
};