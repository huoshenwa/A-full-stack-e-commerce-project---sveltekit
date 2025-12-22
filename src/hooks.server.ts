// src/hooks.server.ts
import { getSessionUser } from '$lib/server/auth/auth.session';// 解析Session的核心函数
import { AuthError } from '$lib/server/auth/auth.types';
import type { Handle } from '@sveltejs/kit';
// 步骤1：定义全局请求处理器（Handle类型）
export const handle: Handle = async ({ event, resolve }) => {
    // 步骤2：从请求Cookie中读取sessionId（前端登录后存在Cookie里的会话ID）
    const sessionId = event.cookies.get('session');
    // 步骤3：判断是否有sessionId（用户是否可能已登录）
    if (sessionId) {
        try {
            // 步骤3.1：调用getSessionUser解析sessionId，获取用户信息
            // 这里会校验：session是否存在→是否过期→用户是否存在→账号是否激活
            const user = await getSessionUser(sessionId);
            // 步骤3.2：把用户信息挂载到event.locals.user（后续业务逻辑可直接用）
            event.locals.user = user;
        } catch (err) {
            // 步骤3.3：捕获异常（比如session过期、账号禁用）
            // 只有是AuthError类型的异常（认证相关），才清除Cookie
            // Session 过期或无效，清除 Cookie
            if (err instanceof AuthError) {
                event.cookies.delete('session', { path: '/' });
            }
            // 无论什么异常，都把user设为null（未登录状态）
            event.locals.user = null;
        }
    } else {
        // 步骤4：没有sessionId（用户未登录），直接把user设为null
        event.locals.user = null;
    }

    // 步骤5：继续处理请求（执行接口/页面逻辑），获取响应
    const response = await resolve(event);
    // 步骤6：返回响应给前端
    return response;
};