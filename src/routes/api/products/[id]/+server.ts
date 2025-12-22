// src/routes/api/products/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { productService } from '$lib/server/product/product.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import type { RequestHandler } from './$types';

// 获取商品详情
export const GET: RequestHandler = async ({ params }) => {
    try {
        const product = await productService.getProductDetail(params.id, true);

        return json({ product });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Get product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// 更新商品
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        requirePermission(locals.user, 'product.write');

        const data = await request.json();

        const product = await productService.updateProduct(params.id, locals.user!.id, {
            categoryId: data.categoryId,
            name: data.name,
            slug: data.slug,
            description: data.description,
            shortDescription: data.shortDescription,
            price: data.price ? Number(data.price) : undefined,
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
            cost: data.cost ? Number(data.cost) : undefined,
            sku: data.sku,
            stock: data.stock !== undefined ? Number(data.stock) : undefined,
            lowStockThreshold: data.lowStockThreshold,
            attributes: data.attributes,
            images: data.images,
            status: data.status,
            isPublished: data.isPublished,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaKeywords: data.metaKeywords
        });

        return json({ product });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Update product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// 删除商品
export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        requirePermission(locals.user, 'product.delete');

        await productService.deleteProduct(params.id, locals.user!.id);

        return json({ success: true });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Delete product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};