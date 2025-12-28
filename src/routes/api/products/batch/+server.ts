// src/routes/api/products/batch/+server.ts
// 商品【批量创建】接口（仅商家）
// POST /api/products/batch

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { productService } from '$lib/server/product/product.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import { AuthError } from '$lib/server/auth/auth.types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // ====================== 1. 权限校验 ======================
        requirePermission(locals.user, 'product.write');

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
                { error: 'Product list cannot be empty' },
                { status: 400 }
            );
        }

        // ====================== 3. 基础参数校验 ======================
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // 必填项校验（与单条创建保持一致）
            if (!item.name || !item.slug || !item.price || item.stock === undefined) {
                return json(
                    {
                        error: `Invalid product at index ${i}: name, slug, price and stock are required`
                    },
                    { status: 400 }
                );
            }
        }

        // ====================== 4. 批量创建商品 ======================
        const createdProducts = [];

        for (const item of data) {
            const product = await productService.createProduct(locals.user!.id, {
                categoryId: item.categoryId,
                name: item.name,
                slug: item.slug,
                description: item.description,
                shortDescription: item.shortDescription,
                price: Number(item.price),
                compareAtPrice: item.compareAtPrice
                    ? Number(item.compareAtPrice)
                    : undefined,
                cost: item.cost ? Number(item.cost) : undefined,
                sku: item.sku,
                stock: Number(item.stock),
                lowStockThreshold: item.lowStockThreshold,
                attributes: item.attributes,
                images: item.images || [],
                metaTitle: item.metaTitle,
                metaDescription: item.metaDescription,
                metaKeywords: item.metaKeywords
            });

            createdProducts.push(product);
        }

        // ====================== 5. 返回结果 ======================
        return json(
            {
                success: true,
                createdCount: createdProducts.length,
                products: createdProducts
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

        console.error('Batch create products error:', err);
        return json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};
