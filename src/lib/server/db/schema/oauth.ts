// src/lib/server/db/schema/oauth.ts
import { pgTable, uuid, varchar, timestamp, text, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user';

export const oauthAccounts = pgTable('oauth_accounts', {
    provider: varchar('provider', { length: 50 }).notNull(), // google, wechat, qq, facebook
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    email: varchar('email', { length: 255 }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ([
    primaryKey({ columns: [table.provider, table.providerUserId] })
]));

export type OAuthAccount = typeof oauthAccounts.$inferSelect;