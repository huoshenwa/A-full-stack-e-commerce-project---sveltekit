// src/routes/profile/addresses/+page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.user) {
        throw redirect(302, '/auth/login');
    }

    const response = await fetch('/api/addresses');
    const { addresses } = await response.json();

    return { addresses };
};

export const actions: Actions = {
    create: async ({ request, fetch }) => {
        const formData = await request.formData();

        const data = {
            receiverName: formData.get('receiverName')?.toString(),
            receiverPhone: formData.get('receiverPhone')?.toString(),
            province: formData.get('province')?.toString(),
            city: formData.get('city')?.toString(),
            district: formData.get('district')?.toString(),
            street: formData.get('street')?.toString(),
            detailAddress: formData.get('detailAddress')?.toString(),
            postalCode: formData.get('postalCode')?.toString(),
            label: formData.get('label')?.toString(),
            isDefault: formData.get('isDefault') === 'on'
        };

        if (!data.receiverName || !data.receiverPhone || !data.province || !data.city || !data.detailAddress) {
            return fail(400, { error: '请填写必填字段' });
        }

        const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '创建失败' });
        }

        return { success: true };
    },

    delete: async ({ request, fetch }) => {
        const formData = await request.formData();
        const addressId = formData.get('addressId')?.toString();

        if (!addressId) {
            return fail(400, { error: '缺少地址ID' });
        }

        const response = await fetch(`/api/addresses/${addressId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            return fail(response.status, { error: '删除失败' });
        }

        return { success: true };
    }
};