// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
    // 获取查询参数
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('categoryId') || '';
    const page = url.searchParams.get('page') || '1';

    // 构建 API 请求参数
    const params = new URLSearchParams({
        published: 'true',
        inStock: 'true',
        sortBy: 'created_desc',
        page,
        pageSize: '20'
    });

    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);

    // 并行加载商品和分类
    const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?${params}`),
        fetch('/api/categories?tree=true')
    ]);

    const { products, pagination } = await productsRes.json();

    const { categories } = await categoriesRes.json();

    return {
        products,
        categories,
        pagination,
        filters: {
            search,
            categoryId,
            page: parseInt(page)
        }
    };
};