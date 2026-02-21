const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const apps = await prisma.noDuesApplication.findMany({
        include: {
            student: true,
            approvalStages: true
        }
    });
    console.log(JSON.stringify(apps, null, 2));
    await prisma.$disconnect();
}

check();
