"use server";

import { db } from "@/lib/db";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Sincroniza la organización de Clerk con nuestra base de datos.
 * Se llama automáticamente cuando el usuario entra al admin.
 */
export async function syncTenant(inviteToken?: string) {
  const { orgId, userId } = await auth();
  const user = await currentUser();
  const client = await clerkClient();

  if (!user || !userId) return null;

  // 🎟️ CASO: El usuario viene con un token de invitación de nuestra DB
  if (inviteToken) {
    const invitation = await (db as any).invitation.findUnique({
      where: { token: inviteToken },
      include: { tenant: true }
    });

    if (invitation && invitation.expiresAt > new Date()) {
      try {
        await client.organizations.createOrganizationMembership({
          organizationId: invitation.tenant.slug,
          userId: userId,
          role: invitation.role as any,
        });
        await (db as any).invitation.delete({ where: { id: invitation.id } });
        return { success: true, redirect: true } as any;
      } catch (err) {
        console.error("Error al unir miembro via token:", err);
      }
    }
  }

  if (!orgId) return null;

  // 1. Verificar si ya existe el Tenant
  const existingTenant = await db.tenant.findUnique({
    where: { id: orgId }
  });

  if (existingTenant) {
    // 🛡️ VERIFICAR SI EL USUARIO YA TIENE PERFIL PROFESIONAL
    const prof = await (db as any).professional.findUnique({
      where: { clerkId: user.id }
    });

    if (!prof) {
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });
      const membership = memberships.data.find(m => m.publicUserData?.userId === user.id);

      await (db as any).professional.create({
        data: {
          clerkId: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Profesional',
          email: user.emailAddresses[0].emailAddress,
          tenantId: existingTenant.id,
          role: membership?.role === "org:admin" ? "Propietario" : "Profesional",
          isActive: true
        }
      });
    }
    return existingTenant;
  }

  // 2. Si no existe, obtener datos de la organización de Clerk
  try {
    const organization = await client.organizations.getOrganization({ organizationId: orgId });
    
    // 3. Crear el Tenant automáticamente
    const tenant = await db.tenant.create({
      data: {
        id: orgId,
        name: organization.name,
        slug: organization.slug || `business-${orgId.slice(-6)}`,
        config: {
          description: `Negocio sincronizado de Clerk: ${organization.name}`,
          bookingPolicies: {
            slotInterval: 30,
            minLeadTime: 2,
            maxLeadTime: 30
          }
        }
      }
    });

    // 4. Inicializar Horario Semanal por Defecto (Lun-Vie 9-18)
    const defaultSchedules = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "18:00",
      isOpen: i >= 1 && i <= 5, // Lunes a Viernes abierto
      tenantId: tenant.id
    }));

    await db.schedule.createMany({
      data: defaultSchedules
    });

    // 5. Crear el perfil de profesional para el dueño
    await (db as any).professional.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || organization.name,
        email: user.emailAddresses[0].emailAddress,
        tenantId: tenant.id,
        role: "Propietario",
        isActive: true
      }
    });

    revalidatePath("/admin");
    return tenant;

  } catch (error) {
    console.error("Error sincronizando Tenant:", error);
    return null;
  }
}

export async function createBusiness(data: { name: string; slug: string }) {
  const client = await clerkClient();
  const user = await currentUser();
  
  if (!user) throw new Error("Debes iniciar sesión para crear un negocio");

  try {
    const organization = await client.organizations.createOrganization({
      name: data.name,
      slug: data.slug,
      createdBy: user.id,
    });

    return { success: true, orgId: organization.id };
  } catch (error: any) {
    console.error("Error al crear organización en Clerk:", error);
    throw new Error(error.errors?.[0]?.message || "No se pudo crear el negocio. Intenta con otro nombre o enlace.");
  }
}

/**
 * Crea una invitación en la base de datos y envía el correo.
 */
export async function inviteMember(email: string) {
  const { orgId } = await auth();
  const user = await currentUser();

  if (!orgId || !user) throw new Error("No autorizado");

  // Buscamos el Tenant por el slug u orgId
  const tenant = await db.tenant.findFirst({
    where: { slug: orgId }
  });

  if (!tenant) throw new Error("Organización no encontrada");

  const token = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  // Guardamos en nuestra DB
  await (db as any).invitation.create({
    data: {
      token,
      email,
      tenantId: tenant.id,
      expiresAt,
      role: "org:member"
    }
  });

  // URL personalizada que SÍ funciona
  const inviteUrl = `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://agendo.app"}/sign-up?invite_token=${token}&join=true`;

  console.log("Invitación creada:", inviteUrl);
  // Aquí se enviaría el correo manual si se desea, pero por ahora devolvemos el éxito.
  return { success: true, url: inviteUrl };
}

/**
 * Genera un enlace de invitación rápida usando la DB.
 */
export async function generateInviteLink() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No autorizado");

  const tenant = await db.tenant.findFirst({ where: { slug: orgId } });
  if (!tenant) throw new Error("Tenant no encontrado");

  const token = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 días para enlace rápido

  await (db as any).invitation.create({
    data: {
      token,
      email: "public-invite",
      tenantId: tenant.id,
      expiresAt,
      role: "org:member"
    }
  });

  const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://agendo.app";
  return `${baseUrl}/sign-up?invite_token=${token}&join=true`;
}
