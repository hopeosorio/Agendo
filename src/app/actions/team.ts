"use server";

import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Acceso directo al modelo con bypass para Turbopack
const getProfessionalModel = () => (db as any).professional;

export async function getTeam() {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  // 1. Obtener miembros e invitaciones de la organización desde Clerk
  const client = await clerkClient();
  const [memberships, invitations] = await Promise.all([
    client.organizations.getOrganizationMembershipList({ organizationId: orgId }),
    client.organizations.getOrganizationInvitationList({ organizationId: orgId })
  ]);

  // 2. Obtener datos de profesionales desde la DB
  const model = getProfessionalModel();
  const professionals = model ? await model.findMany({
    where: { tenantId: orgId },
    include: { services: true }
  }) : [];

  // 3. Unificar Miembros
  const members = memberships.data.map(m => {
    const profData = professionals.find((p: any) => p.clerkId === m.publicUserData?.userId);
    return {
      clerkId: m.publicUserData?.userId,
      name: `${m.publicUserData?.firstName || 'Miembro'} ${m.publicUserData?.lastName || ''}`,
      email: m.publicUserData?.identifier,
      photoUrl: m.publicUserData?.imageUrl,
      role: m.role,
      status: 'active',
      professionalData: profData || null
    };
  });

  // 4. Unificar Invitaciones Pendientes
  const pending = invitations.data.filter(i => i.status === 'pending').map(i => ({
    clerkId: null,
    name: "Invitación Pendiente",
    email: i.emailAddress,
    photoUrl: null,
    role: i.role,
    status: 'pending',
    professionalData: null
  }));

  return [...members, ...pending];
}

export async function inviteMember(email: string, role: 'admin' | 'member' = 'member') {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Para invitar personal, primero debes crear o seleccionar una Organización en el selector de arriba.");

  if (!email || !email.includes('@')) {
    throw new Error("Por favor, ingresa un correo electrónico válido.");
  }

  try {
    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: role === 'admin' ? 'org:admin' : 'org:member',
    });
    revalidatePath("/admin/settings");
  } catch (error: any) {
    console.error("❌ Error de Clerk al invitar:", error);
    
    // Extraer el mensaje amigable de Clerk si existe
    const clerkError = error.errors?.[0]?.longMessage || error.message || "Error desconocido";
    throw new Error(`Clerk dice: ${clerkError}`);
  }
}

export async function syncProfessionalProfile(data: {
  clerkId: string;
  name: string;
  role: string;
  bio?: string;
  serviceIds: string[];
}) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");

  const model = getProfessionalModel();

  const existing = await model.findFirst({
    where: { clerkId: data.clerkId, tenantId: orgId }
  });

  if (existing) {
    await model.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio,
        services: {
          set: data.serviceIds.map((id: string) => ({ id }))
        }
      }
    });
  } else {
    await model.create({
      data: {
        clerkId: data.clerkId,
        name: data.name,
        role: data.role,
        bio: data.bio,
        tenantId: orgId,
        services: {
          connect: data.serviceIds.map((id: string) => ({ id }))
        }
      }
    });
  }

  revalidatePath("/admin/settings");
}

export async function deleteProfessional(id: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Acceso denegado");
  
  const model = getProfessionalModel();
  await model.delete({
    where: { id, tenantId: orgId }
  });

  revalidatePath("/admin/settings");
}
