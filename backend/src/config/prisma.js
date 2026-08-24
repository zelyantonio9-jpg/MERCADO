import { PrismaClient } from '@prisma/client';

// Instância única do Prisma Client, reutilizada em toda a aplicação.
// Evita esgotar as ligações à base de dados em ambiente de desenvolvimento
// com hot-reload.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
