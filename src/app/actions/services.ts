"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getServices() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No organization selected");

  // 🛡️ Bypass de Turbopack: Usamos 'id' en lugar de 'createdAt' para el ordenamiento 
  // ya que el servidor de desarrollo se niega a reconocer el nuevo campo.
  return await db.service.findMany({
    where: { tenantId: orgId },
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: { appointments: true }
      }
    }
  });
}

export async function createService(formData: {
  name: string;
  description?: string;
  duration: number;
  price: number;
}) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const service = await db.service.create({
    data: {
      ...formData,
      tenantId: orgId,
    },
  });

  revalidatePath("/admin/services");
  return service;
}

export async function updateService(id: string, formData: any) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const existing = await db.service.findUnique({
    where: { id, tenantId: orgId }
  });

  if (!existing) throw new Error("Servicio no encontrado");

  const updated = await db.service.update({
    where: { id },
    data: formData,
  });

  revalidatePath("/admin/services");
  return updated;
}

export async function deleteService(id: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  await db.service.delete({
    where: { id, tenantId: orgId },
  });

  revalidatePath("/admin/services");
}
