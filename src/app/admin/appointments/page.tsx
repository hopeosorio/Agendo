"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { getAdminAppointments, updateAppointmentStatus, deleteAdminAppointment, rescheduleAdminAppointment } from "@/app/actions/appointments";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutGrid,
  LayoutList,
  Smartphone,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  CalendarOff,
  Clock,
  Users,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  startOfDay,
  isBefore
} from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  client: { name: string; phone: string };
  startTime: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NOSHOW";
  service: { name: string; price: number; duration: number };
}

const statusMap = {
  PENDING: { label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Completada", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CANCELLED: { label: "Cancelada", color: "bg-slate-100 text-slate-700 border-slate-200" },
  NOSHOW: { label: "No asistió", color: "bg-rose-100 text-rose-700 border-rose-200" }
};

export default function AppointmentsPage() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"MONTH" | "WEEK">("WEEK");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: "NOSHOW" | "CANCEL" | "DELETE" } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);

  // 🛰️ Manejar parámetros de navegación inteligente (Deep Linking)
  useEffect(() => {
    if (!loading && appointments.length > 0) {
      const dateParam = searchParams.get("date");
      const idParam = searchParams.get("id");

      if (dateParam) {
        const targetDate = new Date(dateParam + "T00:00:00");
        if (!isNaN(targetDate.getTime())) {
          setCurrentDate(targetDate);
        }
      }

      if (idParam) {
        const appointment = appointments.find(a => a.id === idParam);
        if (appointment) {
          setSelectedAppointment(appointment);
        }
      }
    }
  }, [loading, appointments, searchParams]);

  useEffect(() => {
    loadAppointments();
  }, []);

  // Resetear el flag de scroll cuando cambiamos de fecha o vista
  useEffect(() => {
    hasInitialScrolled.current = false;
  }, [currentDate, view]);

  // 🎯 Auto-Scroll Inteligente (Solo una vez por cambio de estado relevante)
  useEffect(() => {
    if (view === "WEEK" && !loading && !hasInitialScrolled.current) {
      const performScroll = () => {
        if (scrollRef.current) {
          let targetHour, targetMinutes;
          const idParam = searchParams.get("id");

          if (idParam && selectedAppointment && selectedAppointment.id === idParam) {
            const appDate = new Date(selectedAppointment.startTime);
            targetHour = appDate.getHours();
            targetMinutes = appDate.getMinutes();
          } else {
            const now = new Date();
            targetHour = now.getHours();
            targetMinutes = now.getMinutes();
          }

          if (targetHour >= START_HOUR && targetHour < START_HOUR + TOTAL_HOURS) {
            const scrollPosition = (targetHour - START_HOUR) * HOUR_HEIGHT + (targetMinutes / 60) * HOUR_HEIGHT;
            scrollRef.current.scrollTo({
              top: Math.max(0, scrollPosition - 150),
              behavior: "smooth"
            });
            hasInitialScrolled.current = true; // Marcamos como scroll realizado
          }
        }
      };

      const timer1 = setTimeout(performScroll, 600);
      const timer2 = setTimeout(performScroll, 1300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [view, loading, appointments.length, selectedAppointment !== null, currentDate]); 

  const loadAppointments = async () => {
    try {
      const data = await getAdminAppointments();
      setAppointments(data as unknown as Appointment[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: any) => {
    setIsUpdating(true);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, status } : null);
      }
    } catch (e) {
      alert("Error al actualizar");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cita definitivamente?")) return;
    try {
      await deleteAdminAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      setSelectedAppointment(null);
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const days = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    if (view === "MONTH") {
      const end = addDays(start, 34);
      return eachDayOfInterval({ start, end });
    } else {
      const end = addDays(start, 6);
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, view]);

  const HOUR_HEIGHT = 80;
  const START_HOUR = 8;
  const TOTAL_HOURS = 14; // 8:00 to 22:00
  const hoursArray = Array.from({ length: TOTAL_HOURS }).map((_, i) => i + START_HOUR);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

      {/* 🚀 Modern Header (Teams Style) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Calendario</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">{format(currentDate, "MMMM yyyy", { locale: es })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button onClick={() => setView("WEEK")} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", view === "WEEK" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>Semana</button>
            <button onClick={() => setView("MONTH")} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", view === "MONTH" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>Mes</button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1" />

          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(addDays(currentDate, view === "MONTH" ? -30 : -7))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-100 rounded-xl transition-all">Hoy</button>
            <button onClick={() => setCurrentDate(addDays(currentDate, view === "MONTH" ? 30 : 7))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="bg-white border border-slate-200 rounded-[32px] shadow-xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[600px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="font-bold text-xs uppercase tracking-widest text-slate-400">Organizando Agenda...</p>
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "flex flex-col transition-all duration-500",
                view === "WEEK" ? "h-[calc(100vh-280px)] min-h-[600px]" : "h-auto"
              )}
            >

              {view === "WEEK" && (
                <>
                  {/* Week Header */}
                  <div className="flex border-b border-slate-100 bg-white sticky top-0 z-20">
                    <div className="w-20 shrink-0 flex items-center justify-center border-r border-slate-50"><Clock className="w-4 h-4 text-slate-300" /></div>
                    {days.map(day => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div key={day.toISOString()} className={cn("flex-1 py-4 flex flex-col items-center border-r border-slate-50", isToday && "bg-blue-50/30")}>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", isToday ? "text-blue-600" : "text-slate-400")}>{format(day, "eee", { locale: es })}</span>
                          <span className={cn("text-xl font-black mt-0.5", isToday ? "text-blue-700" : "text-slate-900")}>{format(day, "d")}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scrollable Area */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
                    <div className="flex w-full relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>

                      {/* Time Grid Lines */}
                      <div className="absolute inset-0 left-20 pointer-events-none">
                        {hoursArray.map((_, i) => (
                          <div key={i} className="absolute w-full border-b border-slate-100" style={{ top: `${(i) * HOUR_HEIGHT}px` }} />
                        ))}
                      </div>

                      {/* Time Labels */}
                      <div className="w-20 shrink-0 border-r border-slate-100 flex flex-col items-center relative">
                        {hoursArray.map((h, i) => (
                          <div key={h} className="absolute right-3" style={{ top: `${i * HOUR_HEIGHT}px`, transform: 'translateY(-50%)' }}>
                            <span className="text-[10px] font-black text-slate-500">{h.toString().padStart(2, '0')}:00</span>
                          </div>
                        ))}
                      </div>

                      {/* Day Columns & Appointments */}
                      <div className="flex-1 flex relative">
                        {days.map((day, dayIdx) => {
                          const dayApps = appointments
                            .filter(a => isSameDay(new Date(a.startTime), day))
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                          // Algoritmo de Columnas para Solapamientos
                          const columns: Appointment[][] = [];
                          dayApps.forEach(app => {
                            let placed = false;
                            const appStart = new Date(app.startTime).getTime();

                            for (let i = 0; i < columns.length; i++) {
                              const lastAppInCol = columns[i][columns[i].length - 1];
                              const lastAppEnd = new Date(lastAppInCol.startTime).getTime() + (lastAppInCol.service?.duration || 60) * 60000;

                              // Si no solapa con la última de esta columna, la ponemos aquí
                              if (appStart >= lastAppEnd) {
                                columns[i].push(app);
                                placed = true;
                                break;
                              }
                            }

                            if (!placed) {
                              columns.push([app]);
                            }
                          });

                          const isToday = isSameDay(day, new Date());
                          const now = new Date();
                          const isCurrentTimeVisible = isToday && now.getHours() >= START_HOUR && now.getHours() < START_HOUR + TOTAL_HOURS;
                          const currentTop = (now.getHours() - START_HOUR) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT;

                          return (
                            <div key={day.toISOString()} className={cn("flex-1 relative border-r border-slate-50/50", isToday && "bg-blue-50/10")}>

                              {isCurrentTimeVisible && (
                                <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${currentTop}px` }}>
                                  <div className="absolute -left-1 w-2 h-2 rounded-full bg-rose-500 shadow-sm" style={{ transform: 'translateY(-50%)' }} />
                                  <div className="w-full border-t-2 border-rose-500/50" />
                                </div>
                              )}

                              {columns.map((column, colIdx) => {
                                const width = 100 / columns.length;
                                const left = colIdx * width;

                                return column.map(a => {
                                  const start = new Date(a.startTime);
                                  const duration = a.service?.duration || 60;
                                  const top = (start.getHours() - START_HOUR) * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
                                  const height = (duration / 60) * HOUR_HEIGHT;

                                  return (
                                    <motion.div
                                      key={a.id}
                                      layoutId={a.id}
                                      onClick={() => setSelectedAppointment(a)}
                                      style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: `${left}%`,
                                        width: `${width}%`
                                      }}
                                      className={cn(
                                        "absolute p-1.5 rounded cursor-pointer transition-all hover:brightness-95 overflow-hidden z-10 shadow-sm",
                                        statusMap[a.status]?.color || "bg-slate-100 text-slate-700"
                                      )}
                                    >
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                        <span className="text-[9px] font-black opacity-50 shrink-0">{format(start, "HH:mm")}</span>
                                        <p className="text-[10px] font-bold truncate">{a.client?.name}</p>
                                      </div>
                                      {height > 40 && (
                                        <p className="text-[9px] font-medium opacity-60 truncate ml-8 mt-0.5">{a.service?.name}</p>
                                      )}
                                    </motion.div>
                                  );
                                });
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {view === "MONTH" && (
                <div className="p-4 md:p-8">
                  {/* Header de Días */}
                  <div className="grid grid-cols-7 mb-4">
                    {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
                      <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">{d}</div>
                    ))}
                  </div>

                  {/* Cuadrícula de Celdas (IDÉNTICA AL DASHBOARD) */}
                  <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {days.map(date => {
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const dayApps = appointments.filter(a => isSameDay(new Date(a.startTime), date));
                      const isToday = isSameDay(date, new Date());
                      const count = dayApps.length;

                      return (
                        <motion.div
                          key={date.toISOString()}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => { setCurrentDate(date); setView("WEEK"); }}
                          className={cn(
                            "aspect-square p-1.5 md:p-2 rounded-2xl md:rounded-[24px] flex flex-col items-center justify-center transition-all relative cursor-pointer",
                            !isCurrentMonth ? "text-slate-300 opacity-50" : "bg-slate-50 border border-slate-100 hover:border-blue-300 hover:shadow-sm",
                            isToday && "bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/30 ring-4 ring-white z-10"
                          )}
                        >
                          {isToday ? (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-90 mb-1">
                                {format(date, "EEE", { locale: es }).replace('.', '')}
                              </span>
                              <span className="text-xl md:text-2xl font-black text-white leading-none">
                                {format(date, "d")}
                              </span>
                              {count > 0 && (
                                <div className="mt-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
                                  <p className="text-[8px] md:text-[9px] font-black text-white whitespace-nowrap uppercase tracking-wider">
                                    {count} {count === 1 ? 'Reserva' : 'Reservas'}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <span className={cn(
                                "font-black text-sm md:text-lg",
                                isCurrentMonth ? "text-slate-700" : "text-slate-400"
                              )}>
                                {format(date, "d")}
                              </span>
                              {count > 0 && isCurrentMonth && (
                                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                              )}
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🧩 Teams-Style Side Drawer (Detalle de Cita) */}
      <AnimatePresence>
        {selectedAppointment && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedAppointment(null)} 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
              style={{ height: '100vh', width: '100vw' }}
            />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] border-l border-slate-200 overflow-hidden flex flex-col">

              {/* Drawer Header */}
              <div className="p-8 border-b border-slate-100 relative">
                <button onClick={() => setSelectedAppointment(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><ChevronRight className="w-6 h-6" /></button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center border border-blue-100">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      statusMap[selectedAppointment.status]?.color)}>
                      {statusMap[selectedAppointment.status]?.label || selectedAppointment.status}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">{selectedAppointment.client?.name}</h2>
                  </div>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><CalendarIcon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha y Hora</p>
                      <p className="text-sm font-bold text-slate-700">{format(new Date(selectedAppointment.startTime), "EEEE d 'de' MMMM, HH:mm", { locale: es })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><LayoutList className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Servicio Agendado</p>
                      <p className="text-sm font-bold text-slate-700">{selectedAppointment.service?.name}</p>
                      <p className="text-xs font-medium text-slate-400">{selectedAppointment.service?.duration} minutos · ${selectedAppointment.service?.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><Smartphone className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contacto</p>
                      <p className="text-sm font-bold text-slate-700">{selectedAppointment.client?.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Acciones Rápidas</p>

                  <div className="grid grid-cols-2 gap-3">
                    {selectedAppointment.status === "PENDING" && (
                       <button
                         onClick={() => handleStatusChange(selectedAppointment.id, "CONFIRMED")}
                         disabled={isUpdating}
                         className="flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                       >
                         <CheckCircle2 className="w-4 h-4" /> Confirmar
                       </button>
                    )}
                    {selectedAppointment.status === "CONFIRMED" && (
                       <button
                         onClick={() => setConfirmAction({ id: selectedAppointment.id, type: "NOSHOW" })}
                         disabled={isUpdating}
                         className="flex items-center justify-center gap-2 py-4 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                       >
                         <CalendarOff className="w-4 h-4" /> No asistió
                       </button>
                    )}
                    {selectedAppointment.status !== "NOSHOW" && (
                       <button
                         onClick={() => setConfirmAction({ id: selectedAppointment.id, type: "CANCEL" })}
                         disabled={isUpdating}
                         className={cn(
                            "flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2",
                            selectedAppointment.status === "PENDING" || selectedAppointment.status === "CONFIRMED" 
                               ? "bg-white border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100" 
                               : "bg-white border-slate-100 text-rose-600 col-span-2"
                         )}
                       >
                         <XCircle className="w-4 h-4" /> Cancelar
                       </button>
                    )}
                  </div>

                  <button
                    onClick={() => setConfirmAction({ id: selectedAppointment.id, type: "DELETE" })}
                    className="w-full py-4 text-slate-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Eliminar del sistema
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Agendo · Gestión Inteligente</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ⚠️ MODAL CONFIRMACIÓN DINÁMICO */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setConfirmAction(null)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" 
             />
             <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl relative z-10 border border-slate-200 text-center"
             >
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto border",
                  confirmAction.type === 'DELETE' ? "bg-rose-100 border-rose-200 text-rose-600" : "bg-amber-50 border-amber-100 text-amber-500"
                )}>
                   {confirmAction.type === 'DELETE' ? <XCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-2">
                   {confirmAction.type === 'DELETE' ? '¿Eliminar cita?' : 
                    confirmAction.type === 'CANCEL' ? '¿Cancelar cita?' : '¿Confirmar inasistencia?'}
                </h3>
                
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                   {confirmAction.type === 'DELETE' ? 'Esta acción es permanente y no se puede deshacer.' : 
                    confirmAction.type === 'CANCEL' ? 'La cita quedará marcada como cancelada en el historial.' : 
                    'El cliente quedará registrado como "No asistió" de forma permanente.'}
                </p>

                <div className="flex gap-3">
                   <button 
                     onClick={() => setConfirmAction(null)}
                     className="flex-1 py-4 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                   >
                     Volver
                   </button>
                   <button 
                     onClick={async () => {
                        if (confirmAction.type === 'DELETE') {
                           await deleteAdminAppointment(confirmAction.id);
                           setAppointments(prev => prev.filter(a => a.id !== confirmAction.id));
                           setSelectedAppointment(null);
                        } else {
                           const status = confirmAction.type === 'CANCEL' ? 'CANCELLED' : 'NOSHOW';
                           await handleStatusChange(confirmAction.id, status);
                        }
                        setConfirmAction(null);
                     }}
                     className={cn(
                        "flex-1 py-4 px-4 rounded-2xl text-white font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all",
                        confirmAction.type === 'DELETE' ? "bg-slate-900 shadow-slate-900/20" : "bg-rose-600 shadow-rose-500/20"
                     )}
                   >
                     Confirmar
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
