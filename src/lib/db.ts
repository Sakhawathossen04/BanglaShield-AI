import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // No query logging: query logs could echo citizen-submitted (redacted)
    // content into stdout/observability pipelines. Errors still surface.
    log: ["error"],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db