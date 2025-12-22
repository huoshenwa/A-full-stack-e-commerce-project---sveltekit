// src/lib/server/db/schema/user.ts
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    displayName: varchar('display_name', { length: 100 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    isActive: boolean('is_active').default(true).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;