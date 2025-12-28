// src/routes/api/categories/[id]/+server.ts
// 商品分类详情接口：提供「分类更新」「分类删除」能力（均需管理员权限）
// 接口路径：
// - PATCH /api/categories/[id]：更新指定ID的分类
// - DELETE /api/categories/[id]：删除指定ID的分类
// 接口类型：SvelteKit 服务器端 API 路由（动态参数路由，[id] 为分类ID）
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { categoryService } from '$lib/server/product/category.service'; // 分类业务服务（封装核心逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验用户是否有指定权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型
import { AuthError } from '$lib/server/auth/auth.types';
// ====================== 权限接口：更新商品分类 ======================
// PATCH 请求处理器：更新指定ID的分类（仅管理员），PATCH 符合 RESTful 规范（部分更新资源）
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        // 步骤1：权限校验（仅拥有 product.manage 权限的管理员可操作）
        requirePermission(locals.user, 'product.manage');

        // 步骤2：解析请求数据（前端提交的更新字段）+ 动态路由参数（分类ID）
        const data = await request.json();
        // params.id：从路由 /api/categories/[id] 中提取的分类ID（如 /api/categories/123 → params.id = 123）

        // 步骤3：调用业务服务更新分类（支持部分字段更新，如仅改名称/排序）
        const category = await categoryService.updateCategory(params.id, {
            name: data.name,
            slug: data.slug,
            description: data.description,
            parentId: data.parentId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder,
            isActive: data.isActive // 分类是否启用（禁用后前端不展示）
        });

        // 步骤4：返回更新后的分类信息
        return json({ category });
    } catch (err) {
        // 场景1：商品业务异常（如分类不存在、slug 重复等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        // 场景2：未知服务器异常
        console.error('Update category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// ====================== 权限接口：删除商品分类 ======================
// DELETE 请求处理器：删除指定ID的分类（仅管理员），删除前会校验「分类下是否有商品」（防止误删）
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        // 步骤1：权限校验（仅拥有 product.manage 权限的管理员可操作）
        requirePermission(locals.user, 'product.manage');

        // 步骤2：调用业务服务删除分类
        // categoryService.deleteCategory 内部逻辑：
        // 1. 校验分类是否存在
        // 2. 校验分类下是否关联商品（有商品则抛 ProductError.CategoryInUse）
        // 3. 执行删除（软删除/物理删除，取决于业务设计）
        await categoryService.deleteCategory(params.id);

        // 步骤3：返回删除成功标识
        return json({ success: true });
    } catch (err) {
        // 场景1：商品业务异常（如分类不存在、分类下有商品无法删除等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        // 场景2：未知服务器异常
        console.error('Delete category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};