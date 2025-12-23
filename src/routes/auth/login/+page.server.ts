// src/routes/auth/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // 已登录则重定向
    if (locals.user) {
        throw redirect(302, '/');
    }

    return {};
};

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        if (!email || !password) {
            return fail(400, { error: '请输入邮箱和密码' });
        }

        // 调用登录 API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '登录失败' });
        }

        // 登录成功，重定向到首页
        throw redirect(302, '/');
    }
};