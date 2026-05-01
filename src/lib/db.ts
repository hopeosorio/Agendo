import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 🚀 Sincronización de Esquema: BlockedDates habilitado
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Requerido para conexiones seguras en Vercel/Supabase
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
const adapter = new PrismaPg(pool);

export const db = 
  globalForPrisma.prisma ?? 
  new PrismaClient({
    adapter,
    log: ["warn", "error"], 
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
