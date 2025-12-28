// src/routes/api/products/+server.ts
// 商品核心接口：提供「商品列表查询（公开）」「商品创建（需商家权限）」能力
// 接口路径：
// - GET /api/products：查询商品列表（支持多条件筛选、分页、排序）
// - POST /api/products：创建新商品（仅拥有 product.write 权限的商家可操作）
// 接口类型：SvelteKit 服务器端 API 路由

// 1. 导入核心依赖
import { json } from '@sveltejs/kit'; // SvelteKit 内置工具：生成标准 JSON 响应
import { productService } from '$lib/server/product/product.service'; // 商品业务服务（封装核心逻辑）
import { requirePermission } from '$lib/server/auth/auth.guard'; // 权限守卫（校验用户是否有指定权限）
import { ProductError } from '$lib/server/product/product.types'; // 商品相关自定义错误类型
import type { RequestHandler } from './$types'; // SvelteKit 自动生成的请求处理器类型
import { AuthError } from '$lib/server/auth/auth.types';

// ====================== 公开接口：获取商品列表 ======================
// GET 请求处理器：查询商品列表（支持多条件筛选、分页、排序），无需登录（公开接口）
// 前端场景：商品列表页、搜索页、分类筛选页均调用此接口
export const GET: RequestHandler = async ({ url }) => {
    try {
        // 步骤1：解析 URL 查询参数，构建筛选条件（核心！）
        // 所有参数均为可选，前端可根据业务场景传参（如分类筛选、价格区间、库存筛选等）
        const filter = {
            // 分类筛选：根据分类ID过滤（如 /api/products?categoryId=123 → 只查分类123下的商品）
            categoryId: url.searchParams.get('categoryId') || undefined,
            // 商品状态筛选：draft(草稿)/active(在售)/archived(归档)（后台管理用）
            status: url.searchParams.get('status') as any || undefined,
            // 发布状态筛选：published=true → 只查对外展示的商品（前端商品页用）
            isPublished: url.searchParams.get('published') === 'false' ? false : true,
            // 最低价格筛选：minPrice=99 → 只查价格≥99的商品（类型转换：字符串→数字）
            minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
            // 最高价格筛选：maxPrice=199 → 只查价格≤199的商品（类型转换：字符串→数字）
            maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
            // 库存筛选：inStock=true → 只查有库存的商品（前端购物场景用）
            inStock: url.searchParams.get('inStock') == 'true',
            // 关键词搜索：search=卫衣 → 模糊匹配商品名称/描述（前端搜索框用）
            search: url.searchParams.get('search') || undefined,
            // 排序字段：sortBy=price → 按价格排序（可选 price/stock/createAt 等）
            sortBy: url.searchParams.get('sortBy') as any || undefined,
            // 分页：默认第1页（page=1），前端可传 page=2 翻页（类型转换：字符串→数字）
            page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
            // 每页条数：默认20条（pageSize=20），前端可传 pageSize=10 自定义（类型转换：字符串→数字）
            pageSize: url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : 20,
        };


        // 步骤2：调用业务服务查询商品列表（封装筛选、分页、排序逻辑）
        const products = await productService.getProducts(filter);

        // 步骤3：返回商品列表 + 分页信息（前端需分页控件展示）
        return json({
            products, // 商品列表数据（符合筛选条件的商品数组）
            pagination: {
                page: filter.page, // 当前页码
                pageSize: filter.pageSize, // 每页条数
                total: products.length // 当前页商品数量（注：生产环境需返回总条数 totalCount，用于计算总页数）
            }
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

// ====================== 权限接口：创建商品 ======================
// POST 请求处理器：创建新商品（仅拥有 product.write 权限的商家可操作）
// 前端场景：商家后台「新增商品」页面提交表单时调用
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 步骤1：权限校验（核心！）
        // requirePermission 逻辑：
        // 1. 校验 locals.user 是否存在（商家已登录）
        // 2. 校验用户 permissions 中是否包含 'product.write'（商品创建/编辑权限）
        // 3. 无权限则抛出 AuthError.Forbidden（403 禁止访问）
        requirePermission(locals.user, 'product.write');

        // 步骤2：解析前端提交的商品创建数据（JSON 格式请求体）
        const data = await request.json();

        // 步骤3：基础参数校验（必填项）
        // 核心必填字段：name(商品名称)、slug(商品唯一标识)、price(售价)、stock(库存)
        // 注：stock === undefined 而非 !stock，因为库存可以为0（0表示无货，而非未传）
        if (!data.name || !data.slug || !data.price || data.stock === undefined) {
            return json({ error: 'Missing required fields' }, { status: 400 }); // 400 参数不合法
        }

        // 步骤4：调用业务服务创建商品
        // 入参1：locals.user!.id → 当前登录商家的ID（关联商品所属商家，防止越权创建）
        // 入参2：商品数据（含类型转换：前端传的字符串价格→数字，适配数据库类型）
        const product = await productService.createProduct(locals.user!.id, {
            categoryId: data.categoryId, // 商品所属分类ID（关联分类表）
            name: data.name, // 商品名称（如「纯棉卫衣」）
            slug: data.slug, // 商品唯一标识（如「pure-cotton-sweater」，用于URL/前端路由）
            description: data.description, // 商品详情描述（富文本）
            shortDescription: data.shortDescription, // 商品简短描述（列表页展示）
            price: Number(data.price), // 商品售价（类型转换：前端传字符串→数字）
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined, // 原价（促销时展示，可选）
            cost: data.cost ? Number(data.cost) : undefined, // 成本价（商家内部核算，可选）
            sku: data.sku, // 商品SKU（库存单位，唯一）
            stock: Number(data.stock), // 库存数量（类型转换：前端传字符串→数字）
            lowStockThreshold: data.lowStockThreshold, // 库存预警阈值（如库存<10时提醒商家）
            attributes: data.attributes, // 商品属性（如颜色/尺码：{color: '黑色', size: 'XL'}）
            images: data.images || [], // 商品图片URL数组（默认空数组，防止undefined）
            metaTitle: data.metaTitle, // SEO标题（优化搜索引擎收录）
            metaDescription: data.metaDescription, // SEO描述（优化搜索引擎收录）
            metaKeywords: data.metaKeywords // SEO关键词（优化搜索引擎收录）
        });

        // 步骤5：返回创建结果（201 Created：符合 RESTful 规范，标识资源创建成功）
        return json({ product }, { status: 201 });
    } catch (err) {
        // 分层异常处理：
        // 场景1：商品业务异常（如 slug 重复、分类不存在、库存为负等）
        if (err instanceof ProductError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }
        // 场景2：未知服务器异常（如数据库插入失败、代码逻辑错误）
        console.error('Create product error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};