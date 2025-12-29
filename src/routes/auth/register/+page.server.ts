// src/routes/auth/register/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(302, '/products');
    }

    return {};
};

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const displayName = formData.get('displayName')?.toString();

        if (!email || !password) {
            return fail(400, { error: '请输入邮箱和密码' });
        }

        if (password.length < 8) {
            return fail(400, { error: '密码至少 8 位' });
        }

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName })
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '注册失败' });
        }

        throw redirect(302, '/products');
    }
};