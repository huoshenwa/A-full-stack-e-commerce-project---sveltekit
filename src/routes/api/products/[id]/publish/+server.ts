// src/routes/api/products/[id]/publish/+server.ts
// 商品发布接口：将草稿/下架商品改为「上架状态」，对外公开展示
// 接口路径：POST /api/products/[id]/publish（[id] 为商品ID）
// 接口类型：SvelteKit 服务器端 API 路由（需商家权限）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装发布逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验商家权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// ====================== 权限接口：发布商品（上架） ======================
// POST 请求处理器：发布指定ID的商品（仅商品所属商家可操作）
// 前端场景：商家后台「商品管理」页点击「发布/上架」按钮时调用
export const POST: RequestHandler = async ({ params, locals }) => {
    try {
        // 步骤1：权限校验（仅拥有 product.write 权限的商家可操作）
        // 核心：确保只有商家能发布自己的商品，无权限则抛 AuthError.Forbidden
        requirePermission(locals.user, 'product.write');

        // 步骤2：调用业务服务发布商品
        // params.id：从路由 /api/products/[id]/publish 提取的商品ID（如 /api/products/123/publish → params.id = 123）
        // locals.user!.id：当前登录商家ID（productService 内部会校验「商品归属」，防止发布他人商品）
        const product = await productService.publishProduct(params.id, locals.user!.id);

        // 步骤3：返回发布后的商品信息（前端刷新商品列表/详情）
        return json({ product });
    } catch (err) {
        // 分层异常处理：
        // 场景1：商品业务异常（如商品不存在、非当前商家商品、商品已发布等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库更新失败、代码逻辑错误）
        console.error('Publish product error:', err); // 日志记录：便于排查问题
        return json({ error: 'Internal server error' }, { status: 500 }); // 隐藏具体异常，防止信息泄露
    }
};