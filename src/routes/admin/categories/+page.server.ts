// src/routes/admin/categories/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const response = await fetch('/api/categories?tree=true');
    const { categories } = await response.json();

    return {
        categories
    };
};

export const actions: Actions = {
    create: async ({ request, fetch }) => {
        const formData = await request.formData();

        const categoryData = {
            name: formData.get('name')?.toString(),
            slug: formData.get('slug')?.toString(),
            description: formData.get('description')?.toString(),
            parentId: formData.get('parentId')?.toString() || undefined,
            sortOrder: parseInt(formData.get('sortOrder')?.toString() || '0')
        };

        if (!categoryData.name || !categoryData.slug) {
            return fail(400, { error: '请填写名称和标识' });
        }

        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '创建失败' });
        }

        return { success: true };
    },

    update: async ({ request, fetch }) => {
        const formData = await request.formData();
        const categoryId = formData.get('categoryId')?.toString();

        if (!categoryId) {
            return fail(400, { error: '缺少分类 ID' });
        }

        const updateData: any = {};

        const name = formData.get('name')?.toString();
        if (name) updateData.name = name;

        const slug = formData.get('slug')?.toString();
        if (slug) updateData.slug = slug;

        const description = formData.get('description')?.toString();
        if (description) updateData.description = description;

        const sortOrder = formData.get('sortOrder')?.toString();
        if (sortOrder) updateData.sortOrder = parseInt(sortOrder);

        const response = await fetch(`/api/categories/${categoryId}`, {
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

    delete: async ({ request, fetch }) => {
        const formData = await request.formData();
        const categoryId = formData.get('categoryId')?.toString();

        if (!categoryId) {
            return fail(400, { error: '缺少分类 ID' });
        }

        const response = await fetch(`/api/categories/${categoryId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '删除失败' });
        }

        return { success: true };
    }
};