"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ensureTenant } from "@/lib/onboarding";

interface AppointmentRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  startTime: Date;
}

interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lastVisit: string | null;
  nextVisit: string | null;
}

export async function getAdminClients() {
  const { orgId, userId, orgRole } = await auth();
  if (!orgId || !userId) throw new Error("No organization selected");

  const isAdmin = orgRole === "org:admin";
  let filter: any = { tenantId: orgId };

  // Si no es admin, solo ve clientes con los que ha tenido citas
  if (!isAdmin) {
    const professional = await (db as any).professional.findUnique({
      where: { clerkId: userId }
    });

    if (professional) {
      filter = {
        tenantId: orgId,
        appointments: {
          some: { professionalId: professional.id }
        }
      };
    }
  }

  const clients = await db.client.findMany({
    where: filter as any,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { appointments: true }
      },
      appointments: {
        orderBy: { startTime: "desc" },
        take: 1
      }
    }
  });

  return clients.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email || "Sin registro",
    totalVisits: c._count.appointments,
    lastVisit: c.appointments[0]?.startTime.toISOString() || null,
    nextVisit: null
  }));
}

export async function getClientDetail(clientId: string) {
  const { orgId, userId, orgRole } = await auth();
  if (!orgId || !userId) throw new Error("No organization selected");

  const isAdmin = orgRole === "org:admin";
  let professionalId: string | undefined = undefined;

  if (!isAdmin) {
    const prof = await (db as any).professional.findUnique({
      where: { clerkId: userId }
    });
    professionalId = prof?.id;
  }

  const client = await db.client.findUnique({
    where: { id: clientId, tenantId: orgId } as any,
    include: {
      appointments: {
        where: (professionalId ? { professionalId } : undefined) as any, // Filtramos sus citas si no es admin
        include: { service: true },
        orderBy: { startTime: "desc" }
      }
    }
  });

  return client;
}

