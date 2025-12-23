// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
// import { DATABASE_URL } from '$env/static/private';
import * as userSchema from './schema/user';
import * as roleSchema from './schema/role';
import * as sessionSchema from './schema/session';
import * as oauthSchema from './schema/oauth';
import * as promotion from './schema/promotion';
import * as product from './schema/product';

import 'dotenv/config';
export const DATABASE_URL = process.env.DATABASE_URL!;
const client = postgres(DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
});

export const db = drizzle(client, {
    schema: {
        ...userSchema,
        ...roleSchema,
        ...sessionSchema,
        ...oauthSchema,
        ...promotion,
        ...product,
    }
});

export * from './schema/user';
export * from './schema/role';
export * from './schema/session';
export * from './schema/oauth';
export * from './schema/promotion';
export * from './schema/product';