"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getAdminClients } from "@/app/actions/clients";
import { 
  Loader2, 
  Search, 
  Download, 
  TrendingUp, 
  CalendarCheck, 
  Wallet, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Mail, 
  Phone,
  User,
  Activity,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string | null;
  nextVisit: string | null;
  totalVisits: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "vip" | "inactive">("all");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getAdminClients();
      setClients(data as unknown as Client[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    let result = clients;
    
    if (filterType === "vip") {
      result = result.filter(c => c.totalVisits > 3);
    } else if (filterType === "inactive") {
      result = result.filter(c => c.totalVisits === 0);
    }

    if (search) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search) || 
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    return result;
  }, [clients, search, filterType]);

  const totalBookings = clients.reduce((acc, curr) => acc + curr.totalVisits, 0);
  const activeClientsCount = clients.filter(c => c.totalVisits > 0).length;

  // Pagination Logic
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* 🚀 Page Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-2xl p-6 md:px-8 rounded-[32px] border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
             <Users className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">CRM de Pacientes</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Directorio</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Gestiona la información de tus {clients.length} clientes registrados.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
           <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                 className="w-full bg-white/80 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-400" 
                 placeholder="Buscar cliente..." 
                 type="text"
                 value={search}
                 onChange={(e) => {
                   setSearch(e.target.value);
                   setCurrentPage(1);
                 }}
              />
           </div>
        </div>
      </header>

      {loading ? (
         <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Sincronizando Base de Datos...</span>
         </div>
      ) : (
        <>
          {/* 📊 Bento Grid of Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] space-y-2 shadow-sm flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-100" />
              <div className="flex items-start justify-between relative z-10">
                <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl border border-blue-100">
                   <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider bg-blue-100 px-3 py-1.5 rounded-full shadow-sm">Base de datos</span>
              </div>
              <div className="mt-6 relative z-10">
                 <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Clientes Registrados</p>
                 <p className="text-4xl font-black text-slate-900">{clients.length}</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] space-y-2 shadow-sm flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-100" />
              <div className="flex items-start justify-between relative z-10">
                <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl border border-emerald-100">
                   <CalendarCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6 relative z-10">
                 <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Reservas Históricas</p>
                 <p className="text-4xl font-black text-slate-900">{totalBookings}</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] space-y-2 shadow-sm flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-100" />
              <div className="flex items-start justify-between relative z-10">
                <div className="p-3 bg-indigo-100/50 text-indigo-600 rounded-2xl border border-indigo-100">
                   <Activity className="w-6 h-6" />
                </div>
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-wider bg-indigo-100 px-3 py-1.5 rounded-full shadow-sm">Conversión</span>
              </div>
              <div className="mt-6 relative z-10">
                 <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">Ratio de Actividad</p>
                 <p className="text-4xl font-black text-slate-900">
                    {clients.length > 0 ? Math.round((activeClientsCount / clients.length) * 100) : 0}%
                 </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-[32px] space-y-2 shadow-xl shadow-slate-900/20 flex flex-col justify-between group relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
              <div className="flex items-start justify-between relative z-10">
                <div className="p-3 bg-white/10 text-amber-400 rounded-2xl border border-white/10 backdrop-blur-md">
                   <Star className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-6 relative z-10">
                 <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">Clientes Frecuentes (VIP)</p>
                 <p className="text-4xl font-black text-white">{clients.filter(c => c.totalVisits > 3).length}</p>
              </div>
            </motion.div>
          </div>

          {/* Filtros Rapidos */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setFilterType("all"); setCurrentPage(1); }}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border", filterType === "all" ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900")}
            >
              Todos ({clients.length})
            </button>
            <button 
              onClick={() => { setFilterType("vip"); setCurrentPage(1); }}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border", filterType === "vip" ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-amber-50 hover:text-amber-700")}
            >
              VIP
            </button>
            <button 
              onClick={() => { setFilterType("inactive"); setCurrentPage(1); }}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border", filterType === "inactive" ? "bg-slate-200 text-slate-700 border-slate-300 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700")}
            >
              Inactivos
            </button>
          </div>

          {/* 📋 Client Directory Table Container */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">Cliente</th>
                    <th className="p-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">Contacto</th>
                    <th className="p-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                    <th className="p-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">Reservas</th>
                    <th className="p-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">Última Visita</th>
                    <th className="p-6 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                         <div className="flex flex-col items-center justify-center text-slate-400">
                            <User className="w-12 h-12 mb-4 text-slate-300" />
                            <p className="font-medium text-sm">No se encontraron clientes.</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedClients.map((client, index) => {
                      const isActive = client.totalVisits > 0;
                      const isVip = client.totalVisits > 3;
                      
                      // Lógica de iniciales profesional
                      const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      
                      // Rotación de colores para avatares
                      const avatarColors = [
                        "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
                        "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600",
                        "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
                        "bg-violet-50 text-violet-600 group-hover:bg-violet-600",
                        "bg-amber-50 text-amber-600 group-hover:bg-amber-600"
                      ];
                      const avatarColor = avatarColors[index % avatarColors.length];

                      return (
                        <tr key={client.id} className="hover:bg-slate-50/80 transition-all group border-b border-slate-50 last:border-0">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm uppercase transition-all duration-300 group-hover:text-white group-hover:scale-110 shadow-sm",
                                avatarColor
                              )}>
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{client.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                   {isVip && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                     {isVip ? 'Cliente VIP' : 'Cliente Estándar'}
                                   </p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-slate-600">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs font-bold">{client.email !== "Sin registro" ? client.email : "-"}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs font-bold text-slate-500">{client.phone}</span>
                               </div>
                            </div>
                          </td>
                          <td className="p-6">
                            {isActive ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[10px] font-black uppercase tracking-wider">Activo</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 w-fit">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                 <span className="text-[10px] font-black uppercase tracking-wider">Inactivo</span>
                              </div>
                            )}
                          </td>
                          <td className="p-6">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-700 text-xs">
                                   {client.totalVisits}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Visitas</span>
                             </div>
                          </td>
                          <td className="p-6">
                             {client.lastVisit ? (
                               <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-700">{format(new Date(client.lastVisit), "d MMM yyyy", { locale: es })}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Hace {format(new Date(client.lastVisit), "d", { locale: es })} días</span>
                               </div>
                             ) : (
                               <span className="text-xs font-bold text-slate-300">Nunca</span>
                             )}
                          </td>
                          <td className="p-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <a 
                                  href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 transition-all hover:bg-emerald-600 hover:text-white"
                                  title="Enviar WhatsApp"
                                >
                                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                </a>
                                <Link 
                                   href={`/admin/clients/${client.id}`} 
                                   className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 transition-all hover:bg-blue-600 hover:text-white shadow-sm"
                                   title="Ver Perfil Detallado"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                             </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-4 md:p-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Mostrando <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span> páginas
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-500 disabled:opacity-50 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black shadow-md flex items-center justify-center">
                      {currentPage}
                    </span>
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-500 disabled:opacity-50 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
