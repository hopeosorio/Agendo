"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ensureTenant } from "@/lib/onboarding";

export async function getSchedule() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No organization selected");

  // 1. 🛡️ AUTO-ONBOARDING UNIFICADO
  await ensureTenant(orgId);

  // 2. 🕒 GESTIÓN DE HORARIOS
  const schedule = await db.schedule.findMany({
    where: { tenantId: orgId },
    orderBy: { dayOfWeek: "asc" }
  });

  return schedule;
}

export async function updateScheduleDay(id: string, data: { 
  startTime?: string, 
  endTime?: string, 
  isOpen?: boolean 
}) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const updated = await db.schedule.update({
    where: { id, tenantId: orgId },
    data
  });

  revalidatePath("/admin/schedule");
  return updated;
}
export async function updateBulkSchedule(days: { id: string, startTime: string, endTime: string, isOpen: boolean }[]) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  // Usamos una transacción para asegurar consistencia
  await db.$transaction(
    days.map(day => 
      db.schedule.update({
        where: { id: day.id, tenantId: orgId },
        data: {
          startTime: day.startTime,
          endTime: day.endTime,
          isOpen: day.isOpen
        }
      })
    )
  );

  revalidatePath("/admin/schedule");
}
