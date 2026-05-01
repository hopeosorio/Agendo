"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmailConfirmation } from "@/lib/notifications";

interface BookingData {
  serviceId: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tenantId: string; // ID de la clínica/inquilino que provee el servicio
}

/**
 * Server Action para persistir una nueva cita en la base de datos de Prisma.
 * @param data - Datos de la reserva recopilados del BookingForm.
 * @returns El objeto de la cita creada o error.
 */
export async function createAppointment(data: BookingData) {
  try {
    // Buscamos o creamos el cliente
    let client = await db.client.findUnique({
      where: {
        tenantId_phone: {
          tenantId: data.tenantId,
          phone: data.customerPhone,
        }
      }
    });

    if (!client) {
      client = await db.client.create({
        data: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || "",
          tenantId: data.tenantId,
        }
      });
    }

    const appointment = await db.appointment.create({
      data: {
        startTime: data.date,
        // Calculamos el endTime sumando la duración del servicio (lo obtenemos de DB real)
        endTime: new Date(data.date.getTime() + 45 * 60000), // Default 45m para prototipado seguro
        status: "CONFIRMED", // 🚀 Auto-Confirmación
        clientId: client.id,
        serviceId: data.serviceId,
        tenantId: data.tenantId, // Aislamiento multi-tenant
      },
    });

    // 📨 ENVÍO DE CORREO AL USUARIO
    if (client.email) {
      const service = await db.service.findUnique({ where: { id: data.serviceId } });
      const tenant = await db.tenant.findUnique({ where: { id: data.tenantId } });
      if (service && tenant) {
         await sendEmailConfirmation({
           to: client.email,
           customerName: client.name,
           serviceName: service.name,
           startTime: data.date,
           tenantName: tenant.name
         });
      }
    }

    // Revalidamos las páginas administrativas para que el calendario se actualice al instante
    revalidatePath("/admin/appointments");
    revalidatePath("/admin");

    return { success: true, appointment };
  } catch (error) {
    console.error("Error al crear cita:", error);
    return { success: false, error: "No se pudo agendar la cita. Por favor, intente de nuevo." };
  }
}

/**
 * Server Action para leer los servicios reales de una clínica.
 * @param tenantId - El ID del inquilino.
 * @returns Lista de servicios del catálogo.
 */
export async function getServices(tenantId: string) {
  return await db.service.findMany({
    where: { tenantId },
    orderBy: { name: "asc" }
  });
}
