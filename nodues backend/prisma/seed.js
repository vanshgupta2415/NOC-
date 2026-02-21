/**
 * Prisma Seed Script — No Dues Portal (MITS Gwalior)
 * Run with: npm run seed
 *
 * Creates:
 *  - 1 SuperAdmin
 *  - 2 Students (with profiles)
 *  - 1 Faculty (CS dept)
 *  - 1 Class Coordinator (CS dept)
 *  - 1 HOD (CS dept)
 *  - 1 Hostel Warden
 *  - 1 Library Admin
 *  - 1 Workshop Admin
 *  - 1 TP Officer
 *  - 1 General Office admin
 *  - 1 Accounts Officer
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PASSWORD = 'password123';
const SALT_ROUNDS = 10;

async function hashPass(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

async function main() {
    console.log('\n🌱  Seeding No Dues Portal database...\n');

    const hash = await hashPass(PASSWORD);

    // ── 1. SuperAdmin ─────────────────────────────────────────────────────────
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'admin@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'SuperAdmin',
            isActive: true
        }
    });
    console.log('✅ SuperAdmin       →  admin@mitsgwl.ac.in');

    // ── 2. Faculty ────────────────────────────────────────────────────────────
    const faculty = await prisma.user.upsert({
        where: { email: 'faculty@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Prof. Rajesh Kumar',
            email: 'faculty@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'Faculty',
            department: 'Computer Science',
            isActive: true
        }
    });
    console.log('✅ Faculty          →  faculty@mitsgwl.ac.in');

    // ── 3. Class Coordinator ──────────────────────────────────────────────────
    const classCoord = await prisma.user.upsert({
        where: { email: 'coordinator@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Dr. Priya Sharma',
            email: 'coordinator@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'ClassCoordinator',
            department: 'Computer Science',
            isActive: true
        }
    });
    console.log('✅ ClassCoordinator →  coordinator@mitsgwl.ac.in');

    // ── 4. HOD ────────────────────────────────────────────────────────────────
    const hod = await prisma.user.upsert({
        where: { email: 'hod@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Dr. Suresh Verma',
            email: 'hod@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'HOD',
            department: 'Computer Science',
            isActive: true
        }
    });
    console.log('✅ HOD              →  hod@mitsgwl.ac.in');

    // ── 5. Hostel Warden ──────────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'hostel@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Mr. Anil Singh',
            email: 'hostel@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'HostelWarden',
            department: 'Central',
            isActive: true
        }
    });
    console.log('✅ HostelWarden     →  hostel@mitsgwl.ac.in');

    // ── 6. Library Admin ──────────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'library@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Mrs. Sunita Gupta',
            email: 'library@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'LibraryAdmin',
            department: 'Central',
            isActive: true
        }
    });
    console.log('✅ LibraryAdmin     →  library@mitsgwl.ac.in');

    // ── 7. Workshop Admin ─────────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'workshop@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Mr. Ramesh Patel',
            email: 'workshop@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'WorkshopAdmin',
            department: 'Central',
            isActive: true
        }
    });
    console.log('✅ WorkshopAdmin    →  workshop@mitsgwl.ac.in');

    // ── 8. TP Officer ─────────────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'tpo@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Dr. Kavita Joshi',
            email: 'tpo@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'TPOfficer',
            department: 'Central',
            isActive: true
        }
    });
    console.log('✅ TPOfficer        →  tpo@mitsgwl.ac.in');

    // ── 9. General Office ─────────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'office@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Mr. Dinesh Tiwari',
            email: 'office@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'GeneralOffice',
            department: 'Central',
            isActive: true
        }
    });
    console.log('✅ GeneralOffice    →  office@mitsgwl.ac.in');

    // ── 10. Accounts Officer ──────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'accounts@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Mrs. Rekha Mishra',
            email: 'accounts@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'AccountsOfficer',
            department: 'Central',
            isActive: true
        }
    });
    console.log('✅ AccountsOfficer  →  accounts@mitsgwl.ac.in');

    // ── 11. Student 1 (with profile) ──────────────────────────────────────────
    const student1 = await prisma.user.upsert({
        where: { email: 'student1@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Rahul Sharma',
            email: 'student1@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'Student',
            department: 'Computer Science',
            isActive: true
        }
    });

    await prisma.studentProfile.upsert({
        where: { userId: student1.id },
        update: {},
        create: {
            userId: student1.id,
            enrollmentNumber: '0827CS211001',
            fatherName: 'Mohan Sharma',
            dateOfBirth: new Date('2001-03-15'),
            branch: 'Computer Science',
            address: '12, Gandhi Nagar, Gwalior, MP - 474001',
            passOutYear: 2025,
            phoneNumber: '9876543210'
        }
    });
    console.log('✅ Student 1        →  student1@mitsgwl.ac.in  (0827CS211001)');

    // ── 12. Student 2 (with profile) ──────────────────────────────────────────
    const student2 = await prisma.user.upsert({
        where: { email: 'student2@mitsgwl.ac.in' },
        update: {},
        create: {
            name: 'Priya Verma',
            email: 'student2@mitsgwl.ac.in',
            passwordHash: hash,
            role: 'Student',
            department: 'Electronics',
            isActive: true
        }
    });

    await prisma.studentProfile.upsert({
        where: { userId: student2.id },
        update: {},
        create: {
            userId: student2.id,
            enrollmentNumber: '0827EC211002',
            fatherName: 'Suresh Verma',
            dateOfBirth: new Date('2001-07-22'),
            branch: 'Electronics',
            address: '45, Lashkar, Gwalior, MP - 474001',
            passOutYear: 2025,
            phoneNumber: '9876543211'
        }
    });
    console.log('✅ Student 2        →  student2@mitsgwl.ac.in  (0827EC211002)');

    // ── 13. Student Registry (Automatic Fetching) ─────────────────────────────
    await prisma.studentRegistry.upsert({
        where: { email: '24eo10va34@mitsgwl.ac.in' },
        update: {},
        create: {
            email: '24eo10va34@mitsgwl.ac.in',
            enrollmentNumber: 'BTEO24O1051',
            name: 'Vansh Gupta',
            branch: 'Electronics Engineering'
        }
    });
    console.log('✅ Registry Entry 1  →  24eo10va34@mitsgwl.ac.in (BTEO24O1051)');

    await prisma.studentRegistry.upsert({
        where: { email: '23it10ra45@mitsgwl.ac.in' },
        update: {},
        create: {
            email: '23it10ra45@mitsgwl.ac.in',
            enrollmentNumber: 'BTIT23I1022',
            name: 'Rahul Agarwal',
            branch: 'Information Technology'
        }
    });
    console.log('✅ Registry Entry 2  →  23it10ra45@mitsgwl.ac.in (BTIT23I1022)');

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log('  🎉  Seeding complete!');
    console.log('═'.repeat(55));
    console.log('  🔑  Password for ALL accounts: ' + PASSWORD);
    console.log('═'.repeat(55));
    console.log('');
    console.log('  Role              │ Email');
    console.log('  ──────────────────┼────────────────────────────────');
    console.log('  SuperAdmin        │ admin@mitsgwl.ac.in');
    console.log('  Student (1)       │ student1@mitsgwl.ac.in');
    console.log('  Student (2)       │ student2@mitsgwl.ac.in');
    console.log('  Faculty           │ faculty@mitsgwl.ac.in');
    console.log('  ClassCoordinator  │ coordinator@mitsgwl.ac.in');
    console.log('  HOD               │ hod@mitsgwl.ac.in');
    console.log('  HostelWarden      │ hostel@mitsgwl.ac.in');
    console.log('  LibraryAdmin      │ library@mitsgwl.ac.in');
    console.log('  WorkshopAdmin     │ workshop@mitsgwl.ac.in');
    console.log('  TPOfficer         │ tpo@mitsgwl.ac.in');
    console.log('  GeneralOffice     │ office@mitsgwl.ac.in');
    console.log('  AccountsOfficer   │ accounts@mitsgwl.ac.in');
    console.log('═'.repeat(55) + '\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
