// src/lib/server/config/auth.ts
// import {
//     GOOGLE_CLIENT_ID,
//     GOOGLE_CLIENT_SECRET,
//     GOOGLE_REDIRECT_URI,
//     WECHAT_APP_ID,
//     WECHAT_APP_SECRET,
//     WECHAT_REDIRECT_URI
// } from '$env/static/private';
// import { GoogleOAuthProvider } from '../auth/providers/google';
// import { WeChatOAuthProvider } from '../auth/providers/wechat';
// import type { OAuthProvider } from '../auth/providers';

// export const oauthProviders: Record<string, OAuthProvider> = {
//     google: new GoogleOAuthProvider({
//         clientId: GOOGLE_CLIENT_ID,
//         clientSecret: GOOGLE_CLIENT_SECRET,
//         redirectUri: GOOGLE_REDIRECT_URI
//     }),
//     wechat: new WeChatOAuthProvider({
//         clientId: WECHAT_APP_ID,
//         clientSecret: WECHAT_APP_SECRET,
//         redirectUri: WECHAT_REDIRECT_URI
//     })
// };

// export function getOAuthProvider(name: string): OAuthProvider {
//     const provider = oauthProviders[name];
//     if (!provider) {
//         throw new Error(`OAuth provider ${name} not configured`);
//     }
//     return provider;
// }