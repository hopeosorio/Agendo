"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClientDetail } from "@/app/actions/clients";
import { updateAppointmentStatus } from "@/app/actions/appointments";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  X,
  Calendar, 
  CalendarOff,
  History, 
  FileText, 
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  TrendingUp,
  User,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "notes">("history");
  const [confirmNoShowId, setConfirmNoShowId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      const data = await getClientDetail(id as string);
      setClient(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-500">
       <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
       <p className="font-bold text-xs uppercase tracking-widest text-slate-400">Recopilando Perfil...</p>
    </div>
  );

  if (!client) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-6 text-slate-500">
       <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
          <User className="w-10 h-10" />
       </div>
       <p className="font-black text-xl text-slate-900 tracking-tight">Cliente No Encontrado</p>
       <button onClick={() => router.back()} className="text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors flex items-center gap-2">
         <ArrowLeft className="w-4 h-4" /> Volver al Directorio
       </button>
    </div>
  );

  // Calcular Inversión Bruta (Total gastado)
  const totalSpent = client.appointments
    .filter((app: any) => app.status === "CONFIRMED" || app.status === "COMPLETED")
    .reduce((sum: number, app: any) => sum + (app.service?.price || 0), 0);

  const completedApps = client.appointments.filter((app: any) => app.status === "CONFIRMED" || app.status === "COMPLETED").length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      
      {/* 🔙 BACK NAV */}
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all w-fit"
      >
         <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors shadow-sm">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
         </div>
         Directorio
      </button>

      {/* 🚀 PROFILE HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* IZQUIERDA: TARJETA DE PERFIL CORE */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="p-8 rounded-[40px] bg-white/80 border border-slate-200 shadow-sm backdrop-blur-xl relative overflow-hidden group hover:border-slate-300 transition-colors">
             {/* Decoración Background */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-100" />
             
             <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                {/* Avatar Inteligente */}
                <div className="w-28 h-28 rounded-[38px] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/30 border-4 border-white/20">
                   {client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                
                <div className="space-y-1">
                   <h1 className="text-2xl font-black text-slate-900 tracking-tight">{client.name}</h1>
                   <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit mx-auto border border-emerald-100">
                     <Sparkles className="w-3.5 h-3.5" /> Cliente Activo
                   </div>
                </div>

                <div className="w-full space-y-2 pt-6 border-t border-slate-100">
                   <a href={`tel:${client.phone}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all group overflow-hidden">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-900">
                        <Phone className="w-3.5 h-3.5" /> Teléfono
                      </div>
                      <span className="text-xs font-bold text-slate-900">{client.phone}</span>
                   </a>
                   <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </div>
                      <span className="text-xs font-bold text-slate-900 lowercase truncate max-w-[150px]">{client.email || "No registrado"}</span>
                   </div>
                </div>

                <div className="flex gap-3 w-full pt-2">
                   <a 
                     href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex-grow h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                   >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                   </a>
                   <button className="h-12 w-12 shrink-0 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>

          <div className="p-8 rounded-[40px] bg-white/80 border border-slate-200 shadow-sm flex flex-col gap-5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Métricas de Valor</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                   <p className="text-2xl font-black text-slate-900 mb-0.5">{completedApps}</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Citas Completadas</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                   <p className="text-2xl font-black text-blue-600 mb-0.5">${totalSpent}</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">LTV (Ingresos)</p>
                </div>
             </div>
          </div>
        </div>

        {/* DERECHA: TABS Y CONTENIDO DETALLADO */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* TABS NAVIGATION */}
           <div className="flex p-1.5 bg-slate-100/80 border border-slate-200/60 rounded-[24px] w-fit shadow-inner">
              <button 
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-8 h-11 rounded-[18px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                 <History className="w-4 h-4" /> Historial de Citas
              </button>
              <button 
                onClick={() => setActiveTab("notes")}
                className={cn(
                  "px-8 h-11 rounded-[18px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "notes" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                 <FileText className="w-4 h-4" /> Notas Internas
              </button>
           </div>

           <AnimatePresence mode="wait">
              {activeTab === "history" ? (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                   {client.appointments.map((app: any) => {
                     const appDate = new Date(app.startTime);
                     const isPast = appDate < new Date();
                     
                     // Lógica de estado visual
                     let statusLabel = "Pendiente";
                     let statusStyles = "border-amber-200 text-amber-600 bg-amber-50";
                     let statusIcon = <Clock className="w-3 h-3" />;

                     if (app.status === "NOSHOW") {
                        statusLabel = "No asistió";
                        statusStyles = "border-rose-200 text-rose-600 bg-rose-50";
                        statusIcon = <CalendarOff className="w-3 h-3" />;
                     } else if (app.status === "CANCELLED") {
                        statusLabel = "Cancelada";
                        statusStyles = "border-slate-200 text-slate-400 bg-slate-50";
                        statusIcon = <X className="w-3 h-3" />;
                     } else if (app.status === "CONFIRMED" || app.status === "COMPLETED") {
                        if (isPast) {
                           statusLabel = "Completada";
                           statusStyles = "border-emerald-200 text-emerald-600 bg-emerald-50";
                           statusIcon = <CheckCircle2 className="w-3 h-3" />;
                        } else {
                           statusLabel = "Próxima";
                           statusStyles = "border-blue-200 text-blue-600 bg-blue-50";
                           statusIcon = <Sparkles className="w-3 h-3" />;
                        }
                     }

                     return (
                       <div 
                         key={app.id}
                         className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 rounded-[32px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all gap-6"
                       >
                          <div className="flex items-center gap-5">
                             <div className={cn(
                               "w-16 h-16 rounded-[20px] flex flex-col items-center justify-center text-white font-black shadow-inner shrink-0 transition-colors",
                               app.status === "NOSHOW" ? "bg-rose-500" : (isPast ? "bg-emerald-500" : "bg-blue-500")
                             )}>
                                <p className="text-[10px] uppercase tracking-widest opacity-90">{format(appDate, "MMM", {locale: es})}</p>
                                <p className="text-2xl leading-none">{format(appDate, "dd")}</p>
                             </div>
                             <div className="space-y-1.5">
                                <h4 className="text-base font-black text-slate-900">{app.service.name}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                   <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                      <Clock className="w-3 h-3" /> {format(appDate, "HH:mm")}h
                                   </span>
                                   <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                      {app.service.duration} min
                                   </span>
                                   <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                                      ${app.service.price}
                                   </span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                             <div className={cn(
                               "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2",
                               statusStyles
                             )}>
                                {statusIcon}
                                {statusLabel}
                             </div>
                             
                             <div className="flex items-center gap-2">
                                {app.status !== "NOSHOW" && app.status !== "CANCELLED" && (
                                   <button 
                                      onClick={() => setConfirmNoShowId(app.id)}
                                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm group/btn"
                                      title="Marcar como No Asistió"
                                   >
                                      <CalendarOff className="w-4 h-4" />
                                   </button>
                                )}
                                <Link 
                                   href={`/admin/appointments?date=${format(appDate, "yyyy-MM-dd")}&id=${app.id}`} 
                                   className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0 shadow-sm"
                                   title="Ver en Calendario"
                                >
                                   <ExternalLink className="w-4 h-4" />
                                </Link>
                             </div>
                          </div>
                       </div>
                     )
                   })}

                   {client.appointments.length === 0 && (
                     <div className="py-16 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px]">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Este cliente aún no tiene citas</p>
                        <Link href="/admin/appointments" className="mt-4 inline-block text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                           Agendar Cita
                        </Link>
                     </div>
                   )}
                </motion.div>
              ) : (
                <motion.div 
                  key="notes"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 md:p-10 rounded-[40px] bg-white border border-slate-200 shadow-sm flex flex-col gap-6"
                >
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                         <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Notas Internas</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información privada del cliente</p>
                      </div>
                      <button className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-md shadow-slate-900/20 transition-all active:scale-95 w-full sm:w-auto">
                         Guardar Cambios
                      </button>
                   </div>
                   <textarea 
                     className="w-full h-72 bg-slate-50 rounded-[24px] border border-slate-200 p-6 text-sm font-medium text-slate-700 leading-relaxed focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 resize-none"
                     placeholder="Escribe aquí observaciones, preferencias, alergias o detalles relevantes sobre el cliente..."
                     defaultValue={client.notes || ""}
                   />
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-guardado activado
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

        </div>
      </div>

      {/* ⚠️ MODAL CONFIRMACIÓN NO ASISTIÓ */}
      <AnimatePresence>
        {confirmNoShowId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setConfirmNoShowId(null)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" 
               style={{ height: '100vh', width: '100vw' }}
             />
             <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl relative z-10 border border-slate-200 text-center"
             >
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 mx-auto border border-rose-100">
                   <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">¿Confirmar inasistencia?</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                  Esta acción marcará al cliente como <strong>"No asistió"</strong>. Esto quedará registrado permanentemente en su historial.
                </p>
                <div className="flex gap-3">
                   <button 
                     onClick={() => setConfirmNoShowId(null)}
                     className="flex-1 py-4 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={async () => {
                        try {
                           await updateAppointmentStatus(confirmNoShowId, "NOSHOW");
                           setConfirmNoShowId(null);
                           loadClient();
                        } catch (e) {
                           console.error(e);
                        }
                     }}
                     className="flex-1 py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                   >
                     Confirmar
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
