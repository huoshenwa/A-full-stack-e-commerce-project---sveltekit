// scripts/create-admin.ts
import { db, users, userRoles, roles } from '../src/lib/server/db';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function createAdmin(email: string, password: string, displayName: string) {
    try {
        // 1. 检查邮箱是否已存在
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existing.length > 0) {
            console.error('❌ 邮箱已存在');
            process.exit(1);
        }

        // 2. 创建用户
        const passwordHash = await bcrypt.hash(password, 10);
        const [user] = await db.insert(users).values({
            email,
            passwordHash,
            displayName,
            isActive: true,
            isEmailVerified: true
        }).returning();

        console.log('✅ 用户创建成功:', user.email);

        // 3. 获取管理员角色
        const [adminRole] = await db.select().from(roles).where(eq(roles.code, 'admin')).limit(1);

        if (!adminRole) {
            console.error('❌ 管理员角色不存在，请先运行初始化脚本');
            process.exit(1);
        }

        // 4. 分配角色
        await db.insert(userRoles).values({
            userId: user.id,
            roleId: adminRole.id
        });

        console.log('✅ 管理员角色分配成功');
        console.log('\n' + '='.repeat(60));
        console.log('🎉 管理员账户创建完成');
        console.log('='.repeat(60));
        console.log(`邮箱: ${email}`);
        console.log(`密码: ${password}`);
        console.log(`角色: 管理员`);
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ 创建失败:', error);
        process.exit(1);
    }
}

// 从命令行参数读取
const email = process.argv[2];
const password = process.argv[3];
const displayName = process.argv[4] || '管理员';

if (!email || !password) {
    console.log('使用方法: node scripts/create-admin.ts <邮箱> <密码> [显示名称]');
    console.log('示例: node scripts/create-admin.ts admin@test.com password123 系统管理员');
    process.exit(1);
}

createAdmin(email, password, displayName);