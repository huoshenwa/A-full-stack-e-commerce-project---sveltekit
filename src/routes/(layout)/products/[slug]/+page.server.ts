// src/routes/products/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    // 先通过 slug 获取商品列表，找到对应的 ID
    const listRes = await fetch(`/api/products?slug=${params.slug}`);
    const { products } = await listRes.json();

    if (!products || products.length === 0) {
        throw error(404, '商品不存在');
    }

    const productId = products[0].id;

    // 获取完整商品详情
    const detailRes = await fetch(`/api/products/${productId}`);

    if (!detailRes.ok) {
        throw error(404, '商品不存在');
    }

    const { product } = await detailRes.json();

    return {
        product
    };
};