// src/lib/server/auth/auth.service.ts
// import bcrypt from 'bcrypt';
import bcrypt from 'bcrypt'
import { authRepository } from './auth.repository';
import { createSession } from './auth.session';
import { AuthError } from './auth.types';
import type { LoginCredentials, RegisterData, OAuthProfile } from './auth.types';
import type { OAuthProvider } from './providers';

const SALT_ROUNDS = 10;

export class AuthService {
    /**
     * 本地账号注册
     */
    async register(data: RegisterData): Promise<string> {
        // 步骤1：检查邮箱是否已存在（避免重复注册）
        const existingUser = await authRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw AuthError.EmailExists;// 邮箱已存在，抛异常（前端提示“该邮箱已注册”）
        }

        // 步骤2：加密密码（明文密码→哈希，数据库只存哈希）
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // 步骤3：创建用户（存邮箱、密码哈希、昵称到users表）
        const user = await authRepository.createUser({
            email: data.email,
            passwordHash,
            displayName: data.displayName
        });

        // 步骤4：给新用户分配默认角色“user”（普通用户）
        await authRepository.assignRoleToUser(user.id, 'user');

        // 步骤5：创建会话（注册成功直接登录，返回会话ID给前端）
        return await createSession(user.id);
    }

    /**
     * 本地账号登录
     */
    async login(credentials: LoginCredentials, meta?: { ipAddress?: string; userAgent?: string }): Promise<string> {
        // 步骤1：根据邮箱查用户（用户不存在则抛错）
        const user = await authRepository.findUserByEmail(credentials.email);
        // 两种情况抛“账号密码错误”：1.用户不存在  2.用户存在但没有密码哈希（第三方登录用户）
        if (!user || !user.passwordHash) {
            throw AuthError.InvalidCredentials;
        }

        // 步骤2：验证密码（明文密码 vs 数据库的哈希）
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
            throw AuthError.InvalidCredentials;
        }

        // 步骤3：检查账号是否激活（isActive=false表示账号被禁用）
        if (!user.isActive) {
            throw AuthError.InactiveAccount;
        }

        // 步骤4：创建会话（返回会话ID给前端，前端存起来作为登录凭证）
        return await createSession(user.id, meta);// meta是IP/设备信息，可选
    }

    /**
     * OAuth 登录/注册
     */
    async oauthLogin(
        provider: OAuthProvider, // 第三方服务商（比如微信、谷歌）
        code: string,// 前端传的第三方授权码（比如微信登录后的code）
        meta?: { ipAddress?: string; userAgent?: string }
    ): Promise<string> {
        // 步骤1：用授权码获取第三方用户信息（比如微信openid、昵称、邮箱）
        const profile = await provider.getProfile(code);

        // 步骤2：查是否已绑定过该第三方账号（比如用户之前用微信登录过）
        const existingOAuth = await authRepository.findOAuthAccount(profile.provider, profile.providerUserId);

        let userId: string;// 最终要登录的用户ID

        if (existingOAuth) {
            // 分支1：已绑定 → 直接用绑定的用户ID
            userId = existingOAuth.userId;
        } else {
            // 分支2：未绑定 → 处理新用户/绑定到现有用户
            if (profile.email) {
                // 子分支2.1：第三方返回了邮箱 → 查该邮箱是否已注册
                const existingUser = await authRepository.findUserByEmail(profile.email);
                if (existingUser) {
                    // 邮箱已注册 → 绑定到该用户（比如用户先注册了邮箱，后用微信登录
                    userId = existingUser.id;
                } else {
                    // 邮箱未注册 → 创建新用户（用第三方的邮箱、昵称、头像
                    const newUser = await authRepository.createUser({
                        email: profile.email,
                        displayName: profile.displayName,
                        avatarUrl: profile.avatarUrl
                    });
                    userId = newUser.id;
                    await authRepository.assignRoleToUser(userId, 'user'); // 分配默认角色
                }
            } else {
                // 子分支2.2：第三方没返回邮箱（比如部分微信账号没绑定邮箱）
                // 生成虚拟邮箱（避免邮箱为空，保证users表email唯一）
                const newUser = await authRepository.createUser({
                    email: `${profile.provider}_${profile.providerUserId}@oauth.local`,
                    displayName: profile.displayName,
                    avatarUrl: profile.avatarUrl
                });
                userId = newUser.id;
                await authRepository.assignRoleToUser(userId, 'user');
            }

            // 步骤3：绑定第三方账号（把用户ID和第三方信息存到oauthAccounts表）
            await authRepository.linkOAuthAccount(userId, profile);
        }

        // 步骤4：检查用户是否激活（禁用的用户不能登录）
        const user = await authRepository.findUserById(userId);
        if (!user?.isActive) {
            throw AuthError.InactiveAccount;
        }

        // 步骤5：创建会话（返回会话ID给前端）
        return await createSession(userId, meta);
    }

    /**
     * 修改密码（登录后）
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        // 步骤1：查用户（确保用户存在，且有密码哈希（非第三方用户））
        const user = await authRepository.findUserById(userId);
        if (!user || !user.passwordHash) {
            throw AuthError.UserNotFound;
        }
        // 步骤2：验证旧密码（防止别人冒充改密码）
        const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValid) {
            throw AuthError.InvalidCredentials;
        }
        // 步骤3：加密新密码
        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        // 步骤4：更新用户密码哈希（同时更新updatedAt时间）
        await authRepository.updateUser(userId, { passwordHash: newPasswordHash });
    }
}

export const authService = new AuthService();