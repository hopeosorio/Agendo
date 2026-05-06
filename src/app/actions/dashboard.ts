"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { ensureTenant } from "@/lib/onboarding";
import { startOfDayUTC, endOfDayUTC, subDaysUTC, addDaysUTC, formatInTZ, formatDayName } from "@/lib/timezone";

export async function getDashboardSummary() {
  const { orgId, userId, orgRole } = await auth();
  if (!orgId || !userId) throw new Error("Acceso no autorizado");

  const isAdmin = orgRole === "org:admin";
  let professionalId: string | undefined = undefined;

  if (!isAdmin) {
    const prof = await (db as any).professional.findUnique({
      where: { clerkId: userId }
    });
    professionalId = prof?.id;
  }

  // Filtro base para todas las consultas
  const baseWhere: any = { tenantId: orgId };
  if (professionalId) baseWhere.professionalId = professionalId;

  // 🕒 Timezone-aware boundaries (Vercel runs in UTC)
  // These return the correct UTC timestamps for midnight in America/Mexico_City
  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const todayEnd = endOfDayUTC(now);

  // 1. Conteo de KPIs
  const [totalAppointments, todayAppointments, pendingAppointments] = await Promise.all([
    db.appointment.count({ where: baseWhere }),
    db.appointment.count({
      where: {
        ...baseWhere,
        startTime: { gte: todayStart, lte: todayEnd }
      }
    }),
    db.appointment.count({
      where: {
        ...baseWhere,
        status: "PENDING"
      }
    })
  ]);

  // 2. Ingresos hoy
  const incomeTodayApps = await db.appointment.findMany({
    where: {
      ...baseWhere,
      startTime: { gte: todayStart, lte: todayEnd },
      status: "CONFIRMED"
    },
    include: { service: true }
  });

  const totalIncomeToday = incomeTodayApps.reduce((acc: number, app: any) => acc + (app.service?.price || 0), 0);

  // 3. Últimas 5 citas
  const recentAppointments = await db.appointment.findMany({
    where: baseWhere,
    orderBy: { startTime: "desc" }, 
    take: 5,
    include: {
      service: { select: { name: true } },
      client: { select: { id: true, name: true } }
    }
  });

  const tenant = await db.tenant.findUnique({
     where: { id: orgId },
     select: { name: true, slug: true }
  });

  // 4. Chart Data (Últimos 7 días) — timezone-aware
  const sevenDaysAgo = subDaysUTC(now, 6);

  // 5. Mapeo de citas por día para el Calendario
  const calendarStart = startOfMonth(now);
  const calendarEnd = endOfMonth(now);

  const monthAppointments = await db.appointment.findMany({
    where: {
      ...baseWhere,
      startTime: { gte: subDaysUTC(calendarStart, 7), lte: addDaysUTC(calendarEnd, 7) }
    },
    select: { startTime: true }
  });

  // Group by day using timezone-aware formatting
  const appointmentsByDay: Record<string, number> = {};
  monthAppointments.forEach((app: any) => {
    const key = formatInTZ(new Date(app.startTime));
    appointmentsByDay[key] = (appointmentsByDay[key] || 0) + 1;
  });

  const lastWeekApps = await db.appointment.findMany({
    where: {
      ...baseWhere,
      startTime: { gte: sevenDaysAgo, lte: todayEnd }
    },
    select: { startTime: true }
  });

  // Build chart with timezone-aware day names
  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = subDaysUTC(now, i);
    const key = formatInTZ(d);
    chartDataMap.set(key, { name: formatDayName(d), citas: 0 });
  }

  lastWeekApps.forEach((app: any) => {
    const key = formatInTZ(new Date(app.startTime));
    if (chartDataMap.has(key)) {
      chartDataMap.get(key).citas += 1;
    }
  });

  const chartData = Array.from(chartDataMap.values());

  return {
    tenant,
    kpis: {
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      totalIncomeToday
    },
    recentAppointments,
    chartData,
    appointmentsByDay
  };
}

