import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user';

/**
 * 收货地址表（addresses）
 * 用于存储用户的收货地址信息，支持一个用户拥有多个地址，并且可以设置默认地址。
 * 地址数据与用户强关联，用户删除时地址也会被级联删除。
 */
export const addresses = pgTable('addresses', {
    /**
     * 地址唯一标识（必填）
     * 使用UUID作为主键，默认生成随机值，确保全局唯一性。
     */
    id: uuid('id').defaultRandom().primaryKey(),

    /**
     * 所属用户ID（必填）
     * 外键关联用户表的id字段，级联删除。
     * 表示该地址属于哪个用户。
     */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    /**
     * 收货人姓名（必填）
     * 用于快递面单打印和收货确认，最长100字符。
     */
    receiverName: varchar('receiver_name', { length: 100 }).notNull(),

    /**
     * 收货人电话（必填）
     * 用于快递员联系收件人，最长20字符，支持手机号或固定电话。
     */
    receiverPhone: varchar('receiver_phone', { length: 20 }).notNull(),

    /**
     * 省份（必填）
     * 收货地址的省级行政区划，最长50字符。
     */
    province: varchar('province', { length: 50 }).notNull(),

    /**
     * 城市（必填）
     * 收货地址的市级行政区划，最长50字符。
     */
    city: varchar('city', { length: 50 }).notNull(),

    /**
     * 区县（必填）
     * 收货地址的区县级行政区划，最长50字符。
     */
    district: varchar('district', { length: 50 }).notNull(),

    /**
     * 街道（必填）
     * 收货地址的街道或乡镇信息，最长200字符。
     */
    street: varchar('street', { length: 200 }).notNull(),

    /**
     * 详细地址（必填）
     * 具体的门牌号、小区、楼栋等信息，最长200字符。
     */
    detailAddress: varchar('detail_address', { length: 200 }).notNull(),

    /**
     * 邮政编码（可选）
     * 用于快递分拣参考，最长10字符。
     */
    postalCode: varchar('postal_code', { length: 10 }),

    /**
     * 地址标签（可选）
     * 如“家”、“公司”等，方便用户快速识别，最长20字符。
     */
    label: varchar('label', { length: 20 }),

    /**
     * 是否默认地址（必填）
     * 布尔类型，默认值为false。
     * 用于标识该地址是否为用户的默认收货地址。
     */
    isDefault: boolean('is_default').default(false).notNull(),

    /**
     * 记录创建时间（必填）
     * 默认值为当前时间，记录地址创建的时间。
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /**
     * 记录更新时间（必填）
     * 默认值为当前时间，记录地址最后更新的时间。
     */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Address - 查询返回类型
 * 从addresses表结构自动推断的类型，包含所有字段，用于查询结果的类型提示。
 */
export type Address = typeof addresses.$inferSelect;

/**
 * NewAddress - 插入数据类型
 * 从addresses表结构自动推断的类型，用于插入新地址时的类型提示。
 */
export type NewAddress = typeof addresses.$inferInsert;