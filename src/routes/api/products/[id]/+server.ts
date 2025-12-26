// src/routes/api/products/[id]/+server.ts
// 商品详情接口：提供「商品详情查询（公开）」「商品更新（需编辑权限）」「商品删除（需删除权限）」能力
// 接口路径：
// - GET /api/products/[id]：查询指定ID的商品详情（公开）
// - PATCH /api/products/[id]：更新指定ID的商品（仅 product.write 权限）
// - DELETE /api/products/[id]：删除指定ID的商品（仅 product.delete 权限）
// 接口类型：SvelteKit 服务器端 API 路由（动态参数路由，[id] 为商品ID）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装核心逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验用户权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// ====================== 公开接口：获取商品详情 ======================
// GET 请求处理器：查询指定ID的商品详情（公开接口，无需登录）
// 前端场景：商品详情页、购物车商品预览、订单确认页均调用此接口
export const GET: RequestHandler = async ({ params }) => {
    try {
        // 步骤1：调用业务服务获取商品详情
        // params.id：从路由 /api/products/[id] 提取的商品ID（如 /api/products/123 → params.id = 123）
        // 第二个参数 true：表示返回完整详情（含SEO字段、属性等），false 可返回精简版（前端列表页用）
        const product = await productService.getProductDetail(params.id, true);

        // 步骤2：返回商品详情数据
        return json({ product });
    } catch (err) {
        // 分层异常处理：
        // 场景1：商品业务异常（如商品不存在、商品已下架且非商家访问等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库查询失败、代码逻辑错误）
        console.error('Get product error:', err); // 日志记录：便于排查问题
        return json({ error: 'Internal server error' }, { status: 500 }); // 隐藏具体异常，防止信息泄露
    }
};

// ====================== 权限接口：更新商品信息 ======================
// PATCH 请求处理器：更新指定ID的商品（仅拥有 product.write 权限的商家可操作）
// PATCH 符合 RESTful 规范：仅更新传递的字段（部分更新），而非全量替换
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        // 步骤1：权限校验（核心！仅 product.write 权限可编辑商品）
        requirePermission(locals.user, 'product.write');

        // 步骤2：解析前端提交的更新数据（JSON 格式请求体）
        const data = await request.json();

        // 步骤3：调用业务服务更新商品
        // 入参说明：
        // - params.id：商品ID（要更新的商品）
        // - locals.user!.id：当前登录商家ID（校验商品归属，防止修改他人商品）
        // - 更新数据：仅传递的字段会被更新，未传递的字段保留原值
        const product = await productService.updateProduct(params.id, locals.user!.id, {
            categoryId: data.categoryId, // 商品所属分类ID
            name: data.name, // 商品名称
            slug: data.slug, // 商品唯一标识（URL友好）
            description: data.description, // 商品详情描述
            shortDescription: data.shortDescription, // 商品简短描述
            price: data.price ? Number(data.price) : undefined, // 售价（传值则转换为数字，不传则保留原值）
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined, // 原价（促销用）
            cost: data.cost ? Number(data.cost) : undefined, // 成本价（商家内部）
            sku: data.sku, // 商品SKU
            // 库存：仅当传递时更新（stock !== undefined），0 是合法值（无货），不能用 !stock 判断
            stock: data.stock !== undefined ? Number(data.stock) : undefined,
            lowStockThreshold: data.lowStockThreshold, // 库存预警阈值
            attributes: data.attributes, // 商品属性（颜色/尺码等）
            images: data.images, // 商品图片URL数组
            status: data.status, // 商品状态（draft/active/archived）
            isPublished: data.isPublished, // 是否对外发布（true/false）
            metaTitle: data.metaTitle, // SEO标题
            metaDescription: data.metaDescription, // SEO描述
            metaKeywords: data.metaKeywords // SEO关键词
        });

        // 步骤4：返回更新后的商品信息（前端刷新详情页）
        return json({ product });
    } catch (err) {
        // 场景1：商品业务异常（如商品不存在、非当前商家商品、slug 重复等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常
        console.error('Update product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// ====================== 权限接口：删除商品 ======================
// DELETE 请求处理器：删除指定ID的商品（仅拥有 product.delete 权限的商家/管理员可操作）
// 注：生产环境建议「软删除」（标记 deletedAt 字段），而非物理删除（防止数据丢失）
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        // 步骤1：权限校验（核心！仅 product.delete 权限可删除商品，权限分级更严格）
        // 设计思路：删除权限比编辑权限更高，防止误删（商家需单独配置删除权限）
        requirePermission(locals.user, 'product.delete');

        // 步骤2：调用业务服务删除商品
        // productService.deleteProduct 内部逻辑：
        // 1. 校验商品是否存在 + 归属当前商家
        // 2. 校验商品是否关联未完成订单（有订单则禁止删除，防止订单数据异常）
        // 3. 执行删除（软删除：更新 deletedAt 字段；物理删除：直接删除行）
        await productService.deleteProduct(params.id, locals.user!.id);

        // 步骤3：返回删除成功标识
        return json({ success: true });
    } catch (err) {
        // 场景1：商品业务异常（如商品不存在、非当前商家商品、商品关联订单等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常
        console.error('Delete product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};