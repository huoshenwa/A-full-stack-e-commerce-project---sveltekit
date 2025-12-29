// src/routes/products/[slug]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = async ({ params, fetch }) => {
    // 获取完整商品详情
    const detailRes = await fetch(`/api/products/detail?slug=${params.slug}`);
    if (!detailRes.ok) {
        throw error(404, '商品不存在');
    }
    const product = await detailRes.json();
    return {
        product
    };
};
// 定义服务端 Actions
export const actions: Actions = {
    /**
     * 立即购买 Action
     * 逻辑流：加入购物车 -> 获取默认地址 -> 创建订单 -> 跳转
     */
    buyNow: async ({ request, fetch }) => {
        const formData = await request.formData();
        const productId = formData.get('productId') as string;
        const variantId = formData.get('variantId') as string | null;
        const quantity = parseInt(formData.get('quantity') as string);
        // 1. 将商品加入购物车 (或更新数量)
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    variantId: variantId || undefined, // 如果为空则不传
                    quantity
                })
            });
        } catch (e) {
            throw error(500, '加入购物车失败');
        }
        // 2. 获取用户收货地址 (创建订单必须参数)
        let addressId = '';
        try {
            // 假设项目中有获取地址列表的接口，且第一个地址为默认地址
            // 如果没有这个接口，请替换为实际逻辑或硬编码一个存在的 addressId 进行测试
            const addrRes = await fetch('/api/addresses');
            if (addrRes.ok) {
                const { addresses } = await addrRes.json();
                if (addresses && addresses.length > 0) {
                    // 查找标记为默认的地址，如果没有则取第一个
                    const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
                    addressId = defaultAddr.id;
                }
            }
        } catch (e) {
            console.error('获取地址失败', e);
        }
        // 如果没有地址，无法直接下单，通常应该跳转到设置地址页
        // 为了演示流程，这里抛出错误提示
        if (!addressId) {
            throw error(400, '请先在个人中心设置收货地址，才能立即购买');
        }
        // 3. 创建订单
        try {
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId,
                    buyerMessage: '立即购买下单' // 可选备注
                })
            });
            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw error(500, errData.error || '创建订单失败');
            }
        } catch (e: any) {
            // 捕获上面 throw error 的异常或者网络异常
            if (e.status) throw e;
            throw error(500, '订单服务异常');
        }
        // 4. 创建成功，重定向到订单列表页
        throw redirect(303, '/orders');
    }
};