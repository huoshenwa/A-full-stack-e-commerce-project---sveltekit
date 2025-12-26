// src/lib/server/product/category.service.ts
import { categoryRepository } from './category.repository';
import { ProductError } from './product.types';

export class CategoryService {
    /**
     * 创建分类
     */
    async createCategory(data: {
        name: string;
        slug: string;
        description?: string;
        parentId?: string;
        imageUrl?: string;
        sortOrder?: number;
    }) {
        // 检查 slug 唯一性
        const existing = await categoryRepository.findBySlug(data.slug);
        if (existing) {
            throw new ProductError('Slug already exists', 'SLUG_EXISTS', 409);
        }

        // 如果有父分类，验证父分类存在
        if (data.parentId) {
            const parent = await categoryRepository.findById(data.parentId);
            if (!parent) {
                throw new ProductError('Parent category not found', 'INVALID_DATA', 400);
            }
        }

        return await categoryRepository.create(data);
    }

    /**
     * 更新分类
     */
    async updateCategory(
        categoryId: string,
        data: Partial<{
            name: string;
            slug: string;
            description: string;
            parentId: string;
            imageUrl: string;
            sortOrder: number;
            isActive: boolean;
        }>
    ) {
        const category = await categoryRepository.findById(categoryId);

        if (!category) {
            throw new ProductError('Category not found', 'PRODUCT_NOT_FOUND', 404);
        }

        // 如果修改 slug，检查唯一性
        if (data.slug && data.slug !== category.slug) {
            const existing = await categoryRepository.findBySlug(data.slug);
            if (existing) {
                throw new ProductError('Slug already exists', 'SLUG_EXISTS', 409);
            }
        }

        // 如果修改父分类，验证不会形成循环引用
        if (data.parentId) {
            if (data.parentId === categoryId) {
                throw new ProductError('Category cannot be its own parent', 'INVALID_DATA', 400);
            }

            // 检查是否会形成循环
            let currentParentId: string | null = data.parentId;
            while (currentParentId) {
                if (currentParentId === categoryId) {
                    throw new ProductError('Circular reference detected', 'INVALID_DATA', 400);
                }
                const parent = await categoryRepository.findById(currentParentId);
                currentParentId = parent?.parentId || null;
            }
        }

        return await categoryRepository.update(categoryId, data);
    }

    /**
     * 删除分类
     */
    async deleteCategory(categoryId: string) {
        const category = await categoryRepository.findById(categoryId);

        if (!category) {
            throw new ProductError('Category not found', 'PRODUCT_NOT_FOUND', 404);
        }

        // 检查是否有子分类
        const children = await categoryRepository.findChildren(categoryId);
        if (children.length > 0) {
            throw new ProductError('Cannot delete category with children', 'INVALID_DATA', 400);
        }

        // 检查是否有商品
        const productCount = await categoryRepository.getProductCount(categoryId);
        if (productCount > 0) {
            throw new ProductError('Cannot delete category with products', 'INVALID_DATA', 400);
        }

        await categoryRepository.delete(categoryId);
    }

    /**
     * 获取分类树
     */
    async getCategoryTree() {
        return await categoryRepository.findTree();
    }

    /**
     * 获取所有分类
     */
    async getAllCategories(includeInactive = false) {
        return await categoryRepository.findAll(includeInactive);
    }

    /**
     * 获取根分类
     */
    async getRootCategories() {
        return await categoryRepository.findRootCategories();
    }

    /**
     * 获取子分类
     */
    async getChildren(parentId: string) {
        return await categoryRepository.findChildren(parentId);
    }
}

export const categoryService = new CategoryService();