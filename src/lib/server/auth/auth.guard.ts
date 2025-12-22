// src/lib/server/auth/auth.guard.ts
import { AuthError } from './auth.types';
import type { AuthUser } from './auth.types';

//基础校验 —— 必须是已登录用户，最基础的登录校验，所有需要登录的接口都要先过这一关
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
    if (!user) {
        throw AuthError.Unauthorized;
    }
}
// 校验 —— 用户必须有指定权限 ，核心作用：登录后，进一步校验是否有某个具体权限（最小粒度）
export function requirePermission(user: AuthUser | null, permission: string): void {
    // 第一步：先调用requireAuth，确保用户已登录（未登录直接抛错）
    requireAuth(user);
    // 第二步：检查用户权限数组是否包含指定权限（比如"user:delete"）
    if (!user.permissions.includes(permission)) {
        // 无权限则抛“禁止访问”异常
        throw AuthError.Forbidden;
    }
}
// 校验 —— 用户必须有指定角色    按角色校验（比权限粒度粗），比如 “只有管理员能访问后台”
export function requireRole(user: AuthUser | null, role: string): void {
    // 第一步：先确保已登录
    requireAuth(user);
    // 第二步：检查用户角色数组是否包含指定角色（比如"admin"）
    if (!user.roles.includes(role)) {
        throw AuthError.Forbidden;
    }
}

// 校验 —— 用户有任意一个指定权限即可
export function requireAnyPermission(user: AuthUser | null, permissions: string[]): void {
    requireAuth(user);
    // some：数组中只要有一个元素满足条件，就返回true
    const hasPermission = permissions.some((p) => user.permissions.includes(p));
    if (!hasPermission) {
        throw AuthError.Forbidden;
    }
}
// 校验 —— 用户必须有所有指定权限
export function requireAllPermissions(user: AuthUser | null, permissions: string[]): void {
    requireAuth(user);
    // every：数组中所有元素都满足条件，才返回true
    const hasAllPermissions = permissions.every((p) => user.permissions.includes(p));
    if (!hasAllPermissions) {
        throw AuthError.Forbidden;
    }
}

// 检查用户是否有指定权限（返回布尔值） 使用场景：比如前端判断 “删除按钮是否显示”：
export function hasPermission(user: AuthUser | null, permission: string): boolean {
    // 用户未登录 → 直接返回false
    if (!user) return false;
    // 登录则检查权限数组是否包含该权限
    return user.permissions.includes(permission);
}
// 检查用户是否有指定角色（返回布尔值）
export function hasRole(user: AuthUser | null, role: string): boolean {
    if (!user) return false;
    return user.roles.includes(role);
}