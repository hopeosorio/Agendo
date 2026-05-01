"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay, subDays, addDays, startOfMonth, endOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";
import { ensureTenant } from "@/lib/onboarding";


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

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

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

  // 4. Chart Data (Últimos 7 días)
  const sevenDaysAgo = startOfDay(subDays(now, 6));
  
  // 5. Mapeo de citas por día para el Calendario
  const calendarStart = startOfMonth(now);
  const calendarEnd = endOfMonth(now);

  const monthAppointments = await db.appointment.findMany({
    where: {
      ...baseWhere,
      startTime: { gte: subDays(calendarStart, 7), lte: addDays(calendarEnd, 7) }
    },
    select: { startTime: true }
  });

  const appointmentsByDay: Record<string, number> = {};
  monthAppointments.forEach((app: any) => {
    const key = format(new Date(app.startTime), "yyyy-MM-dd");
    appointmentsByDay[key] = (appointmentsByDay[key] || 0) + 1;
  });

  const lastWeekApps = await db.appointment.findMany({
    where: {
      ...baseWhere,
      startTime: { gte: sevenDaysAgo, lte: todayEnd }
    },
    select: { startTime: true }
  });

  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i);
    const dayName = format(d, "EEE", { locale: es });
    const formattedName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    chartDataMap.set(format(d, "yyyy-MM-dd"), { name: formattedName, citas: 0 });
  }

  lastWeekApps.forEach((app: any) => {
    const key = format(new Date(app.startTime), "yyyy-MM-dd");
    if (chartDataMap.has(key)) {
      const dataPoint = chartDataMap.get(key);
      dataPoint.citas += 1;
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

