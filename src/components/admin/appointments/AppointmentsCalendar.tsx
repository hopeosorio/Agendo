"use client";

import { useState } from "react";
import { 
  Plus, ChevronLeft, ChevronRight, Sparkles, LayoutGrid, CalendarDays, 
  Clock, MoreVertical, CheckCircle2, Calendar as CalendarIcon, Printer 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth
} from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface Appointment {
  id: string;
  startTime: Date;
  customerName: string;
  status: string;
  service: { name: string; duration: number } | any;
}

interface AppointmentsCalendarProps {
  initialAppointments: Appointment[];
}

const TIME_BLOCKS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export function AppointmentsCalendar({ initialAppointments }: AppointmentsCalendarProps) {
  const [viewMode, setViewMode] = useState<"WEEK" | "MONTH">("WEEK");
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());

  const next = () => viewMode === "WEEK" ? setCurrentDate(prev => addWeeks(prev, 1)) : setCurrentDate(prev => addMonths(prev, 1));
  const prev = () => viewMode === "WEEK" ? setCurrentDate(prev => subWeeks(prev, 1)) : setCurrentDate(prev => subMonths(prev, 1));

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayAppointments = (day: Date) => initialAppointments.filter(a => isSameDay(a.startTime, day));

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* 1. Header Integrado */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 py-2">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 leading-none">
             <Sparkles className="w-3.5 h-3.5" />
             Agenda Operativa SaaS
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
             {viewMode === "WEEK" ? "Vista de Semana" : "Vista de Mes"}
           </h1>
           <p className="text-slate-400 font-bold text-lg max-w-lg leading-snug">
             Visualización táctil diseñada para el control administrativo de todas tus citas.
           </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl h-16 shadow-premium">
              <button onClick={() => setViewMode("WEEK")} className={cn("h-full px-6 flex items-center gap-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest", viewMode === "WEEK" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}> <LayoutGrid className="w-4 h-4" /> SEMANA </button>
              <button onClick={() => setViewMode("MONTH")} className={cn("h-full px-6 flex items-center gap-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest", viewMode === "MONTH" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}> <CalendarDays className="w-4 h-4" /> MES </button>
           </div>
           <button className="h-16 px-8 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-xl active:scale-95 transition-all"> NUEVA CITA MANUAL </button>
        </div>
      </header>

      {/* 2. Unified Grid Section */}
      <section className="bg-slate-950/40 border border-slate-900 rounded-[52px] p-6 md:p-10 backdrop-blur-3xl shadow-premium overflow-x-auto custom-scrollbar min-w-[1000px]">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <div className="bg-white/5 border border-slate-800 p-4 rounded-[28px] text-white"> <CalendarIcon className="w-6 h-6 text-indigo-400" /> </div>
              <div>
                <h2 className="text-3xl font-black text-white capitalize leading-tight"> {format(currentDate, viewMode === "WEEK" ? "'Semana de' d MMMM" : "MMMM yyyy", { locale: es })} </h2>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sincronización Real con Prisma</p>
              </div>
              <div className="flex items-center bg-slate-900 rounded-2xl border border-slate-800 p-1 h-14 ml-4">
                 <button onClick={prev} className="h-full px-5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"> <ChevronLeft strokeWidth={3} /> </button>
                 <div className="w-[1px] h-6 bg-slate-800 mx-1" />
                 <button onClick={next} className="h-full px-5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"> <ChevronRight strokeWidth={3} /> </button>
              </div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "WEEK" ? (
             <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] mb-6">
                   <div />
                   {weekDays.map(day => (
                     <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cn("text-center py-4 space-y-1 cursor-pointer rounded-2xl", isSameDay(day, selectedDate) && "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20")}>
                        <p className="text-[9px] font-black uppercase text-slate-600">{format(day, "eee", { locale: es })}</p>
                        <p className="text-2xl font-black">{format(day, "d")}</p>
                     </div>
                   ))}
                </div>
                {TIME_BLOCKS.map(time => (
                  <div key={time} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] h-32 group/row">
                     <div className="flex items-start justify-center pt-4 text-xs font-black text-slate-700">{time}</div>
                     {weekDays.map(day => {
                       const appts = initialAppointments.filter(a => isSameDay(a.startTime, day) && format(a.startTime, "HH:00") === time);
                       return (
                         <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className="relative border-l border-t border-slate-900 border-dashed hover:bg-white/[0.02]">
                            {appts.map(a => (
                              <div key={a.id} className={cn("absolute inset-2 p-3 rounded-2xl border text-[9px] font-black uppercase shadow-lg", a.status === "CONFIRMED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500")}> {a.customerName} </div>
                            ))}
                         </div>
                       );
                     })}
                  </div>
                ))}
             </motion.div>
          ) : (
             <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-7 gap-4 h-[700px]">
                {monthDays.map(day => {
                  const appts = getDayAppointments(day);
                  const isOtherMonth = !isSameMonth(day, currentDate);
                  return (
                    <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cn("relative p-4 rounded-[32px] border transition-all flex flex-col gap-2 cursor-pointer", isOtherMonth && "opacity-20 grayscale", isSameDay(day, selectedDate) ? "bg-indigo-600/10 border-indigo-500" : "bg-slate-950/20 border-slate-900 hover:bg-white/5")}>
                       <span className="text-base font-black text-slate-500">{format(day, "d")}</span>
                       <div className="space-y-1 mt-1"> {appts.slice(0, 3).map(a => <div key={a.id} className="p-1 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[8px] font-black text-white uppercase truncate">{a.customerName}</div>)} </div>
                    </div>
                  );
                })}
             </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. Detail Section */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedDate.toISOString()} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-950/40 border border-slate-800 rounded-[52px] p-10 md:p-14 backdrop-blur-3xl shadow-premium">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
              <div className="flex items-center gap-8">
                 <div className="w-24 h-24 bg-indigo-600 shadow-xl shadow-indigo-600/30 rounded-[32px] flex flex-col items-center justify-center text-white">
                    <span className="text-3xl font-black leading-none">{format(selectedDate, "d")}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{format(selectedDate, "MMM", { locale: es })}</span>
                 </div>
                 <div> <h3 className="text-3xl font-black text-white">Agenda del Día</h3> <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</p> </div>
              </div>
              <button className="h-16 px-10 rounded-[28px] border border-slate-900 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-all flex items-center gap-3"> <Printer className="w-5 h-5" /> Imprimir </button>
           </div>
           <div className="space-y-4">
              {getDayAppointments(selectedDate).length > 0 ? getDayAppointments(selectedDate).map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-8 rounded-[40px] bg-slate-950/60 border border-slate-900 group hover:border-slate-800 transition-all duration-500">
                   <div className="flex items-center gap-10">
                      <div className="text-3xl font-black text-indigo-500">{format(appt.startTime, "HH:mm a")}</div>
                      <div> <h4 className="text-2xl font-black text-white">{appt.customerName}</h4> <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{appt.service?.name || "Servicio General"}</p> </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest", appt.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}> {appt.status} </div>
                      <div className="h-14 w-14 rounded-2xl border border-slate-900 flex items-center justify-center text-slate-600 hover:text-white cursor-pointer"><MoreVertical strokeWidth={2.5}/></div>
                   </div>
                </div>
              )) : (
                <div className="py-24 text-center border-2 border-dashed border-slate-900 rounded-[52px] space-y-4">
                   <CalendarIcon className="w-16 h-16 text-slate-800 mx-auto" />
                   <div> <p className="text-xl font-black text-slate-500 uppercase tracking-widest">Sin citas para hoy</p> <p className="text-sm font-bold text-slate-700">Agenda libre operativa.</p> </div>
                </div>
              )}
           </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
