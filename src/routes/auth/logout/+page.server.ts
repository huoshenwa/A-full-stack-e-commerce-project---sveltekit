// src/routes/auth/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ fetch }) => {
        await fetch('/api/auth/logout', { method: 'POST' });
        throw redirect(302, '/auth/login');
    }
};