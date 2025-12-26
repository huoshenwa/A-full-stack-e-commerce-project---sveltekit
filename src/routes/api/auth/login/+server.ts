// src/routes/api/auth/login/+server.ts
// 登录接口：处理前端登录请求，验证账号密码并生成会话（Session）
// 接口路径：POST /api/auth/login
// 接口类型：SvelteKit 服务器端 API 路由（仅在服务器执行，无前端暴露风险）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成 JSON 格式响应
import { authService } from '$lib/server/auth/auth.service'; // 认证核心服务（封装登录逻辑）
import { AuthError } from '$lib/server/auth/auth.types'; // 认证相关错误类型（自定义）
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// 2. 定义 POST 请求处理器（仅接收 POST 方法，符合 RESTful 规范）
// RequestHandler 类型约束：确保请求/响应格式符合 SvelteKit 标准
export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
    try {
        // 步骤一：解析并验证前端请求体数据
        // request.json()：读取前端 POST 提交的 JSON 格式请求体（如 {email: "xxx@xxx.com", password: "123456"}）
        const { email, password } = await request.json();

        // 基础参数校验：防止空值提交（前端可能绕过校验，服务器必须二次校验）
        if (!email || !password) {
            // 返回 400 Bad Request：参数不合法，提示必填项
            return json({ error: 'Email and password are required' }, { status: 400 });
        }

        // 步骤二：调用认证服务执行登录逻辑（核心业务）
        // authService.login：封装了「校验账号密码→生成会话ID→记录登录日志」的核心逻辑
        // 参数1：用户提交的账号密码；参数2：登录上下文（IP/UA，用于安全审计）
        const sessionId = await authService.login(
            { email, password }, // 用户凭证
            {
                ipAddress: getClientAddress(), // 获取客户端真实IP（防刷/日志审计）
                userAgent: request.headers.get('user-agent') || undefined // 获取客户端浏览器/设备信息（日志审计）
            }
        );

        // 步骤三：设置会话 Cookie（核心安全操作）
        // 登录成功后，将会话ID写入 Cookie，供后续请求身份校验使用
        cookies.set('session', sessionId, {
            path: '/', // Cookie 生效路径：全站可用（所有接口都能读取）
            httpOnly: true, // 关键安全配置：禁止前端 JS 读取 Cookie（防 XSS 攻击）
            secure: true, // 关键安全配置：仅在 HTTPS 下传输（生产环境必须，防中间人劫持）
            sameSite: 'lax', // 防 CSRF 攻击：仅同站/安全跨站请求携带 Cookie
            maxAge: 60 * 60 * 24 * 30 // Cookie 有效期：30天（秒为单位，60*60=1小时，*24=1天，*30=30天）
        });

        // 步骤四：返回登录成功响应
        // 200 OK：默认状态码，返回 success: true 供前端判断登录结果
        return json({ success: true });

    } catch (err) {
        // 异常处理：区分「认证业务异常」和「服务器未知异常」

        // 场景1：认证相关异常（如账号密码错误、用户不存在、账号禁用）
        if (err instanceof AuthError) {
            // 返回对应错误信息 + 标准 HTTP 状态码（如 401 未授权、404 用户不存在）
            // 前端可根据 err.message 提示用户，statusCode 匹配 HTTP 标准
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库连接失败、代码 bug）
        // 打印错误日志：供开发者排查问题（生产环境需接入日志系统）
        console.error('Login error:', err);
        // 返回 500 Internal Server Error：隐藏具体错误（防信息泄露），仅提示通用错误
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};