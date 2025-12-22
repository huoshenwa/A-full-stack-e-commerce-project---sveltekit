
// src/lib/server/auth/providers/google.ts
import type { OAuthProvider, OAuthConfig } from './index';
import type { OAuthProfile } from '../auth.types';

export class GoogleOAuthProvider implements OAuthProvider {
    name = 'google';

    constructor(private config: OAuthConfig) { }

    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            state,
            access_type: 'offline',
            prompt: 'consent'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async getProfile(code: string): Promise<OAuthProfile> {
        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                redirect_uri: this.config.redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokens = await tokenResponse.json();

        // 2. Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to get user info');
        }

        const user = await userResponse.json();

        return {
            provider: this.name,
            providerUserId: user.id,
            email: user.email,
            displayName: user.name,
            avatarUrl: user.picture,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined
        };
    }
}