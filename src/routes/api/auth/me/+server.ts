// src/routes/api/auth/me/+server.ts
// 获取当前登录用户信息接口：返回已登录用户的核心信息（脱敏），用于前端展示用户资料/权限控制
// 接口路径：GET /api/auth/me
// 接口类型：SvelteKit 服务器端 API 路由（仅服务端执行，保护敏感用户数据）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 格式响应
import { requireAuth } from '$lib/server/auth/auth.guard'; // 认证守卫（校验用户是否已登录）
import { AuthError } from '$lib/server/auth/auth.types'; // 认证相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// 2. 定义 GET 请求处理器（仅接收 GET 方法，符合 RESTful 规范：获取资源用 GET）
export const GET: RequestHandler = async ({ locals }) => {
    try {
        // 步骤一：调用认证守卫校验用户登录状态（核心鉴权逻辑）
        // requireAuth 内部逻辑：
        // 1. 检查 locals.user 是否存在（hooks.server.ts 已挂载用户信息）
        // 2. 若不存在/未登录，抛出 AuthError.Unauthorized（401 未授权）
        // 3. 若存在，放行后续逻辑（确保只有登录用户能获取自己的信息）
        requireAuth(locals.user);

        // 步骤二：返回脱敏后的用户核心信息（安全设计：只返回前端需要的字段）
        // 关键：不返回敏感字段（如密码哈希、手机号、身份证等），防止信息泄露
        return json({
            user: {
                id: locals.user.id, // 用户唯一标识（UUID）：前端用于关联用户数据
                email: locals.user.email, // 邮箱：展示/登录凭证（已脱敏？可根据需求处理）
                displayName: locals.user.displayName, // 显示名称：前端展示用户名
                avatarUrl: locals.user.avatarUrl, // 头像URL：前端展示用户头像
                roles: locals.user.roles, // 用户角色（如 'user'/'admin'）：前端做权限控制（如是否显示管理入口）
                permissions: locals.user.permissions // 用户权限（如 'product:read'/'order:write'）：细粒度权限控制
            }
        });

    } catch (err) {
        // 异常处理：分层处理，保障前端体验和数据安全
        // 场景1：认证业务异常（如未登录/会话失效，抛出 AuthError.Unauthorized）
        if (err instanceof AuthError) {
            // 返回 401 未授权 + 错误提示，前端可捕获并跳转到登录页
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库查询失败、代码逻辑错误）
        // 隐藏具体错误详情（防信息泄露），仅返回通用 500 错误
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};