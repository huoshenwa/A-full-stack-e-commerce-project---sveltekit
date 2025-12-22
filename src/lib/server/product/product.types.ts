// src/lib/server/product/product.types.ts
export interface ProductFilter {
    categoryId?: string;
    sellerId?: string;
    status?: 'draft' | 'active' | 'archived';
    isPublished?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'created_desc' | 'sales_desc' | 'rating_desc';
    page?: number;
    pageSize?: number;
}

export interface CreateProductData {
    categoryId?: string;
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    cost?: number;
    sku?: string;
    stock: number;
    lowStockThreshold?: number;
    attributes?: Record<string, any>;
    images?: string[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    status?: 'draft' | 'active' | 'archived';
    isPublished?: boolean;
}

export interface ProductWithDetails {
    id: string;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    seller: {
        id: string;
        displayName: string | null;
    };
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    price: string;
    compareAtPrice: string | null;
    sku: string | null;
    stock: number;
    images: string[];
    attributes: Record<string, any> | null;
    status: string;
    isPublished: boolean;
    rating: string;
    reviewCount: number;
    salesCount: number;
    viewCount: number;
    variants?: ProductVariantData[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductVariantData {
    id: string;
    name: string;
    sku: string;
    attributes: Record<string, any>;
    price: string;
    stock: number;
    image: string | null;
    isActive: boolean;
}

export class ProductError extends Error {
    constructor(
        message: string,
        public code: ProductErrorCode,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'ProductError';
    }

    static NotFound = new ProductError('Product not found', 'PRODUCT_NOT_FOUND', 404);
    static Unauthorized = new ProductError('Unauthorized', 'UNAUTHORIZED', 401);
    static Forbidden = new ProductError('Forbidden', 'FORBIDDEN', 403);
    static InvalidData = new ProductError('Invalid data', 'INVALID_DATA', 400);
    static SlugExists = new ProductError('Slug already exists', 'SLUG_EXISTS', 409);
    static OutOfStock = new ProductError('Product out of stock', 'OUT_OF_STOCK', 400);
}

export type ProductErrorCode =
    | 'PRODUCT_NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INVALID_DATA'
    | 'SLUG_EXISTS'
    | 'OUT_OF_STOCK';