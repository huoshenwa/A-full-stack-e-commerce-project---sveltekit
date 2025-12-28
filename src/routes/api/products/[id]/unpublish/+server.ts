// src/routes/api/products/[id]/unpublish/+server.ts
// 商品下架接口：将在售商品改为「下架状态」，停止对外展示
// 接口路径：POST /api/products/[id]/unpublish（[id] 为商品ID）
// 接口类型：SvelteKit 服务器端 API 路由（需商家权限）
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装发布逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验商家权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型
// 修正：原代码 POST2 为笔误，SvelteKit 仅识别 GET/POST/PATCH/DELETE 等标准方法名
export const POST: RequestHandler = async ({ params, locals }) => {
    try {
        // 步骤1：权限校验（仅拥有 product.write 权限的商家可操作）
        requirePermission(locals.user, 'product.write');

        // 步骤2：调用业务服务下架商品
        // productService.unpublishProduct 内部逻辑：
        // 1. 校验商品是否存在 + 归属当前商家
        // 2. 将商品 isPublished 改为 false、status 改为 draft/archived
        // 3. 可选：记录下架时间/原因（生产环境可扩展）
        const product = await productService.unpublishProduct(params.id, locals.user!.id);

        // 步骤3：返回下架后的商品信息
        return json({ product });
    } catch (err) {
        // 场景1：商品业务异常（如商品不存在、非当前商家商品、商品已下架等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常
        console.error('Unpublish product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
