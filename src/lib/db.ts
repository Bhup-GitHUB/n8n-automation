import {PrismaClient} from "@prisma/client"

const globalForPrisma = global as unknown as {prisma: PrismaClient | undefined } //error fekega agar cleint nhi mila 
export const db = 
  globalForPrisma.prisma ?? 
  new PrismaClient({
    log: ['query'],   // production mein nhi dalna ise
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db
  }

  export async function testDbConnection() {
    try {
      await db.$connect()
      console.log('db connected ')
    } catch (error) {
      console.error('db connection failed for some shitty reason', error)
      process.exit(1)
    }
  }