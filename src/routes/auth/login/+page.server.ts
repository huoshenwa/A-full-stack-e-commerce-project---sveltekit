import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const API_BASE_URL = 'http://localhost:5173';

export const actions = {
    default: async ({ request, fetch }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!email || !password) {
            return fail(400, { email, error: '请输入邮箱和密码' });
        }

        try {
            // 文档 Page 6: POST /api/auth/login
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                // 处理 401 (账号密码错误), 403 (禁用) 等
                return fail(response.status, {
                    email,
                    error: result.error || '登录失败'
                });
            }

        } catch (err) {
            console.error('Login error:', err);
            return fail(500, { error: '连接服务器失败' });
        }

        throw redirect(303, '/dashboard');
    }
} satisfies Actions;