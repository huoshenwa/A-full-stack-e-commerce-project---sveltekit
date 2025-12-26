// src/lib/server/db/schema/session.ts
import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './user'; // 导入用户表schema，关联会话所属用户

/**
 * 用户会话表（sessions）
 * 存储用户登录后的会话信息，实现用户登录状态管理、多端登录控制、会话安全审计等功能，
 * 是系统身份认证和状态保持的核心表
 */
export const sessions = pgTable('sessions', {
    /** 会话唯一标识（主键）：UUID类型，默认自动生成随机值
     * 作为用户登录态的核心标识，对应前端存储的sessionId（如cookie/token）
     */
    id: uuid('id').defaultRandom().primaryKey(),

    /** 关联用户ID（必填）：外键关联users表，级联删除（用户删除时，关联的所有会话自动失效）
     * 核心作用：绑定会话到具体用户，实现「用户-会话」的一对多关联（支持多端登录）
     */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    /** 会话过期时间（必填）：时间戳类型
     * 控制会话的有效时长（如2小时/7天），过期后用户需重新登录，保障账号安全
     * 前端可根据该字段判断登录态是否失效，后端校验会话时需检查该时间
     */
    expiresAt: timestamp('expires_at').notNull(),

    /** 登录IP地址（可选）：字符串类型（最长45字符）
     * 存储用户登录时的IP地址（IPv4最长15字符，IPv6最长39字符，45为预留长度）
     * 用于安全审计（如异常IP登录提醒）、多端登录管理（展示登录设备IP）
     */
    ipAddress: varchar('ip_address', { length: 45 }),

    /** 客户端用户代理（可选）：字符串类型（最长500字符）
     * 存储用户登录设备的浏览器/系统信息（如"Mozilla/5.0 (MacOS) Chrome/120.0.0.0"）
     * 用于安全审计（如异常设备登录提醒）、多端登录管理（展示登录设备信息）
     */
    userAgent: varchar('user_agent', { length: 500 }),

    /** 会话创建时间（必填）：时间戳类型，默认当前时间
     * 记录用户登录成功、会话创建的时间，用于会话生命周期管理（如清理过期会话）
     */
    createdAt: timestamp('created_at').defaultNow().notNull()
});

/**
 * Session - 会话查询返回类型
 * 从sessions表结构自动推断的类型，包含所有字段，用于查询会话结果的类型提示
 * 典型用途：获取用户当前登录会话、校验会话有效性、展示多端登录列表
 */
export type Session = typeof sessions.$inferSelect;