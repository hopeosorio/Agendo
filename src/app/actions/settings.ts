"use server";

import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No organization selected");

  const tenant = await db.tenant.findUnique({
    where: { id: orgId },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      config: true,
    }
  });

  return tenant;
}

export async function updateSettings(data: {
  name?: string;
  description?: string;
  industry?: string;
  notifications?: any;
  address?: string;
  bookingPolicies?: {
    cancellationMargin: number;
    minLeadTime: number;
    maxLeadTime: number;
    slotInterval: number;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  successMessage?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  // 🔄 Sincronizar nombre con Clerk si ha cambiado
  if (data.name) {
    try {
      const client = await clerkClient();
      await client.organizations.updateOrganization(orgId, {
        name: data.name
      });
    } catch (error) {
      console.error("Error sincronizando con Clerk:", error);
      // No bloqueamos la actualización local si falla Clerk, pero lo logueamos
    }
  }

  const currentTenant = await db.tenant.findUnique({
    where: { id: orgId },
    select: { config: true }
  });

  const currentConfig = (currentTenant?.config as any) || {};

  await db.tenant.update({
    where: { id: orgId },
    data: {
      name: data.name,
      config: {
        ...currentConfig,
        description: data.description ?? currentConfig.description,
        industry: data.industry ?? currentConfig.industry,
        notifications: data.notifications ?? currentConfig.notifications,
        address: data.address ?? currentConfig.address,
        bookingPolicies: data.bookingPolicies ?? currentConfig.bookingPolicies,
        social: data.social ?? currentConfig.social,
        seo: data.seo ?? currentConfig.seo,
        successMessage: data.successMessage ?? currentConfig.successMessage,
        coordinates: data.coordinates ?? currentConfig.coordinates,
      }
    }
  });

  revalidatePath("/admin/settings");
}
