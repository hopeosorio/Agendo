import "dotenv/config";
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Para el CLI/Migraciones, Prisma 7 recomienda usar la URL directa
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
