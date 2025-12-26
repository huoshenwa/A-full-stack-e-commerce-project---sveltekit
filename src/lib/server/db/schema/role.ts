// src/lib/server/db/schema/role.ts
import { pgTable, serial, varchar, timestamp, uuid, integer, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user'; // 导入用户表schema，用于关联用户-角色关系

/**
 * 角色表（roles）
 * 存储系统预设的角色信息，实现基于角色的权限控制（RBAC）核心模型，
 * 角色是权限的集合，通过关联权限表实现「给角色赋权、给用户分配角色」的权限管理逻辑
 */
export const roles = pgTable('roles', {
    /** 角色唯一标识（主键）：自增整数类型，便于快速查询和关联 */
    id: serial('id').primaryKey(),
    /** 角色编码（必填，唯一）：字符串类型（最长50字符），用于代码中识别角色（如"admin"、"seller"、"customer"）
     * 编码需唯一且固定，避免硬编码名称导致的维护问题
     */
    code: varchar('code', { length: 50 }).unique().notNull(),
    /** 角色名称（必填）：字符串类型（最长100字符），用于后台展示（如"超级管理员"、"商家"、"普通用户"） */
    name: varchar('name', { length: 100 }).notNull(),
    /** 角色描述（可选）：字符串类型（最长255字符），说明角色的权限范围/适用人群（如"超级管理员拥有系统所有操作权限"） */
    description: varchar('description', { length: 255 }),
    /** 角色创建时间（必填）：时间戳类型，默认当前时间，记录角色创建时间（系统预设角色通常为初始化时创建） */
    createdAt: timestamp('created_at').defaultNow().notNull()
});

/**
 * 权限表（permissions）
 * 存储系统最小粒度的操作权限，是RBAC模型的基础单元，
 * 每个权限对应一个具体操作（如"商品创建"、"订单查看"、"用户删除"）
 */
export const permissions = pgTable('permissions', {
    /** 权限唯一标识（主键）：自增整数类型，便于快速查询和关联 */
    id: serial('id').primaryKey(),
    /** 权限编码（必填，唯一）：字符串类型（最长100字符），用于代码中识别权限（如"product:create"、"order:read"、"user:delete"）
     * 推荐采用「资源:操作」的命名规范，便于权限管理和识别
     */
    code: varchar('code', { length: 100 }).unique().notNull(),
    /** 权限名称（必填）：字符串类型（最长100字符），用于后台展示（如"创建商品"、"查看订单"、"删除用户"） */
    name: varchar('name', { length: 100 }).notNull(),
    /** 权限描述（可选）：字符串类型（最长255字符），说明权限对应的具体操作范围（如"允许创建和编辑商品信息"） */
    description: varchar('description', { length: 255 }),
    /** 权限创建时间（必填）：时间戳类型，默认当前时间，记录权限创建时间（系统初始化时预设） */
    createdAt: timestamp('created_at').defaultNow().notNull()
});

/**
 * 角色-权限关联表（role_permissions）
 * 多对多关联表，实现「一个角色拥有多个权限、一个权限可分配给多个角色」的核心逻辑，
 * 是RBAC模型中角色和权限的桥梁
 */
export const rolePermissions = pgTable('role_permissions', {
    /** 角色ID（必填）：外键关联roles表，级联删除（角色删除时，关联的权限分配关系也删除） */
    roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    /** 权限ID（必填）：外键关联permissions表，级联删除（权限删除时，关联的角色分配关系也删除） */
    permissionId: integer('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull()
}, (table) => ([
    /** 复合主键：roleId + permissionId
     * 核心作用：保证「一个权限在同一个角色中只分配一次」，避免重复赋权导致的逻辑混乱
     */
    primaryKey({ columns: [table.roleId, table.permissionId] })
]));

/**
 * 用户-角色关联表（user_roles）
 * 多对多关联表，实现「一个用户可拥有多个角色、一个角色可分配给多个用户」的核心逻辑，
 * 是RBAC模型中用户和角色的桥梁
 */
export const userRoles = pgTable('user_roles', {
    /** 用户ID（必填）：外键关联users表，级联删除（用户删除时，关联的角色分配关系也删除） */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    /** 角色ID（必填）：外键关联roles表，级联删除（角色删除时，关联的用户分配关系也删除） */
    roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    /** 角色分配时间（必填）：时间戳类型，默认当前时间，记录用户被分配该角色的时间 */
    assignedAt: timestamp('assigned_at').defaultNow().notNull()
}, (table) => ([
    /** 复合主键：userId + roleId
     * 核心作用：保证「一个角色给同一个用户只分配一次」，避免重复分配导致的权限叠加错误
     */
    primaryKey({ columns: [table.userId, table.roleId] })
]));

/**
 * Role - 角色查询返回类型
 * 从roles表结构自动推断的类型，包含所有字段，用于查询角色结果的类型提示
 */
export type Role = typeof roles.$inferSelect;

/**
 * Permission - 权限查询返回类型
 * 从permissions表结构自动推断的类型，包含所有字段，用于查询权限结果的类型提示
 */
export type Permission = typeof permissions.$inferSelect;