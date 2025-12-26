// src/lib/server/product/product.service.ts
import { productRepository } from './product.repository'; // 商品数据访问层，处理数据库交互
import { categoryRepository } from './category.repository'; // 分类数据访问层，验证分类合法性
import { ProductError } from './product.types'; // 商品相关错误类型定义
import type { CreateProductData, UpdateProductData, ProductFilter } from './product.types'; // 商品相关类型约束

/**
 * 商品业务服务层（ProductService）
 * 封装商品全生命周期的核心业务逻辑，包括创建/更新/发布/下架/库存管理等，
 * 负责参数校验、权限验证、业务规则判断，调用Repository层完成数据操作，
 * 是控制器（Controller）和数据层（Repository）之间的桥梁
 */
export class ProductService {
    /**
     * 创建商品
     * @param sellerId 商家ID（创建商品的商家唯一标识）
     * @param data 商品创建参数（包含名称、价格、分类等核心信息）
     * @returns 创建成功的商品完整信息
     * @throws ProductError 分类不存在/ slug重复时抛出对应业务错误
     */
    async createProduct(sellerId: string, data: CreateProductData) {
        // 1. 验证分类合法性：如果传入了分类ID，检查分类是否存在
        if (data.categoryId) {
            const category = await categoryRepository.findById(data.categoryId);
            if (!category) {
                throw new ProductError('Category not found', 'INVALID_DATA', 400);
            }
        }

        // 2. 检查商品slug唯一性：避免URL冲突
        const existingProduct = await productRepository.findBySlug(data.slug);
        if (existingProduct) {
            throw ProductError.SlugExists;
        }

        // 3. 调用Repository创建商品：将数字价格转为字符串（适配数据库decimal类型）
        const product = await productRepository.create({
            ...data,
            sellerId, // 绑定商品到当前商家
            price: data.price.toString(), // 销售价转字符串
            compareAtPrice: data.compareAtPrice?.toString(), // 划线价转字符串（可选）
            cost: data.cost?.toString() // 成本价转字符串（可选）
        });

        return product;
    }

    /**
     * 更新商品
     * @param productId 待更新商品ID
     * @param sellerId 操作商家ID（验证商品所有权）
     * @param data 商品更新参数（支持部分字段更新）
     * @returns 更新后的商品完整信息
     * @throws ProductError 商品不存在/无权限/分类不存在/slug重复时抛出对应错误
     */
    async updateProduct(productId: string, sellerId: string, data: UpdateProductData) {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 验证商品所有权：仅商品所属商家可更新
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 3. 若修改slug，检查新slug的唯一性（排除自身原slug）
        if (data.slug && data.slug !== product.slug) {
            const existingProduct = await productRepository.findBySlug(data.slug);
            if (existingProduct) {
                throw ProductError.SlugExists;
            }
        }

        // 4. 若修改分类，验证新分类是否存在
        if (data.categoryId) {
            const category = await categoryRepository.findById(data.categoryId);
            if (!category) {
                throw new ProductError('Category not found', 'INVALID_DATA', 400);
            }
        }

        // 5. 处理价格字段：数字转字符串（适配数据库decimal类型）
        const updateData: any = { ...data };
        if (data.price !== undefined) updateData.price = data.price.toString();
        if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice.toString();
        if (data.cost !== undefined) updateData.cost = data.cost.toString();

        // 6. 调用Repository更新商品
        const updatedProduct = await productRepository.update(productId, updateData);
        return updatedProduct;
    }

    /**
     * 发布商品（上架）
     * @param productId 待发布商品ID
     * @param sellerId 操作商家ID（验证所有权）
     * @returns 发布后的商品信息
     * @throws ProductError 商品不存在/无权限时抛出对应错误
     * @description 将商品状态改为活跃、对外展示，记录发布时间
     */
    async publishProduct(productId: string, sellerId: string) {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 验证商品所有权
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 3. 发布商品：更新展示状态+生命周期状态+发布时间
        return await productRepository.update(productId, {
            isPublished: true, // 对外公开展示
            publishedAt: new Date(), // 记录发布时间
            status: 'active' // 商品生命周期改为活跃
        });
    }

    /**
     * 下架商品（取消发布）
     * @param productId 待下架商品ID
     * @param sellerId 操作商家ID（验证所有权）
     * @returns 下架后的商品信息
     * @throws ProductError 商品不存在/无权限时抛出对应错误
     * @description 将商品改为隐藏状态，生命周期回退为草稿
     */
    async unpublishProduct(productId: string, sellerId: string) {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 验证商品所有权
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 3. 下架商品：隐藏展示+生命周期改为草稿
        return await productRepository.update(productId, {
            isPublished: false, // 隐藏商品，前端不可见
            status: 'draft' // 商品生命周期改为草稿
        });
    }

