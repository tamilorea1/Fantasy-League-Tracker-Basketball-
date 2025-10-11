//Connects to my database (PostgreSQL)
//PrismaClient represents my database helper
import { PrismaClient } from '@prisma/client';

// Add prisma to the global object in development to prevent multiple instances
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Optional: logs all database queries
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;