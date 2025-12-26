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

// --------------------------------------------------------------------------------------
// src/routes/api/products/[id]/unpublish/+server.ts
// 商品下架接口：将在售商品改为「下架状态」，停止对外展示
// 接口路径：POST /api/products/[id]/unpublish（[id] 为商品ID）
// 接口类型：SvelteKit 服务器端 API 路由（需商家权限）

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

// --------------------------------------------------------------------------------------
// src/routes/api/products/[id]/stock/+server.ts
// 商品库存更新接口：调整指定商品的库存数量（增加/减少）
// 接口路径：PATCH /api/products/[id]/stock（[id] 为商品ID）
// 接口类型：SvelteKit 服务器端 API 路由（需商家权限）

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