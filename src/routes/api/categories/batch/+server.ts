// src/routes/api/categories/batch/+server.ts
// 商品分类【批量创建】接口（仅管理员）
// POST /api/categories/batch

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { categoryService } from '$lib/server/product/category.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import { AuthError } from '$lib/server/auth/auth.types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // ====================== 1. 权限校验 ======================
        requirePermission(locals.user, 'product.manage');

        // ====================== 2. 解析请求体 ======================
        const data = await request.json();

        // 必须是数组
        if (!Array.isArray(data)) {
            return json(
                { error: 'Request body must be an array' },
                { status: 400 }
            );
        }

        if (data.length === 0) {
            return json(
                { error: 'Category list cannot be empty' },
                { status: 400 }
            );
        }

        // ====================== 3. 参数基础校验 ======================
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            if (!item.name || !item.slug) {
                return json(
                    {
                        error: `Invalid category at index ${i}: name and slug are required`
                    },
                    { status: 400 }
                );
            }
        }

        // ====================== 4. 批量创建 ======================
        // 说明：
        // - 这里采用「逐条创建」而不是 service 内部黑盒批量
        // - 便于复用 createCategory 的完整校验逻辑
        // - 后续如需事务，可在 service 层统一升级
        const createdCategories = [];

        for (const item of data) {
            const category = await categoryService.createCategory({
                name: item.name,
                slug: item.slug,
                description: item.description,
                parentId: item.parentId,
                imageUrl: item.imageUrl,
                sortOrder: item.sortOrder
            });

            createdCategories.push(category);
        }

        // ====================== 5. 返回结果 ======================
        return json(
            {
                success: true,
                createdCount: createdCategories.length,
                categories: createdCategories
            },
            { status: 201 }
        );
    } catch (err) {
        // ====================== 6. 分层异常处理 ======================
        if (err instanceof ProductError) {
            return json(
                { error: err.message },
                { status: err.statusCode }
            );
        }

        if (err instanceof AuthError) {
            return json(
                { error: err.message },
                { status: err.statusCode }
            );
        }

        console.error('Batch create category error:', err);
        return json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};
