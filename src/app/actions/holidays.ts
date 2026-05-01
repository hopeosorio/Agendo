"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// 🚀 Bypass Definitivo: Usamos acceso dinámico para evitar el persistente caché de Turbopack
const getModel = () => (db as any).blockedDate;

export async function getBlockedDates() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No organization selected");

  const model = getModel();
  if (!model) return []; 

  return await model.findMany({
    where: { tenantId: orgId },
    orderBy: { date: "asc" }
  });
}

export async function addBlockedDate(date: string, reason?: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const model = getModel();
  if (!model) throw new Error("Sincronizando motor de vacaciones. Reintenta en 5 segundos.");

  const blocked = await model.create({
    data: {
      tenantId: orgId,
      date: new Date(date + "T00:00:00"),
      reason
    }
  });

  revalidatePath("/admin/schedule");
  return blocked;
}

export async function deleteBlockedDate(id: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const model = getModel();
  if (!model) throw new Error("Acceso interrumpido temporalmente.");

  await model.delete({
    where: { id, tenantId: orgId }
  });

  revalidatePath("/admin/schedule");
}
