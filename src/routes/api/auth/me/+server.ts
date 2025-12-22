// src/routes/api/auth/me/+server.ts
import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth/auth.guard';
import { AuthError } from '$lib/server/auth/auth.types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        requireAuth(locals.user);

        return json({
            user: {
                id: locals.user.id,
                email: locals.user.email,
                displayName: locals.user.displayName,
                avatarUrl: locals.user.avatarUrl,
                roles: locals.user.roles,
                permissions: locals.user.permissions
            }
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return json({ error: err.message }, { status: err.statusCode });
        }

        return json({ error: 'Internal server error' }, { status: 500 });
    }
};