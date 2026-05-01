import { defineConfig } from "@prisma/config";

// Definición de configuración específica de Prisma 7
export default defineConfig({
  datasource: {
    url: "postgresql://postgres:Yungbratz1811%21@db.hilfnnyzmtxqstrjpktd.supabase.co:5432/postgres",
  },
  migrations: {
    // Definimos el script de semilla directamente aquí (Requerimiento de Prisma 7)
    seed: "node ./prisma/seed.js"
  }
});
