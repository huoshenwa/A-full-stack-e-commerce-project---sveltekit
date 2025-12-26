// src/routes/api/auth/register/+server.ts
// 注册接口：处理前端用户注册请求，完成账号创建、密码加密、会话生成
// 接口路径：POST /api/auth/register
// 接口类型：SvelteKit 服务器端 API 路由（仅在服务端执行，保护敏感逻辑不暴露到前端）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 格式响应
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型（约束请求/响应格式）
import { authService } from '$lib/server/auth/auth.service'; // 认证核心服务（封装注册业务逻辑）
import { AuthError } from '$lib/server/auth/auth.types'; // 认证相关自定义错误类型（如邮箱已存在）

// 2. 定义 POST 请求处理器（仅接收 POST 方法，符合 RESTful API 设计规范）
export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        // 步骤一：解析并校验前端提交的注册数据
        // request.json()：读取前端 POST 请求体中的 JSON 数据（如 {email: "xxx@xxx.com", password: "12345678", displayName: "张三"}）
        const { email, password, displayName } = await request.json();

        // 基础参数校验（前端校验可被绕过，服务器必须做二次校验，保障数据合法性）
        // 校验1：邮箱和密码为必填项（核心凭证）
        if (!email || !password) {
            // 返回 400 Bad Request：参数不合法，明确提示必填项
            return json({ error: 'Email and password are required' }, { status: 400 });
        }
        // 校验2：密码长度不低于8位（基础安全要求，避免弱密码）
        if (password.length < 8) {
            return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // 步骤二：调用认证服务执行注册核心逻辑
        // authService.register 内部逻辑：
        // 1. 校验邮箱是否已存在（避免重复注册）
        // 2. 对密码进行加密（如 bcrypt 哈希，绝不存储明文密码）
        // 3. 插入用户数据到数据库（email/加密密码/displayName）
        // 4. 生成用户会话ID（sessionId），关联新用户
        const sessionId = await authService.register({ email, password, displayName });

        // 步骤三：设置会话 Cookie（注册成功后自动登录，提升用户体验）
        cookies.set('session', sessionId, {
            path: '/', // Cookie 生效路径：全站所有接口/页面均可读取
            httpOnly: true, // 关键安全配置：禁止前端 JS 访问 Cookie，防止 XSS 攻击窃取会话
            secure: true, // 关键安全配置：仅在 HTTPS 协议下传输 Cookie（生产环境必开，防中间人劫持）
            sameSite: 'lax', // 防 CSRF 攻击：仅同站/安全跨站请求携带 Cookie（宽松模式兼顾兼容性）
            maxAge: 60 * 60 * 24 * 30 // Cookie 有效期：30天（单位：秒，60*60=1小时，*24=1天，*30=30天）
            // domain: 'localhost', // 可选：指定 Cookie 生效的域名（生产环境需配置为实际域名，如 example.com）
        });

        // 步骤四：返回注册成功响应
        // 200 OK：默认状态码，返回 success: true 供前端判断注册结果，引导用户进入首页
        return json({ success: true });

    } catch (err) {
        // 异常处理：分层处理，区分「业务异常」和「未知异常」，保障前端体验和后端排查效率
        // 场景1：认证业务异常（如邮箱已存在、参数格式不合法等）
        if (err instanceof AuthError) {
            // 返回自定义错误信息 + 对应 HTTP 状态码（如 409 冲突：邮箱已存在）
            // 前端可根据 error 提示用户，statusCode 符合 HTTP 标准
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库连接失败、代码逻辑错误等）
        // 打印错误日志：供开发者排查问题（生产环境需接入日志系统，如 ELK）
        console.error('Register error:', err);
        // 返回 500 Internal Server Error：隐藏具体错误详情（防信息泄露），仅返回通用提示
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};