// src/lib/server/db/schema/oauth.ts
import { pgTable, uuid, varchar, timestamp, text, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user'; // 导入用户表schema，用于关联OAuth账号所属用户

/**
 * OAuth第三方账号关联表（oauth_accounts）
 * 存储用户通过第三方平台（谷歌/微信/QQ/脸书等）登录的关联信息，
 * 实现「一个用户绑定多个第三方账号」的业务逻辑，同时保证第三方账号的唯一性
 */
export const oauthAccounts = pgTable('oauth_accounts', {
    /**
     * 第三方登录服务商标识（必填）
     * 枚举值示例：google(谷歌)、wechat(微信)、qq(QQ)、facebook(脸书)
     * 用于区分不同的登录渠道，最长50字符
     */
    provider: varchar('provider', { length: 50 }).notNull(),

    /**
     * 第三方服务商的用户唯一ID（必填）
     * 由第三方平台生成（如微信openid、谷歌sub），最长255字符
     * 同一服务商下该ID唯一标识一个用户
     */
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),

    /**
     * 关联的系统内用户ID（必填）
     * 外键关联users表的id字段，级联删除（用户删除时，关联的OAuth账号也删除）
     * 实现「第三方账号绑定到系统用户」的核心关联逻辑
     */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    /**
     * 第三方账号的邮箱（可选）
     * 部分第三方平台（如谷歌）返回的用户邮箱，最长255字符
     * 用于辅助识别用户，非核心字段
     */
    email: varchar('email', { length: 255 }),

    /**
     * 第三方平台返回的访问令牌（可选）
     * 用于调用第三方平台API（如获取用户信息、发布内容）
     * 长文本类型，适配令牌可能的超长长度
     */
    accessToken: text('access_token'),

    /**
     * 第三方平台返回的刷新令牌（可选）
     * 用于过期后刷新accessToken，避免用户重新授权
     * 长文本类型，适配令牌可能的超长长度
     */
    refreshToken: text('refresh_token'),

    /**
     * accessToken的过期时间（可选）
     * 时间戳类型，记录令牌失效时间，用于判断是否需要刷新
     */
    expiresAt: timestamp('expires_at'),

    /**
     * 记录创建时间（必填）
     * 默认值为当前时间，记录用户首次绑定该第三方账号的时间
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /**
     * 记录更新时间（必填）
     * 默认值为当前时间，记录令牌/邮箱等信息最后更新的时间
     */
    updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ([
    /**
     * 复合主键约束：provider + providerUserId
     * 核心作用：保证「同一第三方平台的同一用户」只能绑定一次，避免重复关联
     * 例如：微信的同一个openid只能对应一条记录，防止重复创建
     */
    primaryKey({ columns: [table.provider, table.providerUserId] })
]));

/**
 * OAuthAccount - 查询返回类型
 * 从oauthAccounts表结构自动推断的类型，包含所有字段，用于查询结果的类型提示
 */
export type OAuthAccount = typeof oauthAccounts.$inferSelect;