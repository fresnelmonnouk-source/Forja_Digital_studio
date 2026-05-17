import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Strip ?sslmode=... from the URL to avoid conflict with the explicit ssl option below.
  // When both are present, pg may give priority to sslmode=require and reject Supabase's cert.
  const connectionString = process.env.DATABASE_URL!
    .replace(/([?&])sslmode=[^&]*/g, "$1")
    .replace(/[?&]$/, "");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
