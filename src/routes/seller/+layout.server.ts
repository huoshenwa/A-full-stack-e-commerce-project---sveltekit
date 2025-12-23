// src/routes/seller/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // 检查是否有商家权限
    if (!locals.user?.permissions.includes('product.write')) {
        throw redirect(302, '/auth/login');
    }

    return {
        user: locals.user
    };
};