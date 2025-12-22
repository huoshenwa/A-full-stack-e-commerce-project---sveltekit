// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import { authService } from '$lib/server/auth/auth.service';
import { AuthError } from '$lib/server/auth/auth.types';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
    try {
        // 步骤一：解构前端请求体数据
        const { email, password } = await request.json();

        // 基础验证
        if (!email || !password) {
            return json({ error: 'Email and password are required' }, { status: 400 });
        }

        //步骤二 ： 执行数据库登录，返回用户ID
        const sessionId = await authService.login(
            { email, password },
            {
                ipAddress: getClientAddress(),
                userAgent: request.headers.get('user-agent') || undefined
            }
        );

        //步骤三： 设置 Cookie
        cookies.set('session', sessionId, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 天
        });

        return json({ success: true });
    } catch (err) {
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Login error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};