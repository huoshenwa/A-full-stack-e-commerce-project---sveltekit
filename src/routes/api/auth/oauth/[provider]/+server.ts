// // src/routes/api/auth/oauth/[provider]/+server.ts
// import { redirect } from '@sveltejs/kit';
// import { getOAuthProvider } from '$lib/server/config/auth';
// import type { RequestHandler } from './$types';

// // 发起 OAuth 授权
// export const GET: RequestHandler = async ({ params, url }) => {
//     const { provider } = params;

//     try {
//         const oauthProvider = getOAuthProvider(provider);

//         // 生成 state 用于防 CSRF
//         const state = crypto.randomUUID();

//         // 将 state 存入 cookie（生产环境应该用更安全的方式）
//         const authUrl = oauthProvider.getAuthorizationUrl(state);

//         throw redirect(302, authUrl);
//     } catch (err) {
//         console.error(`OAuth ${provider} error:`, err);
//         throw redirect(302, '/login?error=oauth_failed');
//     }
// };
