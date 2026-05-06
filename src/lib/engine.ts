import { db } from './db';
import { addMinutes, format, isBefore, parse, addHours } from 'date-fns';
import { startOfDayUTC, endOfDayUTC, getDayOfWeek, nowInTZ } from '@/lib/timezone';

const prisma = db;

// Estructura de un Slot de disponibilidad
export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
}

/**
 * Motor de Disponibilidad Agendo v1.0
 * Calcula los huecos libres para un servicio en un tenant específico y una fecha física.
 * All day boundaries use America/Mexico_City timezone, not server UTC.
 */
export async function getAvailableSlots(
  tenantSlug: string,
  serviceId: string,
  date: Date,
  professionalId?: string | null
): Promise<TimeSlot[]> {
  // Timezone-aware day boundaries for DB queries
  const dayStart = startOfDayUTC(date);
  const dayEnd = endOfDayUTC(date);

  // 1. Obtener datos del Tenant, Servicio, Horarios y Descansos
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { id: tenantSlug },
        { slug: tenantSlug }
      ]
    },
    include: {
      services: { where: { id: serviceId } },
      schedules: { where: { dayOfWeek: getDayOfWeek(date) } }
    }
  });

  // 🚀 SOLUCIÓN DEFINITIVA: Consulta SQL Pura para saltar errores de esquema de Prisma
  const recurringBreaks: any[] = tenant 
    ? await prisma.$queryRaw`SELECT * FROM "RecurringBreak" WHERE "tenantId" = ${tenant.id} AND "isActive" = true`
    : [];

  // Verificar bloqueos de día completo (Vacaciones/Festivos)
  const blocked = await prisma.blockedDate.findFirst({
    where: { 
      tenantId: tenant?.id, 
      date: { gte: dayStart, lte: dayEnd } 
    }
  });

  if (!tenant || tenant.services.length === 0 || !!blocked) {
    return [];
  }

  const service = tenant.services[0];
  const schedule = tenant.schedules[0];

  if (!schedule || !schedule.isOpen) {
    return [];
  }

  // 2. Obtener citas ya existentes para ese día (Filtradas por Profesional si aplica)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId: tenant.id,
      professionalId: (professionalId as any) || undefined,
      startTime: { gte: dayStart, lte: dayEnd },
      status: { notIn: ['CANCELLED', 'REJECTED'] }
    } as any
  });

  // 3. Generar Slots basados en el horario de apertura
  const slots: TimeSlot[] = [];
  const start = parse(schedule.startTime, 'HH:mm', date);
  const end = parse(schedule.endTime, 'HH:mm', date);
  
  let currentSlot = start;

  while (isBefore(currentSlot, end)) {
    const slotEndTime = addMinutes(currentSlot, service.duration);
    
    // Validar que el slot no se pase del horario de cierre
    if (!isBefore(slotEndTime, addMinutes(end, 1))) break;

    const timeString = format(currentSlot, 'HH:mm');
    const slotEndTimeString = format(slotEndTime, 'HH:mm');

    // A. Verificar si el slot choca con alguna CITA existente
    const isOccupiedByAppointment = existingAppointments.some(app => {
      return (currentSlot < app.endTime && slotEndTime > app.startTime);
    });

    // B. Verificar si el slot choca con algún DESCANSO recurrente (Lunch, etc)
    const isOccupiedByBreak = recurringBreaks.some(brk => {
       const bStart = brk.startTime || brk.starttime;
       const bEnd = brk.endTime || brk.endtime;
       
       if (!bStart || !bEnd) return false;

       // Comparación de cadenas (HH:mm) - Infalible ante zonas horarias
       return (timeString < bEnd && slotEndTimeString > bStart);
    });

    // C. Restricción de tiempo mínimo (1 hora de anticipación mínimo por defecto)
    // Use timezone-aware "now" so Vercel's UTC clock doesn't block valid slots
    const minAllowedTime = addHours(nowInTZ(), 1); 
    const isTooSoon = isBefore(currentSlot, minAllowedTime);

    // 🧠 ESTRATEGIA DE INTELIGENCIA TOTAL:
    // 1. Escaneamos minuto a minuto internamente para no perder ni un segundo.
    // 2. Solo "ofrecemos" al cliente las horas que son:
    //    - Múltiplos de 15 (para orden visual: 9:00, 9:15...)
    //    - O el minuto EXACTO donde termina la cita anterior (Ajuste Perfecto).
    const isRoundTime = parseInt(timeString.split(':')[1]) % 15 === 0;
    
    // Verificar si es el primer minuto después de una cita o un descanso (Gapless)
    const isGaplessMatch = existingAppointments.some(app => format(app.endTime, 'HH:mm') === timeString) || 
                          recurringBreaks.some(brk => (brk.endTime || brk.endtime) === timeString) ||
                          timeString === schedule.startTime;

    if (isRoundTime || isGaplessMatch) {
      slots.push({
        time: timeString,
        available: !isOccupiedByAppointment && !isOccupiedByBreak && !isTooSoon
      });
    }

    currentSlot = addMinutes(currentSlot, 1); 
  }

  return slots;
}

/**
 * Validador de Negocio para Citas
 */
export async function validateAndBook(
    tenantId: string,
    serviceId: string,
    startTime: Date,
    customer: { name: string; phone: string; email?: string }
) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Servicio no encontrado");

    const endTime = addMinutes(startTime, service.duration);

    // Re-verificar disponibilidad antes de insertar (Prevención de Race Conditions)
    const conflict = await prisma.appointment.findFirst({
        where: {
            tenantId,
            status: "CONFIRMED",
            OR: [
                { startTime: { lt: endTime, gte: startTime } },
                { endTime: { gt: startTime, lte: endTime } }
            ]
        }
    });

    if (conflict) throw new Error("El horario ya ha sido ocupado.");

    // Buscar o crear cliente
    let client = await prisma.client.findUnique({
        where: {
            tenantId_phone: {
                tenantId,
                phone: customer.phone,
            }
        }
    });

    if (!client) {
        client = await prisma.client.create({
            data: {
                name: customer.name,
                phone: customer.phone,
                email: customer.email || "",
                tenantId,
            }
        });
    }

    return await prisma.appointment.create({
        data: {
            tenantId,
            serviceId,
            startTime,
            endTime,
            clientId: client.id,
            status: "CONFIRMED"
        }
    });
}
