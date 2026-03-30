import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, reuse the same PrismaClient instance to avoid too many connections
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'], // Only log errors and warnings in dev
    });
  }
  prisma = global.prisma;
}

export default prisma; 