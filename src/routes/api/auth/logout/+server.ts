// src/routes/api/auth/logout/+server.ts
import { json } from '@sveltejs/kit';
import { invalidateSession } from '$lib/server/auth/auth.session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // 步骤一：获取前端session cookie
    const sessionId = cookies.get('session');
    // 步骤二：删除数据库的session（单设备）
    if (sessionId) {
        await invalidateSession(sessionId);
    }
    // 步骤三：删除前端session
    cookies.delete('session', { path: '/' });
    // path: '/' 表示：只删除「作用域为全站（所有路径）」的 session Cookie；

    return json({ success: true });
};