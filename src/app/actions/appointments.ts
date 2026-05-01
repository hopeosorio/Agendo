"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// 📋 Lista de citas filtrada por rol
export async function getAdminAppointments() {
  const { orgId, userId, orgRole } = await auth();
  if (!orgId || !userId) throw new Error("No organization selected");

  const isAdmin = orgRole === "org:admin";
  
  // Si no es admin, solo ve sus propias citas
  if (!isAdmin) {
    const professional = await (db as any).professional.findUnique({
      where: { clerkId: userId }
    });

    if (professional) {
      return await db.appointment.findMany({
        where: { 
          tenantId: orgId,
          professionalId: professional.id 
        } as any,
        include: {
          client: { select: { name: true, phone: true } },
          service: { select: { name: true, price: true, duration: true } }
        },
        orderBy: { startTime: "asc" }
      });
    }
  }

  // Admin ve todas las citas de la sucursal
  return await db.appointment.findMany({
    where: { tenantId: orgId } as any,
    include: {
      client: { select: { name: true, phone: true } },
      service: { select: { name: true, price: true, duration: true } }
    },
    orderBy: { startTime: "asc" }
  });
}

// 🏷️ Actualizar estado de una cita
export async function updateAppointmentStatus(id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NOSHOW") {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const updated = await db.appointment.update({
    where: { id, tenantId: orgId },
    data: { status }
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin"); 
  return updated;
}

// 🗑️ Borrar cita
export async function deleteAdminAppointment(id: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  await db.appointment.delete({
    where: { id, tenantId: orgId }
  });

  revalidatePath("/admin/appointments");
}

// 🗓️ Reagendar cita
export async function rescheduleAdminAppointment(id: string, newStartTime: Date) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const appointment = await db.appointment.findUnique({
    where: { id, tenantId: orgId },
    include: { service: true }
  });

  if (!appointment) throw new Error("Cita no encontrada");

  const newEndTime = new Date(newStartTime.getTime() + appointment.service.duration * 60000);

  const updated = await db.appointment.update({
    where: { id },
    data: { 
      startTime: newStartTime,
      endTime: newEndTime,
      status: "CONFIRMED"
    }
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin"); 
  return updated;
}
