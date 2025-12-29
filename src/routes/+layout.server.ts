import type { LayoutServerLoad } from './$types';

// export const ssr = false;
export const load = (async ({ locals }) => {
    // console.log('root layout load');
    // 返回全局用户信息（来自 hooks.server.ts）
    return {
        user: locals.user
    };
}) satisfies LayoutServerLoad;