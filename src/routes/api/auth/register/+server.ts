// src/routes/api/auth/register/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/auth/auth.service';
import { AuthError } from '$lib/server/auth/auth.types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        // 步骤一：解构出前端请求的json数据
        const { email, password, displayName } = await request.json();
        if (!email || !password) { // 邮箱字段必须存在
            return json({ error: 'Email and password are required' }, { status: 400 });
        }
        if (password.length < 8) { // 密码最小8位
            return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // 步骤二：前端请求的json数据没问题就开始在数据库注册，并返回出session
        const sessionId = await authService.register({ email, password, displayName });

        //步骤三：为用户浏览器设置 Cookie,存储用户的session
        cookies.set('session', sessionId, {
            path: '/',// 全站生效
            httpOnly: true,
            secure: true,
            sameSite: 'lax',//限制跨站请求携带 Cookie(宽松模式)
            maxAge: 60 * 60 * 24 * 30 // 30 天
        });
        //   domain: 'localhost', // 域名
        return json({ success: true });
    } catch (err) {
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        console.error('Register error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};