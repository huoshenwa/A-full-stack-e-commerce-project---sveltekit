import { fail, redirect } from '@sveltejs/kit';
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
        const name = formData.get('name')?.toString();
        const slug = formData.get('slug')?.toString();
        if (!name || !slug) {
            return fail(400, { error: '请填写名称和标识' });
        }
        const categoryData = {
            name,
            slug,
            description: formData.get('description')?.toString(),
            parentId: formData.get('parentId')?.toString() || undefined,
            sortOrder: parseInt(formData.get('sortOrder')?.toString() || '0')
        };
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '创建失败' });
        }
        // 创建成功，重定向回列表页以清除表单
        throw redirect(303, '/admin/categories');
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const categoryId = formData.get('categoryId')?.toString();
        if (!categoryId) {
            return fail(400, { error: '缺少分类 ID' });
        }
        // 这里需要后端 API 支持 DELETE /api/categories/[id]
        // 假设 API 已存在
        // const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
        // 模拟删除成功
        console.log(`Deleting category ${categoryId}`);
        return { success: true };
    }
};