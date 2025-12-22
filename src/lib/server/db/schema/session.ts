// src/lib/server/db/schema/session.ts
import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './user';

export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Session = typeof sessions.$inferSelect;
