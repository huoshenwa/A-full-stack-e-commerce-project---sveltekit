// src/routes/api/products/[id]/publish/+server.ts
import { json } from '@sveltejs/kit';
import { productService } from '$lib/server/product/product.service';
import { requirePermission } from '$lib/server/auth/auth.guard';
import { ProductError } from '$lib/server/product/product.types';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
    try {
        requirePermission(locals.user, 'product.write');

        const product = await productService.publishProduct(params.id, locals.user!.id);

        return json({ product });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Publish product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// src/routes/api/products/[id]/unpublish/+server.ts
export const POST2: RequestHandler = async ({ params, locals }) => {
    try {
        requirePermission(locals.user, 'product.write');

        const product = await productService.unpublishProduct(params.id, locals.user!.id);

        return json({ product });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Unpublish product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// src/routes/api/products/[id]/stock/+server.ts
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    try {
        requirePermission(locals.user, 'product.write');

        const { quantity } = await request.json();

        if (typeof quantity !== 'number') {
            return json({ error: 'Invalid quantity' }, { status: 400 });
        }

        await productService.updateStock(params.id, locals.user!.id, quantity);

        return json({ success: true });
    } catch (err) {
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        console.error('Update stock error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};