// src/lib/server/auth/auth.repository.ts
import { eq, and } from 'drizzle-orm';
import { db, users, sessions, oauthAccounts, userRoles, rolePermissions, roles, permissions } from '../db';
import type { AuthUser, OAuthProfile } from './auth.types';

export class AuthRepository {
    // 通过邮箱查找用户
    async findUserByEmail(email: string) {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return user;
    }
    // 通过ID查找用户
    async findUserById(id: string) {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return user;
    }
    // 创建 插入 用户  ，返回插入后的用户信息
    async createUser(data: {
        email: string;
        passwordHash?: string;
        displayName?: string;
        avatarUrl?: string;
    }) {
        const [user] = await db.insert(users).values(data).returning();
        return user;
    }
    // 查询用户 + 关联角色 + 关联权限， 返回用户的角色 / 权限列表
    async getUserWithPermissions(userId: string): Promise<AuthUser | null> {
        const user = await this.findUserById(userId);
        if (!user) return null; // 如果用户不存在返回null

        // 获取用户角色(code码)
        const userRolesList = await db
            .select({ code: roles.code })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, userId));

        // 获取用户权限
        const userPermissionsList = await db
            .select({ code: permissions.code })
            .from(userRoles)
            .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(userRoles.userId, userId));

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isActive: user.isActive,
            roles: userRolesList.map((r) => r.code),
            permissions: [...new Set(userPermissionsList.map((p) => p.code))]
        };
    }
    // 创建 插入 用户绘画 ， 返回会话信息
    async createSession(userId: string, expiresAt: Date, meta?: { ipAddress?: string; userAgent?: string }) {
        const [session] = await db
            .insert(sessions)
            .values({
                userId,
                expiresAt,
                ipAddress: meta?.ipAddress,
                userAgent: meta?.userAgent
            })
            .returning();
        return session;
    }
    // 通过会话ID 查找session信息并返回
    async findSessionById(sessionId: string) {
        const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
        return session;
    }
    // 通过会话ID删除session
    async deleteSession(sessionId: string) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    // 通过用户ID删除session
    async deleteUserSessions(userId: string) {
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }
    // 找到第三方登录的信息
    async findOAuthAccount(provider: string, providerUserId: string) {
        const [account] = await db
            .select()
            .from(oauthAccounts)
            .where(and(eq(oauthAccounts.provider, provider), eq(oauthAccounts.providerUserId, providerUserId)))
            .limit(1);
        return account;
    }
    // 将第三方登录信息插入合并到第三方登录记录表
    async linkOAuthAccount(userId: string, profile: OAuthProfile) {
        const [account] = await db
            .insert(oauthAccounts)
            .values({
                userId,
                provider: profile.provider,
                providerUserId: profile.providerUserId,
                email: profile.email,
                accessToken: profile.accessToken,
                refreshToken: profile.refreshToken,
                expiresAt: profile.expiresAt
            })
            .returning();
        return account;
    }
    // 分配角色给用户   [用户ID ， 角色代码] -> null
    async assignRoleToUser(userId: string, roleCode: string) {
        const [role] = await db.select().from(roles).where(eq(roles.code, roleCode)).limit(1);
        if (!role) throw new Error(`Role ${roleCode} not found`); // 没有这个角色

        await db.insert(userRoles).values({ userId, roleId: role.id }).onConflictDoNothing();
        // 插入数据时如果触发了唯一约束 / 主键冲突，就放弃本次插入操作，且不会抛出错误。
    }
    // 更新用户信息
    async updateUser(userId: string, data: Partial<{ passwordHash: string; displayName: string; avatarUrl: string; isActive: boolean }>) {
        await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
    }
}

export const authRepository = new AuthRepository();