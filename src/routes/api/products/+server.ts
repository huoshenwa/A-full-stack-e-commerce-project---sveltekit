// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { productService } from '$lib/server/product/product.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import type { RequestHandler } from './$types';

// 获取商品列表（公开）
export const GET: RequestHandler = async ({ url }) => {
    try {
        const filter = {
            categoryId: url.searchParams.get('categoryId') || undefined,
            status: url.searchParams.get('status') as any || undefined,
            isPublished: url.searchParams.get('published') === 'true' ? true : undefined,
            minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
            maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
            inStock: url.searchParams.get('inStock') == 'true',
            search: url.searchParams.get('search') || undefined,
            sortBy: url.searchParams.get('sortBy') as any || undefined,
            page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
            pageSize: url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : 20
        };

        const products = await productService.getProducts(filter);

        return json({
            products,
            pagination: {
                page: filter.page,
                pageSize: filter.pageSize,
                total: products.length
            }
        });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Get products error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// 创建商品（需要商家权限）
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        requirePermission(locals.user, 'product.write');

        const data = await request.json();

        // 基础验证
        if (!data.name || !data.slug || !data.price || data.stock === undefined) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await productService.createProduct(locals.user!.id, {
            categoryId: data.categoryId,
            name: data.name,
            slug: data.slug,
            description: data.description,
            shortDescription: data.shortDescription,
            price: Number(data.price),
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
            cost: data.cost ? Number(data.cost) : undefined,
            sku: data.sku,
            stock: Number(data.stock),
            lowStockThreshold: data.lowStockThreshold,
            attributes: data.attributes,
            images: data.images || [],
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaKeywords: data.metaKeywords
        });

        return json({ product }, { status: 201 });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Create product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};