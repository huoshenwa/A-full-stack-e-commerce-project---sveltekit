// src/lib/types.ts

export interface User {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    roles: string[];
    permissions: string[];
}

export interface Product {
    id: string;
    categoryId: string | null;
    categoryName: string | null;
    sellerId: string;
    sellerName: string | null;
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
    variants?: ProductVariant[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    attributes: Record<string, any>;
    price: string;
    stock: number;
    image: string | null;
    isActive: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    children?: Category[];
    level?: number;
}

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
}