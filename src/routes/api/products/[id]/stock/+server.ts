// src/routes/api/products/[id]/stock/+server.ts
// 商品库存更新接口：调整指定商品的库存数量（增加/减少）
// 接口路径：PATCH /api/products/[id]/stock（[id] 为商品ID）
// 接口类型：SvelteKit 服务器端 API 路由（需商家权限）
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应55555555 
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装发布逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验商家权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型
// ====================== 权限接口：更新商品库存 ======================
// PATCH 请求处理器：更新商品库存（符合 RESTful 规范：部分更新资源）
// 前端场景：商家后台「库存管理」页调整库存、订单取消后恢复库存、采购后增加库存
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        // 步骤1：权限校验（仅拥有 product.write 权限的商家可操作）
        requirePermission(locals.user, 'product.write');

        // 步骤2：解析请求体 + 校验参数类型
        const { quantity } = await request.json();
        // 核心校验：quantity 必须是数字（正数=增加库存，负数=减少库存）
        // 示例：quantity=10 → 库存+10；quantity=-5 → 库存-5
        if (typeof quantity !== 'number') {
            return json({ error: 'Invalid quantity' }, { status: 400 }); // 400 参数不合法
        }

        // 步骤3：调用业务服务更新库存
        // params.id：商品ID；locals.user!.id：商家ID（校验商品归属）；quantity：库存调整量
        // productService.updateStock 内部逻辑：
        // 1. 校验商品是否存在 + 归属当前商家
        // 2. 校验库存操作合法性（如减少库存时是否≥0，防止超卖）
        // 3. 执行库存更新（支持事务，防止并发操作导致库存异常）
        await productService.updateStock(params.id, locals.user!.id, quantity);

        // 步骤4：返回更新成功标识
        return json({ success: true });
    } catch (err) {
        // 场景1：商品业务异常（如商品不存在、非当前商家商品、库存不足等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常
        console.error('Update stock error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};