const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        logger.info('PostgreSQL connected via Prisma');
        console.log('🚀 PostgreSQL connected via Prisma');
    } catch (error) {
        logger.error(`Error connecting to PostgreSQL: ${error.message}`);
        console.error('Failed to connect to PostgreSQL:', error);
        process.exit(1);
    }
};

module.exports = { prisma, connectDB };
