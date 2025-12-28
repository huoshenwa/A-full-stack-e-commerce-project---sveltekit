import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装核心逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验用户是否有指定权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型
import { AuthError } from '$lib/server/auth/auth.types';

export const GET: RequestHandler = async ({ url }) => {
    try {

        // 步骤1：解析 URL 查询参数，构建筛选条件（核心！）
        // 所有参数均为可选，前端可根据业务场景传参（如分类筛选、价格区间、库存筛选等）
        const slug: string | null = url.searchParams.get('slug')
        if (!slug) {
            return json({ products: [] });
        }
        // 步骤2：调用业务服务查询商品列表（封装筛选、分页、排序逻辑）
        const products = await productService.getProductsBySlug(slug);

        // 步骤3：返回商品列表 + 分页信息（前端需分页控件展示）
        return json({
            ...products // 商品列表数据（符合筛选条件的商品数组）
        });
    } catch (err) {
        // 分层异常处理：
        // 场景1：商品业务异常（如分类不存在、参数格式错误等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        // 场景2：未知服务器异常（如数据库查询失败、代码逻辑错误）
        console.error('Get products error:', err); // 日志记录：便于排查问题
        return json({ error: 'Internal server error' }, { status: 500 }); // 隐藏具体异常，防止信息泄露
    }
};