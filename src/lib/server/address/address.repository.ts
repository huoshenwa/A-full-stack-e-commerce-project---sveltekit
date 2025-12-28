import { eq, and } from 'drizzle-orm';
import { db, addresses } from '../db';

/**
 * 地址数据访问层（Repository）
 * 封装了与用户收货地址相关的所有数据库操作，提供统一的CRUD接口。
 * 核心职责：
 * 1. 实现地址的查询、创建、更新、删除等基础操作
 * 2. 处理"默认地址"的业务逻辑（同一用户只能有一个默认地址）
 * 3. 提供用户级别的数据隔离（确保用户只能操作自己的地址）
 * 4. 隐藏底层数据库实现细节，对外暴露简洁的业务接口
 */
export class AddressRepository {
    /**
     * 根据用户ID查询所有地址
     * @param userId - 用户唯一标识（UUID）
     * @returns Promise<Address[]> - 返回该用户的所有地址数组
     * @description 
     * - 查询结果按"是否默认地址"和"创建时间"排序
     * - 默认地址会排在前面，便于前端优先展示
     * - 适用于用户地址列表页面数据加载
     */
    async findByUserId(userId: string) {
        return await db
            .select()
            .from(addresses)
            .where(eq(addresses.userId, userId))
            .orderBy(addresses.isDefault, addresses.createdAt);
    }

    /**
     * 根据地址ID查询地址详情
     * @param id - 地址唯一标识（UUID）
     * @param userId - 可选参数，用户唯一标识
     * @returns Promise<Address | undefined> - 返回地址详情或undefined
     * @description
     * - 若提供userId参数，会额外验证地址归属，确保数据安全
     * - 若不提供userId，可用于管理员等特权角色查询任意地址
     * - 适用于地址详情查看、编辑页面数据加载
     */
    async findById(id: string, userId?: string) {
        const conditions = [eq(addresses.id, id)];
        if (userId) {
            conditions.push(eq(addresses.userId, userId));
        }

        const [address] = await db
            .select()
            .from(addresses)
            .where(and(...conditions))
            .limit(1);

        return address;
    }

    /**
     * 创建新地址
     * @param data - 地址创建参数
     * @returns Promise<Address> - 返回创建后的完整地址对象
     * @description
     * - 自动处理默认地址逻辑：若设为默认，会先取消该用户其他地址的默认状态
     * - 支持部分字段可选（postalCode、label、isDefault）
     * - 自动生成id、createdAt、updatedAt字段
     * - 适用于用户添加新收货地址场景
     */
    async create(data: {
        userId: string;
        receiverName: string;
        receiverPhone: string;
        province: string;
        city: string;
        district: string;
        street: string;
        detailAddress: string;
        postalCode?: string;
        label?: string;
        isDefault?: boolean;
    }) {
        // 默认地址唯一性保障：新地址设为默认时，先清除该用户其他默认地址
        if (data.isDefault) {
            await db
                .update(addresses)
                .set({ isDefault: false })
                .where(eq(addresses.userId, data.userId));
        }

        const [address] = await db.insert(addresses).values(data).returning();
        return address;
    }

    /**
     * 更新地址信息
     * @param id - 地址唯一标识
     * @param userId - 用户唯一标识
     * @param data - 地址更新参数（部分字段可选）
     * @returns Promise<Address | undefined> - 返回更新后的地址对象或undefined
     * @description
     * - 强制验证地址归属（userId必须匹配），防止越权操作
     * - 自动处理默认地址逻辑：若设为默认，会先取消该用户其他地址的默认状态
     * - 自动更新updatedAt字段为当前时间
     * - 适用于用户编辑已有地址场景
     */
    async update(id: string, userId: string, data: Partial<{
        receiverName: string;
        receiverPhone: string;
        province: string;
        city: string;
        district: string;
        street: string;
        detailAddress: string;
        postalCode: string;
        label: string;
        isDefault: boolean;
    }>) {
        // 默认地址唯一性保障：更新为默认时，先清除该用户其他默认地址
        if (data.isDefault) {
            await db
                .update(addresses)
                .set({ isDefault: false })
                .where(and(
                    eq(addresses.userId, userId),
                    eq(addresses.id, id)
                ));
        }

        const [address] = await db
            .update(addresses)
            .set({ ...data, updatedAt: new Date() })
            .where(and(
                eq(addresses.id, id),
                eq(addresses.userId, userId)
            ))
            .returning();

        return address;
    }

    /**
     * 删除地址
     * @param id - 地址唯一标识
     * @param userId - 用户唯一标识
     * @returns Promise<void>
     * @description
     * - 强制验证地址归属，防止越权删除
     * - 无返回值，删除成功即完成操作
     * - 适用于用户删除不需要的地址场景
     */
    async delete(id: string, userId: string) {
        await db
            .delete(addresses)
            .where(and(
                eq(addresses.id, id),
                eq(addresses.userId, userId)
            ));
    }

    /**
     * 获取用户默认地址
     * @param userId - 用户唯一标识
     * @returns Promise<Address | undefined> - 返回默认地址或undefined
     * @description
     * - 查询条件：userId匹配且isDefault为true
     * - 若用户没有设置默认地址，返回undefined
     * - 适用于下单时自动填充收货地址场景
     */
    async getDefaultAddress(userId: string) {
        const [address] = await db
            .select()
            .from(addresses)
            .where(and(
                eq(addresses.userId, userId),
                eq(addresses.isDefault, true)
            ))
            .limit(1);

        return address;
    }
}

/**
 * 地址仓库实例
 * 提供全局共享的地址操作入口，避免重复创建实例
 * 使用方式：import { addressRepository } from './address.repository'
 */
export const addressRepository = new AddressRepository();