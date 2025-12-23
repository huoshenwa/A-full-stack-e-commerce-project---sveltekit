// src/routes/seller/products/[id]/edit/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
    // 获取商品详情
    const productRes = await fetch(`/api/products/${params.id}`);

    if (!productRes.ok) {
        throw error(404, '商品不存在');
    }

    const { product } = await productRes.json();

    // 检查是否是商品所有者
    if (product.sellerId !== locals.user!.id && !locals.user!.permissions.includes('product.manage')) {
        throw error(403, '无权限编辑此商品');
    }

    // 加载分类列表
    const categoriesRes = await fetch('/api/categories');
    const { categories } = await categoriesRes.json();

    return {
        product,
        categories
    };
};

export const actions: Actions = {
    update: async ({ params, request, fetch, locals }) => {
        const formData = await request.formData();

        const updateData: any = {};

        const name = formData.get('name')?.toString();
        if (name) updateData.name = name;

        const slug = formData.get('slug')?.toString();
        if (slug) updateData.slug = slug;

        const description = formData.get('description')?.toString();
        if (description) updateData.description = description;

        const shortDescription = formData.get('shortDescription')?.toString();
        if (shortDescription) updateData.shortDescription = shortDescription;

        const price = formData.get('price')?.toString();
        if (price) updateData.price = parseFloat(price);

        const compareAtPrice = formData.get('compareAtPrice')?.toString();
        if (compareAtPrice) updateData.compareAtPrice = parseFloat(compareAtPrice);

        const stock = formData.get('stock')?.toString();
        if (stock) updateData.stock = parseInt(stock);

        const categoryId = formData.get('categoryId')?.toString();
        if (categoryId) updateData.categoryId = categoryId;

        const sku = formData.get('sku')?.toString();
        if (sku) updateData.sku = sku;

        const response = await fetch(`/api/products/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '更新失败' });
        }

        return { success: true };
    },

    delete: async ({ params, fetch }) => {
        const response = await fetch(`/api/products/${params.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '删除失败' });
        }

        throw redirect(302, '/seller');
    }
};