// src/lib/server/auth/auth.types.ts
export interface AuthUser {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    roles: string[];
    permissions: string[];
}

export interface OAuthProfile {
    provider: string;
    providerUserId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    displayName?: string;
}

export class AuthError extends Error {
    constructor(
        message: string,
        public code: AuthErrorCode,
        public statusCode: number = 401
    ) {
        super(message);
        this.name = 'AuthError';
    }

    static InvalidCredentials = new AuthError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        401
    );

    static UserNotFound = new AuthError(
        'User not found',
        'USER_NOT_FOUND',
        404
    );

    static EmailExists = new AuthError(
        'Email already exists',
        'EMAIL_EXISTS',
        409
    );

    static Unauthorized = new AuthError(
        'Unauthorized',
        'UNAUTHORIZED',
        401
    );

    static Forbidden = new AuthError(
        'Forbidden',
        'FORBIDDEN',
        403
    );

    static SessionExpired = new AuthError(
        'Session expired',
        'SESSION_EXPIRED',
        401
    );

    static InactiveAccount = new AuthError(
        'Account is inactive',
        'INACTIVE_ACCOUNT',
        403
    );
}

export type AuthErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'USER_NOT_FOUND'
    | 'EMAIL_EXISTS'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'SESSION_EXPIRED'
    | 'INACTIVE_ACCOUNT';