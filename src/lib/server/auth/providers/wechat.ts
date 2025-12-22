// src/lib/server/auth/providers/wechat.ts
import type { OAuthProvider, OAuthConfig } from './index';
import type { OAuthProfile } from '../auth.types';

export class WeChatOAuthProvider implements OAuthProvider {
    name = 'wechat';

    constructor(private config: OAuthConfig) { }

    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            appid: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: 'snsapi_userinfo',
            state
        });

        return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
    }

    async getProfile(code: string): Promise<OAuthProfile> {
        // 1. Exchange code for access token
        const tokenParams = new URLSearchParams({
            appid: this.config.clientId,
            secret: this.config.clientSecret,
            code,
            grant_type: 'authorization_code'
        });

        const tokenResponse = await fetch(
            `https://api.weixin.qq.com/sns/oauth2/access_token?${tokenParams.toString()}`
        );

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokens = await tokenResponse.json();

        if (tokens.errcode) {
            throw new Error(`WeChat API error: ${tokens.errmsg}`);
        }

        // 2. Get user info
        const userParams = new URLSearchParams({
            access_token: tokens.access_token,
            openid: tokens.openid
        });

        const userResponse = await fetch(
            `https://api.weixin.qq.com/sns/userinfo?${userParams.toString()}`
        );

        if (!userResponse.ok) {
            throw new Error('Failed to get user info');
        }

        const user = await userResponse.json();

        if (user.errcode) {
            throw new Error(`WeChat API error: ${user.errmsg}`);
        }

        return {
            provider: this.name,
            providerUserId: user.openid,
            displayName: user.nickname,
            avatarUrl: user.headimgurl,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined
        };
    }
}