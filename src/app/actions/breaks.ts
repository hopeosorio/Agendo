"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los descansos recurrentes de la organización.
 */
export async function getRecurringBreaks() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No organization selected");

  return await db.recurringBreak.findMany({
    where: { tenantId: orgId },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });
}

/**
 * Registra un nuevo descanso recurrente vinculado a un día específico.
 */
export async function addRecurringBreak(name: string, startTime: string, endTime: string, dayOfWeek: number) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const newBreak = await db.recurringBreak.create({
    data: {
      tenantId: orgId,
      name,
      dayOfWeek: parseInt(dayOfWeek as any),
      startTime,
      endTime,
      isActive: true
    }
  });

  revalidatePath("/admin/schedule");
  return newBreak;
}

/**
 * Elimina un descanso recurrente.
 */
export async function deleteRecurringBreak(id: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  await db.recurringBreak.delete({
    where: { id, tenantId: orgId }
  });

  revalidatePath("/admin/schedule");
}

/**
 * Activa o desactiva un descanso sin eliminarlo.
 */
export async function toggleRecurringBreak(id: string, isActive: boolean) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  await db.recurringBreak.update({
    where: { id, tenantId: orgId },
    data: { isActive }
  });

  revalidatePath("/admin/schedule");
}
