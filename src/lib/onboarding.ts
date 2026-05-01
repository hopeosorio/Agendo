import { db } from "@/lib/db";

/**
 * 🛡️ EL GUARDIÁN DE ONBOARDING (CORE)
 * Asegura que cualquier proceso administrativo tenga un Tenant válido,
 * horarios iniciales y un catálogo mínimo funcional.
 */
export async function ensureTenant(orgId: string, orgName?: string) {
  const existingTenant = await db.tenant.findUnique({
    where: { id: orgId },
    include: { 
      _count: { 
        select: { 
          services: true,
          schedules: true 
        } 
      } 
    }
  });

  // Si falta el tenant, los servicios o los horarios, entramos en modo reparación
  if (!existingTenant || existingTenant._count.services === 0 || existingTenant._count.schedules === 0) {
     console.log(`[Agendo Core] Verificando integridad de datos para: ${orgId}`);
     
     return await db.$transaction(async (tx) => {
        let tenant = existingTenant as any;
        
        // 1. Crear el Tenant si no existe
        if (!tenant) {
           tenant = await tx.tenant.create({
             data: {
               id: orgId,
               name: orgName || `Nueva Operadora`,
               slug: `org-${orgId.slice(-6).toLowerCase()}`,
               config: { onboarding: "completed", theme: "deep-tech" }
             },
             include: { 
               _count: { 
                 select: { 
                   services: true,
                   schedules: true 
                 } 
               } 
             }
           });
        }

        // 2. Reparar Horarios si faltan
        const currentScheduleCount = await tx.schedule.count({ where: { tenantId: orgId } });
        if (currentScheduleCount === 0) {
           console.log(`[Agendo Core] Inicializando horarios para: ${orgId}`);
           const days = [0, 1, 2, 3, 4, 5, 6];
           await tx.schedule.createMany({
              data: days.map(day => ({
                 tenantId: orgId,
                 dayOfWeek: day,
                 startTime: "09:00",
                 endTime: "18:00",
                 isOpen: day !== 0 && day !== 6 // Cerrado fines de semana por defecto
              }))
           });
        }

        // 3. Reparar Catálogo si está vacío
        const currentServiceCount = await tx.service.count({ where: { tenantId: orgId } });
        if (currentServiceCount === 0) {
           console.log(`[Agendo Core] Inicializando catálogo para: ${orgId}`);
           const sampleServices = [
              {
                 name: "⚜️ Consulta de Alta Fidelidad",
                 description: "Entrevista diagnóstica exhaustiva con análisis de viabilidad.",
                 duration: 45,
                 price: 120.00
              },
              {
                 name: "⚡ Mantenimiento Preventivo",
                 description: "Ajuste rápido de parámetros y revisión de estado crítico.",
                 duration: 15,
                 price: 45.00
              }
           ];

           for (const service of sampleServices) {
              await tx.service.create({
                 data: { ...service, tenantId: orgId }
              });
           }
        }

        return tenant;
     });
  }

  return existingTenant;
}
