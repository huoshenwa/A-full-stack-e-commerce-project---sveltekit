// src/routes/api/categories/+server.ts
// 商品分类核心接口：提供「分类列表查询（公开）」「分类创建（需权限）」能力
// 接口路径：
// - GET /api/categories：查询分类列表（树形/扁平）
// - POST /api/categories：创建新分类（仅管理员）
// 接口类型：SvelteKit 服务器端 API 路由

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { categoryService } from '$lib/server/product/category.service'; // 分类业务服务（封装核心逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验用户是否有指定权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型

// ====================== 公开接口：获取分类列表 ======================
// GET 请求处理器：查询商品分类列表（支持扁平列表/树形结构），无需登录（公开接口）
export const GET: RequestHandler = async ({ url }) => {
    try {
        // 解析 URL 查询参数：tree=true 表示返回树形结构（如分类嵌套），否则返回扁平列表
        // 场景：前端商品页展示扁平分类，后台管理页展示树形分类
        const tree = url.searchParams.get('tree') === 'true';

        if (tree) {
            // 场景1：获取树形分类（含父子层级，如 数码产品 > 手机 > 苹果手机）
            const categories = await categoryService.getCategoryTree();
            return json({ categories });
        } else {
            // 场景2：获取扁平分类列表（无层级，仅所有分类）
            const categories = await categoryService.getAllCategories();
            return json({ categories });
        }
    } catch (err) {
        // 异常处理：仅捕获未知服务器异常（分类查询为公开接口，无业务异常）
        console.error('Get categories error:', err); // 日志记录：便于排查数据库/服务异常
        // 返回 500 通用错误：隐藏具体异常信息，防止服务器信息泄露
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// ====================== 权限接口：创建商品分类 ======================
// POST 请求处理器：创建新商品分类（仅拥有 product.manage 权限的管理员可操作）
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 步骤1：权限校验（核心！）
        // requirePermission 逻辑：
        // 1. 校验 locals.user 是否存在（已登录）
        // 2. 校验用户 permissions 中是否包含 'product.manage'（商品管理权限）
        // 3. 无权限则抛出 AuthError.Forbidden（403 禁止访问）
        requirePermission(locals.user, 'product.manage');

        // 步骤2：解析前端提交的分类创建数据
        const data = await request.json();

        // 步骤3：基础参数校验（必填项）
        // name：分类名称（如「手机」），slug：分类唯一标识（如「mobile」，用于URL/前端路由）
        if (!data.name || !data.slug) {
            return json({ error: 'Name and slug are required' }, { status: 400 }); // 400 参数不合法
        }

        // 步骤4：调用业务服务创建分类
        // 入参包含可选字段：description（分类描述）、parentId（父分类ID）、imageUrl（分类图片）、sortOrder（排序序号）
        const category = await categoryService.createCategory({
            name: data.name,
            slug: data.slug,
            description: data.description,
            parentId: data.parentId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder
        });

        // 步骤5：返回创建结果（201 Created：符合 RESTful 规范，标识资源创建成功）
        return json({ category }, { status: 201 });
    } catch (err) {
        // 分层异常处理：
        // 场景1：商品业务异常（如 slug 重复、父分类不存在等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        // 场景2：未知服务器异常（如数据库插入失败、代码逻辑错误）
        console.error('Create category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// --------------------------------------------------------------------------------------
// src/routes/api/categories/[id]/+server.ts
// 商品分类详情接口：提供「分类更新」「分类删除」能力（均需管理员权限）
// 接口路径：
// - PATCH /api/categories/[id]：更新指定ID的分类
// - DELETE /api/categories/[id]：删除指定ID的分类
// 接口类型：SvelteKit 服务器端 API 路由（动态参数路由，[id] 为分类ID）

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

        // 场景2：未知服务器异常
        console.error('Delete category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};