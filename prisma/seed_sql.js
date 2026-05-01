require('dotenv').config(); 
const { Client } = require('pg');

// Usamos el cliente nativo de Postgres para saltarnos las validaciones de Prisma
const client = new Client({
  connectionString: "postgresql://postgres:Yungbratz1811%21@db.hilfnnyzmtxqstrjpktd.supabase.co:5432/postgres",
});

async function main() {
  console.log("🚀 Sembrando datos vía SQL Nativo (Failsafe)...");
  
  try {
    await client.connect();
    console.log("✅ Conexión con Supabase Establecida.");

    const tenantId = "cm001-dentistry";

    // 1. Insertar el Inquilino (Tenant)
    await client.query(`
      INSERT INTO "Tenant" (id, name, slug, "updatedAt") 
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (slug) DO NOTHING
    `, [tenantId, "Clínica Dental Premium", "premium-dental-clinica"]);
    console.log("✅ Tenant 'Clínica Dental' listo.");

    // 2. Insertar Servicios Base
    const services = [
      ["cm001", "Limpieza Dental Pro", 45, 850.0, tenantId],
      ["cm002", "Consulta Valoración", 30, 300.0, tenantId],
      ["cm003", "Blanqueamiento Láser", 60, 1500.0, tenantId],
    ];

    for (const [id, name, duration, price, tId] of services) {
      await client.query(`
        INSERT INTO "Service" (id, name, duration, price, "tenantId")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [id, name, duration, price, tId]);
      console.log(`✅ Servicio '${name}' registrado.`);
    }

    // 3. Crear Horarios Operativos base (Lunes a Viernes)
    for (let day = 1; day <= 6; day++) {
        await client.query(`
          INSERT INTO "Schedule" (id, "dayOfWeek", "startTime", "endTime", "tenantId")
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [Math.random().toString(36).substr(2, 9), day, "09:00", "18:00", tenantId]);
    }
    console.log("✅ Horarios operativos base establecidos.");

    console.log("✨ BASE DE DATOS OPERATIVA Y POBLADA.");
  } catch (err) {
    console.error("❌ Falló el Seed vía SQL:", err);
  } finally {
    await client.end();
  }
}

main();
