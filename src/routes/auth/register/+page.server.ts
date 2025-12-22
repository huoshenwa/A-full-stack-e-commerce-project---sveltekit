import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// 定义 API 基础地址 (开发环境)
const API_BASE_URL = 'http://localhost:5173';

export const actions = {
    default: async ({ request, fetch }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const displayName = data.get('displayName') as string;

        // 1. 基础前端验证 (后端也会验证，但双重保险更好)
        if (!email || !password) {
            return fail(400, { email, missing: true, error: '邮箱和密码为必填项' });
        }
        if (password.length < 8) {
            return fail(400, { email, invalid: true, error: '密码长度至少为 8 位' });
        }

        try {
            // 2. 调用后端注册接口
            // 文档 Page 2 & 4: POST /api/auth/register
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    displayName: displayName || undefined // 可选字段
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // 处理文档 Page 4 定义的错误 (如 409 邮箱已存在)
                return fail(response.status, {
                    email,
                    error: result.error || '注册失败，请稍后重试'
                });
            }

            // 3. 注册成功
            // 文档 Page 2: 注册成功后自动登录并设置 session
        } catch (err) {
            console.error('Registration error:', err);
            return fail(500, { error: '服务器内部错误' });
        }

        // 4. 重定向到仪表盘或主页
        throw redirect(303, '/dashboard');
    }
} satisfies Actions;