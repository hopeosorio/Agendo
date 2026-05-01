"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigationGuard } from "@/context/NavigationContext";
import { getSchedule, updateBulkSchedule } from "@/app/actions/schedule";
import { getBlockedDates, addBlockedDate, deleteBlockedDate } from "@/app/actions/holidays";
import { getRecurringBreaks, addRecurringBreak, deleteRecurringBreak, toggleRecurringBreak } from "@/app/actions/breaks";
import {
  Loader2,
  Trash2,
  Clock,
  Calendar,
  Plus,
  RefreshCcw,
  Globe,
  Utensils,
  ChevronRight,
  Info,
  CalendarDays,
  Activity,
  Check,
  Save,
  Umbrella,
  PartyPopper,
  ChevronUp,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, isAfter, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const timeToPercent = (time: string) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return ((hours * 60 + (minutes || 0)) / (24 * 60)) * 100;
};

interface ScheduleDay {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

interface BlockedDate {
  id: string;
  date: Date;
  reason: string | null;
}

interface RecurringBreak {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [initialSchedule, setInitialSchedule] = useState<ScheduleDay[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Holidays
  const [newBlocked, setNewBlocked] = useState({ date: "", reason: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [showAddBlocked, setShowAddBlocked] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

  // Recurring Breaks
  const [recurringBreaks, setRecurringBreaks] = useState<RecurringBreak[]>([]);
  const [showAddBreak, setShowAddBreak] = useState(false);
  const [newBreak, setNewBreak] = useState({ name: "", startTime: "14:00", endTime: "15:00" });
  const [breakToDelete, setBreakToDelete] = useState<string | null>(null);

  // Global Navigation Guard
  const { setHasUnsavedChanges, resetNavigation } = useNavigationGuard();

  // Scroll indicators
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopArrow, setShowTopArrow] = useState(false);
  const [showBottomArrow, setShowBottomArrow] = useState(false);

  const handleScrollIndicators = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowTopArrow(scrollTop > 20);
      setShowBottomArrow(scrollTop + clientHeight < scrollHeight - 20);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    handleScrollIndicators();
    window.addEventListener("resize", handleScrollIndicators);
    return () => window.removeEventListener("resize", handleScrollIndicators);
  }, [blockedDates, recurringBreaks]);

  const hasChanges = JSON.stringify(schedule) !== JSON.stringify(initialSchedule);

