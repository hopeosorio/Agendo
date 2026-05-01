"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";
import { sendWhatsAppConfirmation, sendEmailConfirmation } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";

// 🚀 Bypass Táctico persistente para Turbopack
const getBlockedDateModel = () => (db as any).blockedDate;
const getProfessionalModel = () => (db as any).professional;

// Función helper para traducir el Slug que viene en la URL al ID real de la base de datos
async function resolveTenantId(slugOrId: string) {
  const tenant = await db.tenant.findFirst({
    where: {
      OR: [
        { id: slugOrId },
        { slug: slugOrId }
      ]
    }
  });
  return tenant;
}

// Obtener información pública del Tenant (Marca, SEO, Redes)
export async function getPublicTenantInfo(tenantSlug: string) {
  const tenant = await resolveTenantId(tenantSlug);
  if (!tenant) return null;

  // 🏢 RECUPERAR LOGO REAL DE CLERK (Org Logo)
  let logoToUse = tenant.logoUrl;
  try {
     const client = await clerkClient();
     const organization = await client.organizations.getOrganization({ organizationId: tenant.id });
     if (organization?.imageUrl) {
        logoToUse = organization.imageUrl;
     }
  } catch (error) {
     console.warn("[getPublicTenantInfo] ⚠️ No se pudo obtener logo de Clerk:", error);
  }
  
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: logoToUse,
    config: tenant.config,
    schedules: await db.schedule.findMany({ where: { tenantId: tenant.id } }),
    blockedDates: await db.blockedDate.findMany({ 
      where: { 
        tenantId: tenant.id,
        date: { gte: startOfDay(new Date()) } 
      },
      take: 100 // Límite razonable para bloqueos futuros
    })
  };
}

export async function getProfessionalsForService(tenantId: string, serviceId: string) {
  const model = getProfessionalModel();
  if (!model) return [];
  
  return await model.findMany({
    where: {
      tenantId,
      isActive: true,
      services: {
        some: { id: serviceId }
      }
    },
    select: {
      id: true,
      name: true,
      role: true,
      photoUrl: true,
      bio: true,
      services: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}


// 📦 Leer servicios (Público) con ordenamiento por ID de contingencia
export async function getPublicServices(tenantSlug: string) {
  const tenant = await resolveTenantId(tenantSlug);
  if (!tenant) return [];
  
  return await db.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { id: "desc" } // Usamos ID para bypass de createdAt vs Turbopack
  });
}

// 🕒 Leer horarios, CITAS y BLOQUEOS (Público)
export async function getPublicAvailability(tenantSlug: string, date: string) {
  const tenant = await resolveTenantId(tenantSlug);
  if (!tenant) return { schedule: [], existingAppointments: [], isDayBlocked: false };
  
  const queryDate = startOfDay(new Date(date + "T00:00:00"));
  const model = getBlockedDateModel();

  const [schedule, existingAppointments, blockedDate] = await Promise.all([
    db.schedule.findMany({
      where: { tenantId: tenant.id },
      orderBy: { dayOfWeek: "asc" }
    }),
    db.appointment.findMany({
      where: { 
        tenantId: tenant.id, 
        startTime: { 
          gte: startOfDay(queryDate), 
          lte: endOfDay(queryDate) 
        },
        status: { in: ["CONFIRMED", "PENDING"] }
      },
      select: { startTime: true, endTime: true }
    }),
    model ? model.findFirst({
      where: {
        tenantId: tenant.id,
        date: {
          gte: startOfDay(queryDate),
          lte: endOfDay(queryDate)
        }
      }
    }) : null 
  ]);

  return { schedule, existingAppointments, isDayBlocked: !!blockedDate };
}

// 🗓️ Crear cita final (Público - Autoconfirmada con CRM)
export async function createPublicAppointment(formData: {
  tenantSlug: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startTime: Date;
  professionalId?: string;
}) {
  const tenant = await resolveTenantId(formData.tenantSlug);
  if (!tenant) throw new Error("Operadora no encontrada");
  
  const service = await db.service.findUnique({
    where: { id: formData.serviceId }
  });

  if (!service) throw new Error("Servicio no válido");

  // 🧬 GESTIÓN DE CLIENTE (CRM) - Buscar o crear con limpieza de teléfono
  const cleanPhone = formData.customerPhone.replace(/\D/g, "");
  
  if (!cleanPhone) throw new Error("El número de teléfono es obligatorio para la reserva.");

  let client = await db.client.findFirst({
    where: { tenantId: tenant.id, phone: cleanPhone }
  });

  if (!client) {
    client = await db.client.create({
      data: {
        tenantId: tenant.id,
        name: formData.customerName,
        phone: cleanPhone,
        email: formData.customerEmail,
      }
    });
  } else {
    // 🔄 Sincronización de Perfil: Actualizar nombre y correo si han cambiado
    client = await db.client.update({
      where: { id: client.id },
      data: {
        name: formData.customerName,
        email: formData.customerEmail || client.email
      }
    });
  }

  const appointment = await db.appointment.create({
    data: {
      tenantId: tenant.id,
      clientId: client.id,
      serviceId: formData.serviceId,
      professionalId: formData.professionalId as any,
      startTime: formData.startTime,
      endTime: new Date(formData.startTime.getTime() + service.duration * 60000),
      status: "CONFIRMED" 
    } as any
  });

  // 🏢 RECUPERAR LOGO DE CLERK (Org Logo)
  let logoToUse = tenant.logoUrl;
  try {
     const client = await clerkClient();
     const organization = await client.organizations.getOrganization({ organizationId: tenant.id });
     if (organization?.imageUrl) {
        logoToUse = organization.imageUrl;
     }
  } catch (error) {
     console.warn("[Booking Action] ⚠️ No se pudo obtener logo de Clerk:", error);
  }

  // 🔔 DISPARAR MOTOR DE COMUNICACIONES TÁCTICAS
  try {
     await sendWhatsAppConfirmation({
        to: cleanPhone,
        customerName: formData.customerName,
        serviceName: service.name,
        startTime: formData.startTime,
        tenantName: tenant.name
     });

     if (formData.customerEmail) {
        const config = (tenant.config as any) || {};
        await sendEmailConfirmation({
          to: formData.customerEmail,
          customerName: formData.customerName,
          serviceName: service.name,
          startTime: formData.startTime,
          tenantName: tenant.name,
          tenantAddress: config.address,
          logoUrl: logoToUse || undefined,
          coordinates: config.coordinates ? {
            lat: config.coordinates.lat,
            lng: config.coordinates.lng
          } : undefined
        });
     }
  } catch (error) {
     console.error("[Booking Action] ❌ Fallo en notificación:", error);
  }

  revalidatePath(`/book/${formData.tenantSlug}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/appointments");
  return appointment;
}



// 🎰 Acción de Servidor para Disponibilidad (Solución a 'dns' Error)
export async function getAvailableSlotsAction(
  tenantSlug: string,
  serviceId: string,
  date: Date,
  professionalId?: string | null
) {
  const { getAvailableSlots } = await import("@/lib/engine"); 
  return await getAvailableSlots(tenantSlug, serviceId, date, professionalId);
}
