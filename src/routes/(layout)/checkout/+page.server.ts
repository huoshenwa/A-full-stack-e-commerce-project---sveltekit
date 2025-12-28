// src/routes/checkout/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.user) {
        throw redirect(302, '/auth/login');
    }

    // 加载购物车和地址
    const [cartRes, addressRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/addresses')
    ]);

    const { items } = await cartRes.json();
    const { addresses } = await addressRes.json();

    const selectedItems = items.filter((item: any) => item.isSelected);

    if (selectedItems.length === 0) {
        throw redirect(302, '/cart');
    }

    return {
        items: selectedItems,
        addresses
    };
};

export const actions: Actions = {
    default: async ({ request, fetch, locals }) => {
        if (!locals.user) {
            return fail(401, { error: '请先登录' });
        }

        const formData = await request.formData();
        const addressId = formData.get('addressId')?.toString();
        const buyerMessage = formData.get('buyerMessage')?.toString();

        if (!addressId) {
            return fail(400, { error: '请选择收货地址' });
        }

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addressId, buyerMessage })
        });

        if (!response.ok) {
            const error = await response.json();
            return fail(response.status, { error: error.error || '创建订单失败' });
        }

        const { order } = await response.json();

        // 重定向到订单详情页
        throw redirect(302, `/orders/${order.id}`);
    }
};