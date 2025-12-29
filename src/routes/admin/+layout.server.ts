import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals, url }) => {
    // 检查是否有管理员权限 (假设 locals.user 存在)
    if (!locals.user || !locals.user.roles?.includes('admin')) {
        // 如果未登录，跳转到登录页
        throw redirect(302, '/auth/login');
    }

    return {
        user: locals.user,
        currentPath: url.pathname
    };
};