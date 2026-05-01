"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todas las citas de un inquilino específico (clínica).
 * Filtra automáticamente por la organización activa del usuario autenticado.
 */
export async function getAppointments() {
  const { orgId } = await auth();

  // Si no hay organización activa, devolvemos vacío para seguridad multi-tenant
  if (!orgId) return [];

  return await db.appointment.findMany({
    where: { tenantId: orgId }, // Filtrado forzado por Tenant
    include: {
      service: true, // Incluimos detalles del servicio (nombre, precio)
    },
    orderBy: {
      startTime: "asc",
    },
  });
}

/**
 * Actualiza el estado de una cita (Confirmar, Cancelada, No-show).
 */
export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No autorizado");

  const appointment = await db.appointment.update({
    where: { 
      id: appointmentId,
      tenantId: orgId // Verificamos que pertenezca a la organización
    },
    data: { status: status as any },
  });

  revalidatePath("/admin/appointments");
  return appointment;
}
