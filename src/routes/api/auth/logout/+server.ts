// src/routes/api/auth/logout/+server.ts
// 退出登录接口：处理用户登出请求，完成「服务端会话失效 + 客户端Cookie删除」双端登出
// 接口路径：POST /api/auth/logout
// 接口类型：SvelteKit 服务器端 API 路由（仅服务端执行，保障会话清理的安全性）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 格式响应
import { invalidateSession } from '$lib/server/auth/auth.session'; // 会话失效核心函数（清理数据库会话）
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// 2. 定义 POST 请求处理器（仅接收 POST 方法，符合 RESTful 规范）
export const POST: RequestHandler = async ({ cookies }) => {
    // 步骤一：从客户端 Cookie 中读取会话ID（sessionId）
    // cookies.get('session')：获取前端存储的 session Cookie 值（登录时设置的会话标识）
    const sessionId = cookies.get('session');

    // 步骤二：服务端失效会话（核心安全操作，防止会话复用）
    // 即使客户端 Cookie 被篡改/残留，服务端标记会话为无效，彻底杜绝“无效会话访问”
    if (sessionId) {
        // invalidateSession 内部逻辑：
        // 1. 从数据库中查询该 sessionId 对应的会话记录
        // 2. 将会话标记为「已失效」或直接删除（单设备登出）
        // 3. 可选：记录登出日志（IP/时间/设备）
        await invalidateSession(sessionId);
    }

    // 步骤三：删除客户端 Cookie（前端登出）
    // 关键：delete 操作的参数必须和 set 时的 path 一致（否则删除失败）
    cookies.delete('session', {
        path: '/' // 与登录/注册时的 Cookie 作用域保持一致（全站生效），确保精准删除
        // 补充说明：若设置过 domain/secure/sameSite，删除时也需匹配（如 domain: 'localhost'）
    });
    // path: '/' 作用：仅删除「作用域为全站」的 session Cookie，避免误删其他路径的 Cookie

    // 步骤四：返回登出成功响应
    // 无论是否存在 sessionId（比如用户未登录却调用登出），均返回成功（友好处理，避免前端报错）
    return json({ success: true });
};