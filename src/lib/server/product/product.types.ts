/**
 * 商品相关类型定义文件
 * 包含商品筛选、创建、更新、详情展示等场景的类型接口，以及商品相关错误类型
 * 与 API 文档规范严格对齐，确保前后端数据交互的类型安全
 */

/**
 * 商品列表筛选条件接口
 * 对应 GET /api/products 接口的查询参数，支持多维度筛选、排序和分页
 */
export interface ProductFilter {
    /** 分类ID筛选（可选）- 对应分类表的UUID */
    categoryId?: string;
    /** 商家ID筛选（可选）- 对应商家用户的UUID */
    sellerId?: string;
    /** 商品状态筛选（可选）- 仅支持指定枚举值 */
    status?: 'draft' | 'active' | 'archived';
    /** 发布状态筛选（可选）- true：已发布，false：未发布 */
    isPublished?: boolean;
    /** 最低价格筛选（可选）- 价格下限，单位与商品价格一致 */
    minPrice?: number;
    /** 最高价格筛选（可选）- 价格上限，单位与商品价格一致 */
    maxPrice?: number;
    /** 库存状态筛选（可选）- true：仅显示有库存商品 */
    inStock?: boolean;
    /** 关键词搜索（可选）- 匹配商品名称或描述（不区分大小写） */
    search?: string;
    /** 排序方式（可选）- 支持价格、创建时间、销量、评分排序 */
    sortBy?: 'price_asc' | 'price_desc' | 'created_desc' | 'sales_desc' | 'rating_desc';
    /** 页码（可选）- 默认为1，用于分页查询 */
    page?: number;
    /** 每页条数（可选）- 默认为20，最大支持100 */
    pageSize?: number;
}

/**
 * 商品创建数据接口
 * 对应 POST /api/products 接口的请求参数，定义创建商品所需的核心字段
 * 必填字段需严格校验，可选字段根据业务需求补充
 */
export interface CreateProductData {
    /** 分类ID（可选）- 关联商品所属分类的UUID */
    categoryId?: string;
    /** 商品名称（必填）- 最长255字符，需唯一标识商品 */
    name: string;
    /** URL标识符（必填）- 唯一且URL友好，仅含小写字母、数字、横杠 */
    slug: string;
    /** 详细描述（可选）- 支持Markdown格式，用于商品详情页展示 */
    description?: string;
    /** 简短描述（可选）- 最长500字符，用于商品列表页展示 */
    shortDescription?: string;
    /** 销售价格（必填）- 必须大于0，单位为元（保留2位小数） */
    price: number;
    /** 划线价（原价，可选）- 用于展示优惠力度，需大于销售价格 */
    compareAtPrice?: number;
    /** 成本价（可选）- 仅商家可见，不返回给前端用户 */
    cost?: number;
    /** SKU编号（可选）- 商品库存单位标识符，需唯一 */
    sku?: string;
    /** 库存数量（必填）- 初始库存数量，支持后续更新 */
    stock: number;
    /** 低库存预警阈值（可选）- 库存低于该值时触发预警，默认10 */
    lowStockThreshold?: number;
    /** 商品属性（可选）- 灵活的键值对结构，如品牌、颜色、尺寸等 */
    attributes?: Record<string, any>;
    /** 商品图片（可选）- 图片URL数组，用于展示商品多图 */
    images?: string[];
    /** SEO标题（可选）- 用于网页标题优化，提升搜索排名 */
    metaTitle?: string;
    /** SEO描述（可选）- 用于搜索引擎结果页描述展示 */
    metaDescription?: string;
    /** SEO关键词（可选）- 用于搜索引擎关键词匹配 */
    metaKeywords?: string;
}

/**
 * 商品更新数据接口
 * 对应 PATCH /api/products/{id} 接口的请求参数
 * 继承创建接口的所有字段（均改为可选，支持部分更新），新增状态和发布状态字段
 */
export interface UpdateProductData extends Partial<CreateProductData> {
    /** 商品状态（可选）- 用于更新商品的状态流转 */
    status?: 'draft' | 'active' | 'archived';
    /** 发布状态（可选）- 控制商品是否对外展示 */
    isPublished?: boolean;
}

/**
 * 商品详情接口
 * 对应 GET /api/products/{id} 接口的响应数据结构
 * 包含商品完整信息、关联分类/商家信息、变体列表等详细数据
 */
