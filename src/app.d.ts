// See https://svelte.dev/docs/kit/types#app.d.ts
import type { AuthUser } from '$lib/server/auth/auth.types';
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			user: AuthUser | null;
		}
	}
}

export { };
