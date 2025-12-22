// src/lib/server/auth/auth.session.ts
import { authRepository } from './auth.repository';
import { AuthError } from './auth.types';
import type { AuthUser } from './auth.types';

const SESSION_DURATION_DAYS = 30;

// 创建新会话（登录成功后调用）
export async function createSession(
    userId: string,
    meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
    // 步骤1：计算会话过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
    // 步骤2：调用仓储层，把会话存入数据库（sessions 表）
    const session = await authRepository.createSession(userId, expiresAt, meta);
    // 步骤3：返回会话ID（前端存起来，后续请求带这个ID）
    return session.id;
}

// 校验会话并返回用户信息
// 前端携带 sessionId 请求接口时，后端先调用这个函数，校验会话是否合法，合法则返回用户 + 权限信息，不合法则返回 null / 抛错
export async function getSessionUser(sessionId: string): Promise<AuthUser | null> {
    // 步骤1：查数据库，找这个 sessionId 对应的会话记录
    const session = await authRepository.findSessionById(sessionId);
    // 步骤2：会话不存在 → 返回null（比如 sessionId 是伪造的、已被删除）
    if (!session) {
        return null;
    }
    // 步骤3：会话已过期 → 删除这条会话记录，返回null（比如30天有效期到了
    if (session.expiresAt < new Date()) {
        await authRepository.deleteSession(sessionId);
        return null;
    }
    // 步骤4：会话有效 → 查这个会话绑定的用户（含角色、权限）
    const user = await authRepository.getUserWithPermissions(session.userId);
    // 步骤5：用户不存在（比如用户被删了）→ 删除会话，返回null
    if (!user) {
        await authRepository.deleteSession(sessionId);
        return null;
    }
    // 步骤6：用户存在但账号被禁用 → 抛错（后续上层代码捕获，返回“账号禁用”提示）
    if (!user.isActive) {
        throw AuthError.InactiveAccount;
    }
    // 步骤7：所有校验通过 → 返回用户信息（含角色、权限）
    return user;
}
// 销毁单个会话（登出 / 单设备下线）
export async function invalidateSession(sessionId: string): Promise<void> {
    // 调用仓储层，删除sessions表中这个sessionId的记录
    await authRepository.deleteSession(sessionId);
}
// 销毁用户所有会话（强制下线所有设备）
export async function invalidateAllUserSessions(userId: string): Promise<void> {
    await authRepository.deleteUserSessions(userId);
}