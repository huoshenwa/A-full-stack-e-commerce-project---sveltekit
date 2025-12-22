// scripts/generate-password.js
import bcrypt from 'bcrypt';

async function generatePassword() {
    const password = '12345678';
    const hash = await bcrypt.hash(password, 10);
    console.log('密码: 12345678');
    console.log('哈希:', hash);
    console.log('\n复制上面的哈希值到 seed.sql 文件中');
}

generatePassword();