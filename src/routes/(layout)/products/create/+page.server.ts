// src/routes/products/create/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // 检查权限
    if (!locals.user?.permissions.includes('product.write')) {
        throw redirect(302, '/auth/login');
    }

    // 加载分类列表
    const categoriesRes = await fetch('/api/categories');
    const { categories } = await categoriesRes.json();

    return {
        categories
    };
};

export const actions: Actions = {
    default: async ({ request, fetch, locals }) => {
        if (!locals.user?.permissions.includes('product.write')) {
            return fail(403, { error: '无权限' });
        }

        const formData = await request.formData();

        const productData = {
            name: formData.get('name')?.toString(),
            slug: formData.get('slug')?.toString(),
            description: formData.get('description')?.toString(),
            shortDescription: formData.get('shortDescription')?.toString(),
            price: parseFloat(formData.get('price')?.toString() || '0'),
            compareAtPrice: formData.get('compareAtPrice')
                ? parseFloat(formData.get('compareAtPrice')?.toString() || '0')
                : undefined,
            stock: parseInt(formData.get('stock')?.toString() || '0'),
            categoryId: formData.get('categoryId')?.toString() || undefined,
            sku: formData.get('sku')?.toString() || undefined
        };

        if (!productData.name || !productData.slug || !productData.price) {
            return fail(400, { error: '请填写必填字段' });
        }

        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '创建失败' });
        }

        const { product } = await response.json();
        throw redirect(302, `/products/${product.slug}`);
    }
};