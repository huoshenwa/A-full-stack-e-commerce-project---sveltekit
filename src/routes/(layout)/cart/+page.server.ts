// src/routes/cart/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.user) {
        throw redirect(302, '/auth/login');
    }

    const cartRes = await fetch('/api/cart');
    const { items } = await cartRes.json();

    return {
        items
    };
};