export interface ProductWithDetails {
    /** 商品UUID（必填）- 商品唯一标识 */
    id: string;
    /** 关联分类信息（可选）- 包含分类核心信息 */
    category?: {
        id: string; // 分类UUID
        name: string; // 分类名称
        slug: string; // 分类URL标识符
    };
    /** 关联商家信息（必填）- 商品所属商家 */
    seller: {
        id: string; // 商家用户UUID
        displayName: string | null; // 商家显示名称（可能为null）
    };
    /** 商品名称（必填）- 商品完整名称 */
    name: string;
    /** URL标识符（必填）- 商品唯一URL标识 */
    slug: string;
    /** 详细描述（可选）- 支持Markdown格式，可能为null */
    description: string | null;
    /** 简短描述（可选）- 商品简介，可能为null */
    shortDescription: string | null;
    /** 销售价格（必填）- 字符串格式，保留2位小数 */
    price: string;
    /** 划线价（可选）- 字符串格式，保留2位小数，可能为null */
    compareAtPrice: string | null;
    /** SKU编号（可选）- 商品库存单位标识，可能为null */
    sku: string | null;
    /** 库存数量（必填）- 当前可用库存 */
    stock: number;
    /** 商品图片（必填）- 图片URL数组，至少包含一张主图 */
    images: string[];
    /** 商品属性（可选）- 灵活键值对结构，可能为null */
    attributes: Record<string, any> | null;
    /** 商品状态（必填）- 枚举值：draft/active/archived */
    status: string;
    /** 发布状态（必填）- true：已发布（对外展示），false：未发布 */
    isPublished: boolean;
    /** 平均评分（必填）- 字符串格式，保留2位小数（0-5分） */
    rating: string;
    /** 评论数量（必填）- 商品的有效评论总数 */
    reviewCount: number;
    /** 销量（必填）- 商品累计销售数量 */
    salesCount: number;
    /** 浏览次数（必填）- 商品累计被浏览次数 */
    viewCount: number;
    /** 商品变体列表（可选）- 同一商品的不同规格（如颜色、尺寸） */
    variants?: ProductVariantData[];
    /** 创建时间（必填）- 商品创建时间（ISO格式日期对象） */
    createdAt: Date;
    /** 更新时间（必填）- 商品最后更新时间（ISO格式日期对象） */
    updatedAt: Date;
}

/**
 * 商品变体数据接口
 * 对应商品详情中的变体信息，描述同一商品的不同规格配置
 */
export interface ProductVariantData {
    /** 变体UUID（必填）- 变体唯一标识 */
    id: string;
    /** 变体名称（必填）- 如"黑色-128GB"，明确区分变体规格 */
    name: string;
    /** 变体SKU（必填）- 变体唯一库存单位标识 */
    sku: string;
    /** 变体属性（必填）- 如颜色、存储容量等规格属性 */
    attributes: Record<string, any>;
    /** 变体价格（必填）- 字符串格式，保留2位小数 */
    price: string;
    /** 变体库存（必填）- 该规格的可用库存数量 */
    stock: number;
    /** 变体图片（可选）- 该规格的专属图片，可能为null */
    image: string | null;
    /** 变体状态（必填）- true：可用，false：不可用 */
    isActive: boolean;
}

/**
 * 商品相关错误类
 * 继承自原生Error，扩展错误码和HTTP状态码，用于统一错误处理
 */
export class ProductError extends Error {
    /**
     * 构造函数 - 创建商品相关错误实例
     * @param message 错误描述信息（前端展示用）
     * @param code 错误编码（业务标识）
     * @param statusCode HTTP状态码（默认400 Bad Request）
     */
    constructor(
        message: string,
        public code: ProductErrorCode,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'ProductError'; // 错误名称标识，用于区分错误类型
    }

    /** 静态错误实例：商品不存在（HTTP 404） */
    static NotFound = new ProductError('Product not found', 'PRODUCT_NOT_FOUND', 404);
    /** 静态错误实例：未授权（未登录，HTTP 401） */
    static Unauthorized = new ProductError('Unauthorized', 'UNAUTHORIZED', 401);
    /** 静态错误实例：无权限（HTTP 403）- 如非商品所有者操作 */
    static Forbidden = new ProductError('Forbidden', 'FORBIDDEN', 403);
    /** 静态错误实例：无效数据（HTTP 400）- 如参数格式错误 */
    static InvalidData = new ProductError('Invalid data', 'INVALID_DATA', 400);
    /** 静态错误实例：Slug已存在（HTTP 409）- URL标识符重复 */
    static SlugExists = new ProductError('Slug already exists', 'SLUG_EXISTS', 409);
    /** 静态错误实例：商品缺货（HTTP 400）- 库存不足 */
    static OutOfStock = new ProductError('Product out of stock', 'OUT_OF_STOCK', 400);
}

/**
 * 商品错误编码类型
 * 枚举所有商品相关的业务错误类型，用于前后端错误识别
 */
export type ProductErrorCode =
    | 'PRODUCT_NOT_FOUND' // 商品不存在
    | 'UNAUTHORIZED' // 未授权（未登录）
    | 'FORBIDDEN' // 无权限操作
    | 'INVALID_DATA' // 数据无效（参数错误）
    | 'SLUG_EXISTS' // Slug已被占用
    | 'OUT_OF_STOCK'; // 商品缺货