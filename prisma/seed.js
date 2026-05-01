require('dotenv').config(); 
const { PrismaClient } = require("@prisma/client");

// Con el motor en modo 'library' (en schema.prisma), el cliente de Prisma 7 
// ya puede automagicamente cargar la conexión desde el entorno.
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Sembrando datos (Modo P7 Library)...");
  const tId = "cm001-dentistry";

  // 1. Inquilino Principal
  await prisma.tenant.upsert({
    where: { slug: "premium-dental-clinica" },
    update: {},
    create: { id: tId, name: "Clínica Dental Premium", slug: "premium-dental-clinica" }
  });

  // 2. Servicios Base 
  const services = [
    { id: "cm001", name: "Limpieza Pro", duration: 45, price: 850, tenantId: tId },
    { id: "cm002", name: "Consulta", duration: 30, price: 300, tenantId: tId },
    { id: "cm003", name: "Blanqueamiento", duration: 60, price: 1500, tenantId: tId },
  ];

  for (const s of services) {
    await prisma.service.upsert({ where: { id: s.id }, update: {}, create: s });
    console.log(`✅ Servicio registrado: ${s.name}`);
  }

  console.log("✨ BASE DE DATOS SEMBRADA CON ÉXITO.");
}

main().catch(err => {
  console.error("❌ Falló el Seed:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
