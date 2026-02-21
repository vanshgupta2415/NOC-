require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verify() {
    const email = 'admin@mitsgwl.ac.in';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('❌ User NOT found in database!');
        const allUsers = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('Available users:', allUsers);
        return;
    }

    console.log('✅ User found!');
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);

    const testPassword = 'nodues123';

    console.log('🔄 Forced Resetting password to "nodues123"...');
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    await prisma.user.update({
        where: { email },
        data: { passwordHash: newHash, isActive: true }
    });
    console.log('✅ Password reset successful!');
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
