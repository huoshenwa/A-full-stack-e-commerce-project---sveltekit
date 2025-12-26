// src/routes/api/products/[id]/variants/+server.ts
// 商品变体（规格）创建接口：为指定商品添加变体（如颜色/尺码等规格）
// 接口路径：POST /api/products/[id]/variants（[id] 为主商品ID）
// 接口类型：SvelteKit 服务器端 API 路由（需商家编辑权限）
// 核心业务场景：电商商品多规格管理（如「卫衣」的「黑色XL」「白色M」等变体）

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装变体创建逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验商家编辑权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// ====================== 权限接口：创建商品变体（规格） ======================
// POST 请求处理器：为指定主商品创建变体（仅拥有 product.write 权限的商家可操作）
// 前端场景：商家后台「商品规格管理」页添加变体（如给手机添加「128G/黑色」「256G/白色」等规格）
export const POST: RequestHandler = async ({ params, request, locals }) => {
    try {
        // 步骤1：权限校验（核心！仅 product.write 权限可创建变体）
        // 设计逻辑：变体属于主商品的子资源，需和主商品保持相同的权限控制
        requirePermission(locals.user, 'product.write');

        // 步骤2：解析前端提交的变体创建数据（JSON 格式请求体）
        const data = await request.json();

        // 步骤3：基础参数校验（变体核心必填项）
        // 变体必填字段说明：
        // - name：变体名称（如「黑色XL」「256G版本」，前端展示用）
        // - sku：变体专属SKU（唯一，如「WY-BLACK-XL」，库存/订单维度的核心标识）
        // - attributes：变体属性（如 {color: '黑色', size: 'XL'}，用于区分不同变体）
        // - price：变体价格（可与主商品不同，如大尺码卫衣更贵）
        // - stock：变体库存（每个变体独立库存，如黑色XL有10件，白色M有20件）
        if (!data.name || !data.sku || !data.attributes || data.price === undefined || data.stock === undefined) {
            return json({ error: 'Missing required fields' }, { status: 400 }); // 400 参数不合法
        }

        // 步骤4：调用业务服务创建商品变体
        // 入参说明：
        // - params.id：主商品ID（变体归属的商品，如「卫衣」的ID）
        // - locals.user!.id：当前登录商家ID（校验主商品归属，防止创建他人商品的变体）
        // - 变体数据：含类型转换（前端传字符串价格/库存→数字，适配数据库类型）
        const variant = await productService.createVariant(params.id, locals.user!.id, {
            name: data.name, // 变体名称
            sku: data.sku, // 变体专属SKU（全局唯一，不可与其他变体重复）
            attributes: data.attributes, // 变体属性（键值对，如 {color: '红色', capacity: '256G'}）
            price: Number(data.price), // 变体价格（类型转换：字符串→数字）
            stock: Number(data.stock), // 变体库存（类型转换：字符串→数字）
            image: data.image // 变体专属图片（可选，如黑色卫衣的图片，无则用主商品图片）
        });

        // 步骤5：返回创建结果（201 Created：符合 RESTful 规范，标识子资源创建成功）
        return json({ variant }, { status: 201 });
    } catch (err) {
        // 分层异常处理：
        // 场景1：商品业务异常（如主商品不存在、非当前商家商品、SKU重复、属性格式错误等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库插入失败、变体属性校验逻辑错误）
        console.error('Create variant error:', err); // 日志记录：便于排查变体创建失败原因
        return json({ error: 'Internal server error' }, { status: 500 }); // 隐藏具体异常，防止信息泄露
    }
};