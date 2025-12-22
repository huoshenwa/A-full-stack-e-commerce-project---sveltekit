// src/routes/api/categories/+server.ts
import { json } from '@sveltejs/kit';
import { categoryService } from '$lib/server/product/category.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import type { RequestHandler } from './$types';

// 获取分类列表（公开）
export const GET: RequestHandler = async ({ url }) => {
    try {
        const tree = url.searchParams.get('tree') === 'true';

        if (tree) {
            const categories = await categoryService.getCategoryTree();
            return json({ categories });
        } else {
            const categories = await categoryService.getAllCategories();
            return json({ categories });
        }
    } catch (err) {
        console.error('Get categories error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// 创建分类（需要管理员权限）
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        requirePermission(locals.user, 'product.manage');

        const data = await request.json();

        if (!data.name || !data.slug) {
            return json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const category = await categoryService.createCategory({
            name: data.name,
            slug: data.slug,
            description: data.description,
            parentId: data.parentId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder
        });

        return json({ category }, { status: 201 });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Create category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// src/routes/api/categories/[id]/+server.ts
// 更新分类
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        requirePermission(locals.user, 'product.manage');

        const data = await request.json();

        const category = await categoryService.updateCategory(params.id, {
            name: data.name,
            slug: data.slug,
            description: data.description,
            parentId: data.parentId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder,
            isActive: data.isActive
        });

        return json({ category });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Update category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// 删除分类
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        requirePermission(locals.user, 'product.manage');

        await categoryService.deleteCategory(params.id);

        return json({ success: true });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Delete category error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};