// src/routes/api/products/[id]/variants/+server.ts
import { json } from '@sveltejs/kit';
import { productService } from '$lib/server/product/product.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import type { RequestHandler } from './$types';

// 创建商品变体
export const POST: RequestHandler = async ({ params, request, locals }) => {
    try {
        requirePermission(locals.user, 'product.write');

        const data = await request.json();

        if (!data.name || !data.sku || !data.attributes || data.price === undefined || data.stock === undefined) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const variant = await productService.createVariant(params.id, locals.user!.id, {
            name: data.name,
            sku: data.sku,
            attributes: data.attributes,
            price: Number(data.price),
            stock: Number(data.stock),
            image: data.image
        });

        return json({ variant }, { status: 201 });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Create variant error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};