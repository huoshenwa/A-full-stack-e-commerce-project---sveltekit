
// // src/routes/api/auth/oauth/[provider]/callback/+server.ts
// import { json, redirect } from '@sveltejs/kit';
// import { authService } from '$lib/server/auth/auth.service';
// import { getOAuthProvider } from '$lib/server/config/auth';
// import { AuthError } from '$lib/server/auth/auth.types';
// import type { RequestHandler } from './$types';

// export const GET: RequestHandler = async ({ params, url, cookies, getClientAddress, request }) => {
//     const { provider } = params;
//     const code = url.searchParams.get('code');
//     const state = url.searchParams.get('state');

//     if (!code) {
//         throw redirect(302, '/login?error=no_code');
//     }

//     // TODO: 验证 state（生产环境必须）

//     try {
//         const oauthProvider = getOAuthProvider(provider);

//         const sessionId = await authService.oauthLogin(
//             oauthProvider,
//             code,
//             {
//                 ipAddress: getClientAddress(),
//                 userAgent: request.headers.get('user-agent') || undefined
//             }
//         );

//         // 设置 Cookie
//         cookies.set('session', sessionId, {
//             path: '/',
//             httpOnly: true,
//             secure: true,
//             sameSite: 'lax',
//             maxAge: 60 * 60 * 24 * 30 // 30 天
//         });

//         throw redirect(302, '/dashboard');
//     } catch (err) {
//         if (err instanceof AuthError) {
//             throw redirect(302, `/login?error=${err.code}`);
//         }

//         console.error(`OAuth ${provider} callback error:`, err);
//         throw redirect(302, '/login?error=oauth_failed');
//     }
// };