const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const TEST_USERS = [
    { name: 'MITS Admin', email: 'admin@mitsgwl.ac.in', role: 'SuperAdmin' },
    { name: 'Test Student', email: 'student@mitsgwl.ac.in', role: 'Student', department: 'Computer Science', enrollmentNumber: '0827CS211001' },
    { name: 'John Doe', email: 'johndoe@mitsgwl.ac.in', role: 'Student', department: 'Information Technology', enrollmentNumber: '0827IT211045' },
    { name: 'Dr. Faculty', email: 'faculty@mitsgwl.ac.in', role: 'Faculty', department: 'Computer Science' },
    { name: 'Prof. Coordinator', email: 'coordinator@mitsgwl.ac.in', role: 'ClassCoordinator', department: 'Computer Science' },
    { name: 'HOD CSE', email: 'hod@mitsgwl.ac.in', role: 'HOD', department: 'Computer Science' },
    { name: 'Hostel Manager', email: 'hostel@mitsgwl.ac.in', role: 'HostelWarden' },
    { name: 'Librarian', email: 'library@mitsgwl.ac.in', role: 'LibraryAdmin' },
    { name: 'Workshop In-charge', email: 'workshop@mitsgwl.ac.in', role: 'WorkshopAdmin' },
    { name: 'T&P Officer', email: 'tp@mitsgwl.ac.in', role: 'TPOfficer' },
    { name: 'Office Head', email: 'office@mitsgwl.ac.in', role: 'GeneralOffice' },
    { name: 'Accounts Officer', email: 'accounts@mitsgwl.ac.in', role: 'AccountsOfficer' }
];

async function main() {
    console.log('🚀 Starting Prisma Seeding...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Clear existing data
    console.log('🧹 Clearing existing data...');
    // Order matters for deletion due to foreign keys if Cascading is not applied everywhere
    // (though Prisma handles it well, explicit order is safer)
    await prisma.auditLog.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.approvalStage.deleteMany();
    await prisma.documents.deleteMany();
    await prisma.noDuesApplication.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.studentRegistry.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Database cleared.');

    // 2. Create Student Registry entries
    console.log('📋 Creating Student Registry...');
    for (const user of TEST_USERS) {
        if (user.role === 'Student') {
            await prisma.studentRegistry.create({
                data: {
                    email: user.email,
                    enrollmentNumber: user.enrollmentNumber,
                    name: user.name,
                    branch: user.department
                }
            });
            console.log(`   └─ Registered Student: ${user.enrollmentNumber}`);
        }
    }

    // 3. Create Users
    console.log('👥 Creating Users...');
    for (const userData of TEST_USERS) {
        const { enrollmentNumber, ...cleanUser } = userData;

        const user = await prisma.user.create({
            data: {
                name: cleanUser.name,
                email: cleanUser.email,
                passwordHash: hashedPassword,
                role: cleanUser.role,
                department: cleanUser.department || null,
                isActive: true
            }
        });

        console.log(`   ✅ Created ${user.role}: ${user.email}`);

        // 4. Create Student Profile if it's a student
        if (userData.role === 'Student') {
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    enrollmentNumber: userData.enrollmentNumber,
                    fatherName: 'Ram Singh',
                    dateOfBirth: new Date('2002-05-20'),
                    branch: userData.department,
                    address: 'MITS Campus, Gwalior',
                    passOutYear: 2024,
                    phoneNumber: '9876543210'
                }
            });
            console.log(`      └─ Profile Created`);
        }
    }

    console.log('\n✨ Seeding Complete!');
    console.log('------------------------------------------');
    console.log('Password for ALL accounts: password123');
    console.log('------------------------------------------\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
