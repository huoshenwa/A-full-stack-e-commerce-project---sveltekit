// src/lib/server/auth/providers/index.ts
import type { OAuthProfile } from '../auth.types';

export interface OAuthProvider {
    name: string;
    getAuthorizationUrl(state: string): string;
    getProfile(code: string): Promise<OAuthProfile>;
}

export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}