    /**
     * 删除商品
     * @param productId 待删除商品ID
     * @param sellerId 操作商家ID（验证所有权）
     * @throws ProductError 商品不存在/无权限时抛出对应错误
     * @description 物理删除商品（如需软删除需修改Repository层逻辑）
     */
    async deleteProduct(productId: string, sellerId: string) {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 验证商品所有权
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 3. 调用Repository删除商品
        await productRepository.delete(productId);
    }

    /**
     * 获取商品详情（含变体信息）
     * @param productId 商品ID
     * @param incrementView 是否增加浏览次数（默认false）
     * @returns 商品完整详情（含变体信息）
     * @throws ProductError 商品不存在时抛出错误
     */
    async getProductDetail(productId: string, incrementView = false) {
        // 1. 获取商品基础详情（关联分类、商家等信息）
        const product = await productRepository.findWithDetails(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 增加商品浏览次数（如商品详情页访问时调用）
        if (incrementView) {
            await productRepository.incrementViewCount(productId);
        }

        // 3. 获取商品变体（如颜色、尺寸等规格）
        const variants = await productRepository.findVariants(productId);

        // 4. 返回完整详情（基础信息+变体）
        return {
            ...product,
            variants
        };
    }

    /**
     * 获取商品列表（支持筛选）
     * @param filter 筛选条件（价格区间、分类、状态、关键词等）
     * @returns 符合条件的商品列表
     * @description 封装Repository的分页/筛选逻辑，适配前端列表查询
     */
    async getProducts(filter: ProductFilter) {
        return await productRepository.findMany(filter);
    }

    /**
     * 更新商品库存
     * @param productId 商品ID
     * @param sellerId 操作商家ID（验证所有权）
     * @param quantity 待更新的库存数量（直接设置，非增减）
     * @throws ProductError 商品不存在/无权限时抛出错误
     */
    async updateStock(productId: string, sellerId: string, quantity: number) {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 验证商品所有权
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 3. 调用Repository更新库存
        await productRepository.updateStock(productId, quantity);
    }

    /**
     * 检查商品库存是否充足
     * @param productId 商品ID
     * @param quantity 需要的库存数量
     * @returns 库存充足返回true，不足返回false
     * @throws ProductError 商品不存在时抛出错误
     * @description 下单前校验库存，避免超卖
     */
    async checkStock(productId: string, quantity: number): Promise<boolean> {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 校验库存是否≥需要的数量
        return product.stock >= quantity;
    }

    /**
     * 锁定商品库存（扣减库存）
     * @param productId 商品ID
     * @param quantity 需锁定的数量
     * @throws ProductError 商品不存在/库存不足时抛出错误
     * @description 下单时锁定库存，防止并发下单超卖（quantity为正数，内部做减法）
     */
    async reserveStock(productId: string, quantity: number) {
        // 1. 检查商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 校验库存是否充足
        if (product.stock < quantity) {
            throw ProductError.OutOfStock;
        }

        // 3. 扣减库存（传入负数实现扣减）
        await productRepository.updateStock(productId, -quantity);
    }

    /**
     * 释放锁定的库存（恢复库存）
     * @param productId 商品ID
     * @param quantity 需释放的数量
     * @description 订单取消/超时未支付时，恢复之前锁定的库存
     */
    async releaseStock(productId: string, quantity: number) {
        // 直接恢复库存（传入正数实现增加）
        await productRepository.updateStock(productId, quantity);
    }

    /**
     * 创建商品变体（规格）
     * @param productId 主商品ID
     * @param sellerId 操作商家ID（验证所有权）
     * @param data 变体参数（名称、SKU、属性、价格、库存、图片等）
     * @returns 创建成功的变体信息
     * @throws ProductError 商品不存在/无权限时抛出错误
     * @description 为商品添加多规格（如颜色、尺寸），每个变体独立定价/库存
     */
    async createVariant(
        productId: string,
        sellerId: string,
        data: {
            name: string; // 变体名称（如"红色-XL"）
            sku: string; // 变体唯一SKU
            attributes: Record<string, any>; // 变体属性（如{color: 'red', size: 'XL'}）
            price: number; // 变体价格
            stock: number; // 变体库存
            image?: string; // 变体图片（可选）
        }
    ) {
        // 1. 检查主商品是否存在
        const product = await productRepository.findById(productId);
        if (!product) {
            throw ProductError.NotFound;
        }

        // 2. 验证商品所有权
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 3. 调用Repository创建变体
        return await productRepository.createVariant({
            productId, // 关联主商品
            ...data,
            price: data.price // 变体价格（后续可优化为转字符串，同主商品）
        });
    }
}

// 导出商品服务单例，供控制器等上层模块调用
export const productService = new ProductService();