// src/lib/server/product/category.repository.ts
/**
 * 分类数据访问层（Repository）
 * 负责分类相关的数据库操作，封装所有与categories表的交互逻辑
 * 遵循单一职责原则，仅处理数据持久化相关操作
 */
import { eq, isNull, sql } from 'drizzle-orm';
import { db, categories } from '../db'; // 数据库连接实例和categories表schema

/**
 * 分类仓库类
 * 提供分类的CRUD、树形结构构建、关联统计等数据库操作方法
 */
export class CategoryRepository {
    /**
     * 根据ID查询单个分类
     * @param id 分类ID
     * @returns 单个分类对象（不存在则返回undefined）
     */
    async findById(id: string) {
        // 1. 从categories表中查询指定ID的分类
        // 2. 使用eq条件匹配ID，limit 1确保只返回一条结果
        // 3. 解构数组获取第一个元素（匹配结果）
        const [category] = await db
            .select() // 查询所有字段
            .from(categories) // 操作categories表
            .where(eq(categories.id, id)) // 条件：ID等于传入值
            .limit(1); // 限制结果数量为1

        // 4. 返回查询到的分类对象（无匹配则为undefined）
        return category;
    }

    /**
     * 根据Slug查询单个分类
     * @param slug 分类别名（URL友好的唯一标识）
     * @returns 单个分类对象（不存在则返回undefined）
     */
    async findBySlug(slug: string) {
        // 1. 从categories表中查询指定slug的分类
        // 2. 使用eq条件匹配slug，limit 1确保只返回一条结果
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, slug)) // 条件：slug等于传入值
            .limit(1);

        // 2. 返回查询到的分类对象
        return category;
    }

    /**
     * 查询所有分类（支持筛选活跃状态）
     * @param includeInactive 是否包含非活跃分类（默认false，只查活跃）
     * @returns 分类列表数组
     */
    async findAll(includeInactive = false) {
        // 1. 构建查询条件：
        //    - 若includeInactive为true：不设置条件（返回所有）
        //    - 若includeInactive为false：只返回isActive=true的分类
        const conditions = includeInactive ? undefined : eq(categories.isActive, true);

        // 2. 执行查询：
        //    - 从categories表查询
        //    - 应用条件筛选
        //    - 先按sortOrder排序，再按name排序
        const result = await db
            .select()
            .from(categories)
            .where(conditions) // 应用条件（可能为undefined）
            .orderBy(categories.sortOrder, categories.name); // 排序规则：先排序号，再排名称

        // 3. 返回分类列表
        return result;
    }

    /**
     * 查询根分类（无父级的分类）
     * @returns 根分类列表数组
     */
    async findRootCategories() {
        // 1. 执行查询：
        //    - 条件：parentId为null（无父级）
        //    - 按sortOrder排序
        const result = await db
            .select()
            .from(categories)
            .where(isNull(categories.parentId)) // 条件：parentId为空
            .orderBy(categories.sortOrder); // 按排序号升序排列

        // 2. 返回根分类列表
        return result;
    }

    /**
     * 查询指定父分类的子分类
     * @param parentId 父分类ID
     * @returns 子分类列表数组
     */
    async findChildren(parentId: string) {
        // 1. 执行查询：
        //    - 条件：parentId等于传入值
        //    - 按sortOrder排序
        const result = await db
            .select()
            .from(categories)
            .where(eq(categories.parentId, parentId)) // 条件：父ID匹配
            .orderBy(categories.sortOrder);

        // 2. 返回子分类列表
        return result;
    }

    /**
     * 构建分类树形结构
     * @returns 树形结构的分类列表（根分类包含children属性，递归嵌套子分类）
     */
    async findTree() {
        // 步骤1：获取所有活跃分类的扁平列表
        const allCategories = await this.findAll();

        // 步骤2：创建分类ID到分类对象的映射（并初始化children数组）
        const categoryMap = new Map();
        allCategories.forEach(cat => {
            // 为每个分类添加children属性，用于存储子分类
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // 步骤3：构建树形结构
        const roots: any[] = []; // 存储根分类（最终返回的树形结构入口）
        allCategories.forEach(cat => {
            // 获取当前分类的映射节点（包含children属性）
            const node = categoryMap.get(cat.id);

            if (cat.parentId) {
                // 情况1：当前分类有父ID → 找到父节点并添加为子节点
                const parent = categoryMap.get(cat.parentId);
                if (parent) { // 防止父分类不存在的异常
                    parent.children.push(node);
                }
            } else {
                // 情况2：当前分类无父ID → 作为根节点加入roots数组
                roots.push(node);
            }
        });

        // 步骤4：返回树形结构的根分类列表
        return roots;
    }

    /**
     * 创建新分类
     * @param data 分类创建数据（必填：name、slug；可选：description、parentId、imageUrl、sortOrder）
     * @returns 新建的分类对象（包含数据库自动生成的字段如id、createdAt等）
     */
    async create(data: {
        name: string;
        slug: string;
        description?: string;
        parentId?: string;
        imageUrl?: string;
        sortOrder?: number;
    }) {
        // 1. 插入数据到categories表
        // 2. 使用returning()返回插入后的完整记录
        const [category] = await db
            .insert(categories) // 执行插入操作
            .values(data) // 插入的数据对象
            .returning(); // 返回插入后的记录

        // 3. 返回新建的分类对象
        return category;
    }

    /**
     * 更新指定ID的分类
     * @param id 分类ID
     * @param data 要更新的字段（支持部分更新）
     * @returns 更新后的分类对象（不存在则返回undefined）
     */
    async update(id: string, data: Partial<{
        name: string;
        slug: string;
        description: string;
        parentId: string;
        imageUrl: string;
        sortOrder: number;
        isActive: boolean;
    }>) {
        // 1. 执行更新操作：
        //    - 合并更新数据和updatedAt字段（自动更新修改时间）
        //    - 条件匹配指定ID
        //    - 返回更新后的记录
        const [category] = await db
            .update(categories) // 执行更新操作
            .set({
                ...data, // 传入的更新字段
                updatedAt: new Date() // 强制更新修改时间
            })
            .where(eq(categories.id, id)) // 条件：ID匹配
            .returning(); // 返回更新后的记录

        // 2. 返回更新后的分类对象
        return category;
    }

    /**
     * 删除指定ID的分类
     * @param id 分类ID
     * @returns 无返回值（执行删除操作）
     */
    async delete(id: string) {
        // 1. 执行删除操作：条件匹配指定ID
        await db
            .delete(categories) // 执行删除操作
            .where(eq(categories.id, id)); // 条件：ID匹配

        // 2. 无返回值（删除成功无数据返回）
    }

    /**
     * 统计指定分类下的产品数量
     * @param categoryId 分类ID
     * @returns 产品数量（数字类型）
     */
    async getProductCount(categoryId: string) {
        // 1. 执行原生SQL查询：统计products表中关联当前分类的记录数
        const result = await db.execute(sql`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE category_id = ${categoryId}
        `);
        // Drizzle 聚合查询：统计分类下的商品数
        // const result = await db
        //     .select({ count: count() }) // 等价于 COUNT(*)
        //     .from(products)
        //     .where(eq(products.categoryId, categoryId)); // 等价于 WHERE category_id = $1
        // 2. 处理查询结果：
        //    - 提取count字段值
        //    - 转换为数字类型（无结果则返回0）
        return Number(result.rows[0]?.count || 0);
    }
}

/**
 * 分类仓库实例化导出
 * 供业务层直接使用，无需重复创建实例
 */
export const categoryRepository = new CategoryRepository();