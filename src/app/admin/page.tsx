"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardSummary } from "@/app/actions/dashboard";
import { 
  Loader2, 
  Check, 
  Copy, 
  Plus,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  Wallet,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Save
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import Link from "next/link";
import { 
  format, 
  startOfToday, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(startOfToday()));
  const today = startOfToday();
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyBookingLink = () => {
    const url = `${window.location.origin}/book/${data.tenant?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
       <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
       <p className="font-bold text-xs uppercase tracking-widest text-slate-400">Sincronizando Panel...</p>
    </div>
  );

  if (!data) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-rose-500">
       <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center border border-rose-100">
          <Check className="w-8 h-8 text-rose-500" /> 
       </div>
       <p className="font-bold text-xs uppercase tracking-widest text-slate-900">Error de conexión</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* 🚀 Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-2xl p-6 rounded-[32px] border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
             <TrendingUp className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Estadísticas en Vivo</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Resumen Ejecutivo</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Monitorea la actividad de tus servicios y citas para hoy.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/services" className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Servicio
          </Link>
        </div>
      </header>

      {/* Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-100" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-indigo-100/50 text-indigo-600 rounded-2xl border border-indigo-100">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Citas Totales</p>
            <p className="text-4xl font-black text-slate-900 mt-1">{data.kpis.totalAppointments}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-100" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl border border-emerald-100">
              <CalendarClock className="w-6 h-6" />
            </div>
            {data.kpis.todayAppointments > 0 && <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">Hoy</span>}
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Para Hoy</p>
            <p className="text-4xl font-black text-slate-900 mt-1">{data.kpis.todayAppointments}</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-100" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl border border-emerald-100">
              <Wallet className="w-6 h-6" />
            </div>
            {data.kpis.totalIncomeToday > 0 && <span className="text-emerald-600 text-[10px] font-black uppercase tracking-wider bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">Generado</span>}
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Ingresos Hoy</p>
            <p className="text-4xl font-black text-slate-900 mt-1">
              ${data.kpis.totalIncomeToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] shadow-lg shadow-blue-500/20 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
              <LinkIcon className="w-6 h-6 text-blue-50" />
            </div>
            <button 
               onClick={copyBookingLink} 
               className="p-2.5 bg-white/10 hover:bg-white/30 rounded-xl transition-all cursor-pointer backdrop-blur-md active:scale-95 flex items-center justify-center min-w-[40px]" 
            >
               {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-blue-100 font-bold text-[11px] uppercase tracking-widest">Portal de Reservas</p>
            <p className="text-sm font-bold truncate mt-1 bg-white/10 p-2.5 rounded-xl border border-white/10 font-mono">
              agendo-five.vercel.app/book/{data.tenant?.slug}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Interactive Section: Calendar & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
               <h3 className="text-xl font-black text-slate-900">Agenda</h3>
               <p className="text-sm font-medium text-slate-500 mt-1">Vista rápida del mes</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-full shadow-sm">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-blue-600"><ChevronLeft className="w-5 h-5" /></button>
              <span className="font-bold text-sm text-slate-700 capitalize min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy", { locale: es })}</span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-blue-600"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex-1">
            <div className="min-w-[500px] h-full flex flex-col">
              <div className="grid grid-cols-7 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-4 flex-1">
                {days.map((date) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isToday = isSameDay(date, today);
                  const dayKey = format(date, "yyyy-MM-dd");
                  const count = data.appointmentsByDay?.[dayKey] || 0;

                  return (
                    <motion.div 
                      onClick={() => router.push('/admin/appointments')}
                      whileHover={{ scale: 1.05 }}
                      key={date.toISOString()}
                      className={cn(
                        "aspect-square p-1.5 md:p-2 rounded-2xl md:rounded-[24px] flex flex-col items-center justify-center transition-all relative cursor-pointer",
                        !isCurrentMonth ? "text-slate-300 opacity-50" : "bg-slate-50 border border-slate-100 hover:border-blue-300 hover:shadow-sm",
                        isToday && "bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/30 ring-4 ring-white"
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
                          {count > 0 && (
                            <div className="absolute top-2 right-2 md:top-3 md:right-3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          )}
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Recientes */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">Recientes</h3>
              <Link href="/admin/appointments" className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-full">Ver Todo</Link>
            </div>
            
            <div className="space-y-3 flex-1">
              {data.recentAppointments.map((a: any) => {
                 const isConfirmed = a.status === "CONFIRMED";
                 const initials = a.client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                 return (
                  <motion.div 
                    key={a.id}
                    whileHover={{ scale: 1.02, y: -2 }} 
                    onClick={() => router.push(`/admin/clients/${a.client.id}`)}
                    className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:border-slate-200 transition-all cursor-pointer relative overflow-hidden group flex items-center gap-4"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center text-sm font-black shadow-inner transition-all duration-300 group-hover:-translate-x-2", 
                      isConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:-translate-x-3">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-black text-slate-900 text-sm leading-tight truncate pr-2">{a.client.name}</h4>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm shrink-0", 
                          isConfirmed ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {isConfirmed ? "Confirmada" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 truncate mb-2">{a.service.name}</p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-md">
                        <CalendarClock className="w-3 h-3 text-slate-400" />
                        <span className="capitalize">{format(new Date(a.startTime), "EEEE dd MMM • HH:mm", { locale: es })}</span>
                      </div>
                    </div>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </motion.div>
                 );
              })}

              {data.recentAppointments.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 font-medium text-sm border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                   <CalendarOff className="w-8 h-8 mb-2 text-slate-300" />
                   No hay citas pendientes.
                </div>
              )}
            </div>
          </div>

          {/* Activity Graph Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[48px] overflow-hidden relative shadow-sm min-h-[300px] flex flex-col group transition-all hover:shadow-xl hover:shadow-blue-500/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20 transition-all group-hover:bg-blue-100" />
            <div className="relative z-10 mb-auto">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Rendimiento</p>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight">Actividad Semanal</h3>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">+12% vs ayer</div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {data.chartData?.reduce((acc: number, curr: any) => acc + (curr.citas || 0), 0)}
                </p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Reservas totales esta semana</p>
              </div>
            </div>

            <div className="h-[120px] -mx-8 mt-4 relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#0f172a', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                       itemStyle={{ color: '#3b82f6' }}
                       formatter={(value: any) => [value, "Reservas"]}
                       labelFormatter={(label: any) => `Día: ${label}`}
                    />
                    <Area type="monotone" dataKey="citas" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCitas)" animationDuration={2000} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
