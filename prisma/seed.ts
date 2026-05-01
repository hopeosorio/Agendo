"use client"; // Se ejecuta via ts-node usualmente, pero definimos lógica limpia

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Seed en Supabase...");

  // 1. Crear el primer Inquilino (Clínica)
  const tenantId = "cm001-dentistry";
  const tenant = await prisma.tenant.upsert({
    where: { slug: "premium-dental-clinica" },
    update: {},
    create: {
      id: tenantId,
      name: "Clínica Dental Premium",
      slug: "premium-dental-clinica",
      config: {
        primaryColor: "#6366f1",
        theme: "dark"
      }
    }
  });
  console.log("✅ Tenant creado:", tenant.name);

  // 2. Crear Catálogo de Servicios
  const services = [
    { id: "cm001", name: "Limpieza Dental Pro", duration: 45, price: 850, tenantId },
    { id: "cm002", name: "Consulta Valoración", duration: 30, price: 300, tenantId },
    { id: "cm003", name: "Blanqueamiento Láser", duration: 60, price: 1500, tenantId },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s
    });
  }
  console.log("✅ Servicios del catálogo creados.");

  // 3. Crear Horarios Operativos Lunes a Sábado
  for (let day = 1; day <= 6; day++) {
    await prisma.schedule.create({
      data: {
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        tenantId
      }
    });
  }
  console.log("✅ Horarios operativos establecidos.");

  console.log("✨ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
