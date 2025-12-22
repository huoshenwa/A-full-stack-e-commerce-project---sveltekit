// src/lib/server/product/product.service.ts
import { productRepository } from './product.repository';
import { categoryRepository } from './category.repository';
import { ProductError } from './product.types';
import type { CreateProductData, UpdateProductData, ProductFilter } from './product.types';

export class ProductService {
    /**
     * 创建商品
     */
    async createProduct(sellerId: string, data: CreateProductData) {
        // 验证分类
        if (data.categoryId) {
            const category = await categoryRepository.findById(data.categoryId);
            if (!category) {
                throw new ProductError('Category not found', 'INVALID_DATA', 400);
            }
        }

        // 检查 slug 唯一性
        const existingProduct = await productRepository.findBySlug(data.slug);
        if (existingProduct) {
            throw ProductError.SlugExists;
        }

        // 创建商品
        const product = await productRepository.create({
            ...data,
            sellerId,
            price: data.price.toString(),
            compareAtPrice: data.compareAtPrice?.toString(),
            cost: data.cost?.toString()
        });

        return product;
    }

    /**
     * 更新商品
     */
    async updateProduct(productId: string, sellerId: string, data: UpdateProductData) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        // 验证所有权
        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        // 如果修改 slug，检查唯一性
        if (data.slug && data.slug !== product.slug) {
            const existingProduct = await productRepository.findBySlug(data.slug);
            if (existingProduct) {
                throw ProductError.SlugExists;
            }
        }

        // 如果修改分类，验证分类
        if (data.categoryId) {
            const category = await categoryRepository.findById(data.categoryId);
            if (!category) {
                throw new ProductError('Category not found', 'INVALID_DATA', 400);
            }
        }

        const updateData: any = { ...data };
        if (data.price !== undefined) updateData.price = data.price.toString();
        if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice.toString();
        if (data.cost !== undefined) updateData.cost = data.cost.toString();

        const updatedProduct = await productRepository.update(productId, updateData);
        return updatedProduct;
    }

    /**
     * 发布商品
     */
    async publishProduct(productId: string, sellerId: string) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        return await productRepository.update(productId, {
            isPublished: true,
            publishedAt: new Date(),
            status: 'active'
        });
    }

    /**
     * 下架商品
     */
    async unpublishProduct(productId: string, sellerId: string) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        return await productRepository.update(productId, {
            isPublished: false,
            status: 'draft'
        });
    }

    /**
     * 删除商品
     */
    async deleteProduct(productId: string, sellerId: string) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        await productRepository.delete(productId);
    }

    /**
     * 获取商品详情
     */
    async getProductDetail(productId: string, incrementView = false) {
        const product = await productRepository.findWithDetails(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        // 增加浏览次数
        if (incrementView) {
            await productRepository.incrementViewCount(productId);
        }

        // 获取变体
        const variants = await productRepository.findVariants(productId);

        return {
            ...product,
            variants
        };
    }

    /**
     * 获取商品列表
     */
    async getProducts(filter: ProductFilter) {
        return await productRepository.findMany(filter);
    }

    /**
     * 库存管理
     */
    async updateStock(productId: string, sellerId: string, quantity: number) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        await productRepository.updateStock(productId, quantity);
    }

    async checkStock(productId: string, quantity: number): Promise<boolean> {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        return product.stock >= quantity;
    }

    async reserveStock(productId: string, quantity: number) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        if (product.stock < quantity) {
            throw ProductError.OutOfStock;
        }

        await productRepository.updateStock(productId, -quantity);
    }

    async releaseStock(productId: string, quantity: number) {
        await productRepository.updateStock(productId, quantity);
    }

    /**
     * 商品变体管理
     */
    async createVariant(
        productId: string,
        sellerId: string,
        data: {
            name: string;
            sku: string;
            attributes: Record<string, any>;
            price: number;
            stock: number;
            image?: string;
        }
    ) {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw ProductError.NotFound;
        }

        if (product.sellerId !== sellerId) {
            throw ProductError.Forbidden;
        }

        return await productRepository.createVariant({
            productId,
            ...data,
            price: data.price
        });
    }
}

export const productService = new ProductService();