// src/lib/server/db/schema/role.ts
import { pgTable, serial, varchar, timestamp, uuid, integer, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user';

export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 50 }).unique().notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const permissions = pgTable('permissions', {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 100 }).unique().notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rolePermissions = pgTable('role_permissions', {
    roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    permissionId: integer('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull()
}, (table) => ([
    primaryKey({ columns: [table.roleId, table.permissionId] }) // 主键配置放入数组
]));

export const userRoles = pgTable('user_roles', {
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull()
}, (table) => ([
    primaryKey({ columns: [table.userId, table.roleId] })
]));

export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;