import { PrismaClient } from '@prisma/client';

// Simple Prisma configuration for standard Node.js runtime
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma; 