  // Sincronizar con el guardia global
  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges, setHasUnsavedChanges]);

  const loadAllData = async () => {
    try {
      const [sData, bData, rData] = await Promise.all([
        getSchedule(),
        getBlockedDates(),
        getRecurringBreaks()
      ]);
      const scheduleData = sData as unknown as ScheduleDay[];
      setSchedule(scheduleData);
      setInitialSchedule(JSON.parse(JSON.stringify(scheduleData)));
      setBlockedDates(bData as unknown as BlockedDate[]);
      setRecurringBreaks(rData as unknown as RecurringBreak[]);
      resetNavigation();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalUpdate = (id: string, updates: Partial<ScheduleDay>) => {
    setSchedule(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateBulkSchedule(schedule);
      setInitialSchedule(JSON.parse(JSON.stringify(schedule)));
      resetNavigation();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlocked.date) return;
    setIsAdding(true);
    try {
      await addBlockedDate(newBlocked.date, newBlocked.reason);
      setNewBlocked({ date: "", reason: "" });
      setShowAddBlocked(false);
      await loadAllData();
      setTimeout(handleScrollIndicators, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBlockedDate = async () => {
    if (!holidayToDelete) return;
    try {
      await deleteBlockedDate(holidayToDelete);
      setBlockedDates(prev => prev.filter(b => b.id !== holidayToDelete));
      setHolidayToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBreak = async () => {
    if (!newBreak.name || !newBreak.startTime || !newBreak.endTime) return;
    setIsAdding(true);
    try {
      await addRecurringBreak(newBreak.name, newBreak.startTime, newBreak.endTime, 0); // Enviamos 0 por compatibilidad con DB
      setNewBreak({ name: "", startTime: "14:00", endTime: "15:00" });
      setShowAddBreak(false);
      await loadAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBreak = async () => {
    if (!breakToDelete) return;
    try {
      await deleteRecurringBreak(breakToDelete);
      setRecurringBreaks(prev => prev.filter(b => b.id !== breakToDelete));
      setBreakToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBreak = async (id: string, currentStatus: boolean) => {
    try {
      await toggleRecurringBreak(id, !currentStatus);
      setRecurringBreaks(prev => prev.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
    } catch (e) {
      console.error(e);
    }
  };

  const upcomingBlocked = blockedDates.filter(b => isAfter(new Date(b.date), startOfDay(new Date())));
  const daysOpen = schedule.filter(d => d.isOpen).length;
  const uptimePercentage = Math.round((daysOpen / 7) * 100) || 0;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Sincronizando Disponibilidad...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >

      {/* 🚀 Page Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-2xl p-6 md:px-8 rounded-[32px] border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Planificación Estratégica</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Disponibilidad</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Gestiona tus horarios operativos y días de descanso.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                onClick={loadAllData}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
              >
                <Undo2 className="w-4 h-4" />Descartar
              </motion.button>
            )}
          </AnimatePresence>
          <button
            disabled={!hasChanges || isSaving}
            onClick={handleSaveChanges}
            className={cn(
              "flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 min-w-[180px] justify-center",
              hasChanges && !isSaving 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (hasChanges ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
            {isSaving ? "Guardando..." : (hasChanges ? "Guardar Cambios" : "Sin Cambios")}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* IZQUIERDA: HORARIO SEMANAL */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[40px] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100"><Clock className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Horario Semanal</h3>
              </div>
              <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">Modo Edición</div>
            </div>

            <div className="space-y-3 relative z-10">
              {schedule.map((day) => {
                const actualIsOpen = day.isOpen !== false;
                return (
                  <motion.div key={day.id} className={cn("flex flex-col sm:flex-row sm:items-center gap-6 p-5 rounded-[28px] transition-all border", actualIsOpen ? "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md" : "bg-slate-50 border-transparent opacity-60")}>
                    <div className="w-32 flex items-center shrink-0">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" checked={actualIsOpen} onChange={() => handleLocalUpdate(day.id, { isOpen: !actualIsOpen })} className="peer sr-only" />
                          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner" />
                        </div>
                        <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{DAYS_OF_WEEK[day.dayOfWeek]}</span>
                      </label>
                    </div>

                    <div className="flex-1 flex items-center gap-6">
                      <div className="hidden sm:block flex-1 h-1.5 bg-slate-100 rounded-full relative">
                        {actualIsOpen && (
                          <>
                            <motion.div initial={{ opacity: 0 }} animate={{ left: `${timeToPercent(day.startTime || "09:00")}%`, width: `${Math.max(0, timeToPercent(day.endTime || "18:00") - timeToPercent(day.startTime || "09:00"))}%`, opacity: 1 }} className="absolute h-full bg-blue-600 rounded-full z-0" />
                            <motion.div animate={{ left: `${timeToPercent(day.startTime || "09:00")}%` }} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-md z-10" />
                            <motion.div animate={{ left: `${timeToPercent(day.endTime || "18:00")}%` }} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full shadow-md z-10" />
                          </>
                        )}
                      </div>
                      <div className={cn("flex items-center gap-2 transition-all", !actualIsOpen && "opacity-0 pointer-events-none")}>
                        <input type="time" value={day.startTime || "09:00"} onChange={(e) => handleLocalUpdate(day.id, { startTime: e.target.value })} className="bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none w-[145px] transition-all" />
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1">a las</span>
                        <input type="time" value={day.endTime || "18:00"} onChange={(e) => handleLocalUpdate(day.id, { endTime: e.target.value })} className="bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none w-[145px] transition-all" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DERECHA: RESUMEN Y BLOQUEOS */}
        <div className="lg:col-span-4 relative min-h-[600px] lg:min-h-0">
          <div className="lg:absolute lg:inset-0 flex flex-col space-y-8">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[40px] p-8 shadow-sm group hover:border-slate-300 transition-colors shrink-0">
              <div className="flex items-center gap-2 text-slate-500 mb-6">
                <Activity className="w-4 h-4" /><h3 className="text-[10px] font-bold uppercase tracking-widest leading-none">Capacidad de Operación</h3>
              </div>
              <div className="relative flex items-center justify-center py-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle className="text-slate-100" cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeWidth="12" />
                  <motion.circle initial={{ strokeDashoffset: 283 }} animate={{ strokeDashoffset: 283 - (283 * uptimePercentage) / 100 }} className="text-blue-600" cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeDasharray="283" strokeWidth="12" strokeLinecap="round" transition={{ duration: 1.5, ease: "easeOut" }} />
                </svg>
                <div className="absolute text-center flex flex-col items-center">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{uptimePercentage}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Uptime Semanal</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[40px] p-8 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">Días de</h3>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">Descanso</h3>
                </div>
                <button onClick={() => setShowAddBlocked(true)} className="text-blue-600 text-xs font-black hover:underline px-2 py-1 flex flex-col items-end">
                  <span>Agregar</span>
                </button>
              </div>

              <div className="relative flex-1 flex flex-col min-h-0">
                <AnimatePresence>{showTopArrow && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/50 p-1.5 rounded-full text-blue-600 animate-bounce"><ChevronUp className="w-3 h-3" /></div>
                  </motion.div>
                )}</AnimatePresence>
                <div ref={scrollRef} onScroll={handleScrollIndicators} className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                  <AnimatePresence mode="popLayout">
                    {upcomingBlocked.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300"><p className="text-[10px] font-bold uppercase tracking-widest">Sin días bloqueados</p></div>
                    ) : (
                      upcomingBlocked.map((b, idx) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key={b.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group relative cursor-default">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", idx % 2 === 0 ? "bg-emerald-100/50 text-emerald-600" : "bg-indigo-100/50 text-indigo-600")}>{idx % 2 === 0 ? <Umbrella className="w-5 h-5" /> : <PartyPopper className="w-5 h-5" />}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-700 truncate">{b.reason || "Día de Descanso"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(b.date), "MMM dd", { locale: es })} (Todo el día)</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                          <button onClick={() => setHolidayToDelete(b.id)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md border border-slate-100 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>{showBottomArrow && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/50 p-1.5 rounded-full text-blue-600 animate-bounce"><ChevronDown className="w-3 h-3" /></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* DESCANSOS RECURRENTES */}
        <div className="lg:col-span-12 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[48px] p-10 shadow-sm relative overflow-hidden mt-8">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] -ml-20 -mt-20 opacity-40" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100"><Utensils className="w-4 h-4" /></div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Descansos Recurrentes</h3>
              </div>
              <p className="text-sm font-medium text-slate-500">Define pausas fijas para almuerzo o tareas administrativas.</p>
            </div>
            <button onClick={() => setShowAddBreak(true)} className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-emerald-600 transition-all active:scale-95">
              <Plus className="w-4 h-4" />Nueva Regla
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {recurringBreaks.map((brk) => (
              <motion.div key={brk.id} whileHover={{ y: -5 }} className={cn("bg-white border border-slate-100 p-8 rounded-[32px] relative group hover:border-emerald-200 hover:shadow-md transition-all", !brk.isActive && "opacity-60")}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 border border-emerald-100"><Utensils className="w-6 h-6" /></div>
                  <button onClick={() => handleToggleBreak(brk.id, brk.isActive)} className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", brk.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200")}>
                    {brk.isActive ? "Activo" : "Inactivo"}
                  </button>
                </div>
                <h4 className="font-black text-slate-900 mb-1 uppercase tracking-tight">{brk.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Diario • Bloque de Tiempo</p>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black border border-slate-200 text-slate-700 shadow-inner">{brk.startTime}</span>
                  <span className="text-slate-300 font-bold text-xs">a</span>
                  <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black border border-slate-200 text-slate-700 shadow-inner">{brk.endTime}</span>
                </div>
                <button onClick={() => setBreakToDelete(brk.id)} className="absolute bottom-8 right-8 w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}

            <div onClick={() => setShowAddBreak(true)} className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-8 rounded-[32px] flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group h-full min-h-[220px]">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300 mb-4 group-hover:text-blue-500 transition-all"><Plus className="w-6 h-6" /></div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Añadir nueva regla recurrente</p>
            </div>
          </div>
        </div>

      </div>

      {/* Modal para añadir Día de Descanso */}
      <AnimatePresence>
        {showAddBlocked && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBlocked(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white border border-slate-200 p-8 rounded-[40px] shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Bloquear Fecha</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seleccionar Fecha</label>
                  <input type="date" min={new Date().toISOString().split("T")[0]} value={newBlocked.date} onChange={e => setNewBlocked({ ...newBlocked, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Motivo (Opcional)</label>
                  <input placeholder="Ej. Vacaciones, Mantenimiento..." value={newBlocked.reason} onChange={e => setNewBlocked({ ...newBlocked, reason: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddBlocked(false)} className="flex-1 py-4 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                <button disabled={!newBlocked.date || isAdding} onClick={handleAddBlockedDate} className="flex-1 py-4 px-4 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50">{isAdding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Bloquear"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para añadir Descanso Recurrente */}
      <AnimatePresence>
        {showAddBreak && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBreak(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white border border-slate-200 p-8 rounded-[40px] shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Utensils className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Nuevo Descanso</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input placeholder="Ej. Hora de Comida" value={newBreak.name} onChange={e => setNewBreak({ ...newBreak, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Inicia</label>
                    <input type="time" value={newBreak.startTime} onChange={e => setNewBreak({ ...newBreak, startTime: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Termina</label>
                    <input type="time" value={newBreak.endTime} onChange={e => setNewBreak({ ...newBreak, endTime: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddBreak(false)} className="flex-1 py-4 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                <button disabled={!newBreak.name || isAdding} onClick={handleAddBreak} className="flex-1 py-4 px-4 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50">{isAdding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Crear"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alerta de Confirmación de Eliminación (Festivos) */}
      <AnimatePresence>
        {holidayToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHolidayToDelete(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xs bg-white p-8 rounded-[40px] shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-100"><Trash2 className="w-8 h-8" /></div>
              <div><h3 className="text-xl font-black text-slate-900">¿Eliminar fecha?</h3><p className="text-sm font-medium text-slate-500 mt-2">Esta acción permitirá que los clientes agenden citas en este día.</p></div>
              <div className="flex flex-col gap-3">
                <button onClick={handleDeleteBlockedDate} className="w-full py-4 bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">Sí, eliminar</button>
                <button onClick={() => setHolidayToDelete(null)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alerta de Confirmación de Eliminación (Descansos) */}
      <AnimatePresence>
        {breakToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBreakToDelete(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xs bg-white p-8 rounded-[40px] shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-100"><Trash2 className="w-8 h-8" /></div>
              <div><h3 className="text-xl font-black text-slate-900">¿Eliminar descanso?</h3><p className="text-sm font-medium text-slate-500 mt-2">Este bloque de tiempo dejará de estar protegido y los clientes podrán agendar en este horario.</p></div>
              <div className="flex flex-col gap-3">
                <button onClick={handleDeleteBreak} className="w-full py-4 bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">Eliminar Regla</button>
                <button onClick={() => setBreakToDelete(null)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Mantener</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
