// src/lib/server/db/schema/user.ts
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * 用户核心表（users）
 * 存储系统所有用户的基础核心信息，包括账号认证、个人资料、状态控制等，
 * 是电商系统用户体系的基础表，关联会话、订单、评论、角色等所有用户相关表
 */
export const users = pgTable('users', {
    /** 用户唯一标识（主键）：UUID类型，默认自动生成随机值
     * 作为用户的核心标识，关联所有用户相关表（会话、订单、评论等），避免自增ID泄露用户数量
     */
    id: uuid('id').defaultRandom().primaryKey(),

    /** 用户邮箱（必填，唯一）：字符串类型（最长255字符）
     * 作为用户的登录账号/身份标识，unique约束确保邮箱不重复，是系统内唯一的账号名
     * 同时用于邮箱验证、密码找回、系统通知等核心功能
     */
    email: varchar('email', { length: 255 }).unique().notNull(),

    /** 密码哈希值（可选）：字符串类型（最长255字符）
     * 存储用户密码的加密哈希值（如bcrypt/argon2加密结果），而非明文密码，保障账号安全
     * 第三方登录（如微信/谷歌）的用户该字段为空（无需密码）
     */
    passwordHash: varchar('password_hash', { length: 255 }),

    /** 用户昵称（可选）：字符串类型（最长100字符）
     * 用于前端展示的用户名（如"张三"、"电商小卖家"），而非邮箱，提升用户体验
     * 未设置时可默认展示邮箱前缀（如"zhangsan***@xxx.com"）
     */
    displayName: varchar('display_name', { length: 100 }),

    /** 头像URL（可选）：字符串类型（最长500字符）
     * 存储用户头像的远程/本地URL地址，适配不同存储方案（如OSS、本地服务器）
     * 未设置时使用系统默认头像
     */
    avatarUrl: varchar('avatar_url', { length: 500 }),

    /** 账号是否激活（必填，默认true）：布尔类型
     * true=账号正常可用，false=账号被禁用（如违规、后台手动封禁）
     * 禁用后用户无法登录、下单等操作，是账号风控的核心字段
     */
    isActive: boolean('is_active').default(true).notNull(),

    /** 邮箱是否验证（必填，默认false）：布尔类型
     * true=用户已验证邮箱（点击验证链接/验证码），false=未验证
     * 用于提升账号安全性（如验证后才可修改密码）、提升用户信任度（评论/商家入驻需验证）
     */
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),

    /** 用户创建时间（必填）：时间戳类型，默认当前时间
     * 记录用户注册/账号创建的时间，用于用户增长统计、新用户权益等业务
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /** 用户信息更新时间（必填）：时间戳类型，默认当前时间
     * 记录用户资料（昵称、头像）、状态（激活/禁用）最后修改的时间，便于数据审计
     */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * User - 用户查询返回类型
 * 从users表结构自动推断的类型，包含所有字段，用于查询用户信息时的类型提示
 * 典型用途：获取登录用户信息、后台管理用户列表、关联查询用户相关数据（如订单所属用户）
 */
export type User = typeof users.$inferSelect;

/**
 * NewUser - 用户创建传入类型
 * 从users表结构自动推断的类型，排除自动生成字段（如id、createdAt、updatedAt），用于创建用户时的参数校验
 * 典型用途：用户注册、后台创建用户、第三方登录同步用户信息
 */
export type NewUser = typeof users.$inferInsert;