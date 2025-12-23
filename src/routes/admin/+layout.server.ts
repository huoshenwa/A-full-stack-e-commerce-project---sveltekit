// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // 检查是否有管理员权限
    if (!locals.user?.permissions.includes('product.manage')) {
        throw redirect(302, '/');
    }

    return {
        user: locals.user
    };
};