"use client";

import { useEffect, useState } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService
} from "@/app/actions/services";
import {
  Loader2,
  Plus,
  X,
  Trash2,
  Edit3,
  Clock,
  DollarSign,
  LayoutGrid,
  Sparkles,
  Droplets,
  Scissors,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Link2,
  Check,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  tenantId: string;
  _count?: {
    appointments: number;
  };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data as Service[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateService(editingId, formData);
      } else {
        await createService(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "", duration: 30, price: 0 });
      loadServices();
    } catch (e) {
      alert("Error al guardar el servicio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: service.price
    });
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteService(deleteConfirmId);
      loadServices();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleCopyLink = (serviceId: string, tenantId: string) => {
    // Generar enlace directo usando el tenantId (orgId)
    const link = `${window.location.origin}/book/${tenantId}?service=${serviceId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(serviceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Encontrar el servicio con más reservas
  const maxAppointments = services.length > 0
    ? Math.max(...services.map(s => s._count?.appointments || 0))
    : 0;

  // Define icon components array
  const IconList = [Sparkles, Droplets, Scissors, Activity, Layers];

  const colors = [
    { text: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { text: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
    { text: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { text: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* 🚀 Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-2xl p-6 md:px-8 rounded-[32px] border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Catálogo</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Servicios</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Configura la oferta principal de tu negocio.</p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", duration: 30, price: 0 });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 border border-blue-600 font-bold text-sm text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Crear Servicio
        </button>
      </header>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Cargando catálogo...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Service Cards */}
          {services.map((service, index) => {
            const IconComponent = IconList[index % IconList.length];
            const color = colors[index % colors.length];
            const isDestacado = (service._count?.appointments || 0) === maxAppointments && maxAppointments > 0;

            return (
              <motion.div
                whileHover={{ y: -5 }}
                key={service.id}
                className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[32px] group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  {isDestacado ? (
                    <span className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200 shadow-sm">Destacado</span>
                  ) : (
                    <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200">Activo</span>
                  )}
                </div>

                <div>
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border shadow-sm", color.bg, color.text)}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{service.name}</h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
                    {service.description || "Sin descripción detallada. Edita este servicio para agregar más información."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-xs">{service.duration} Minutos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold">$</span>
                      <span className="text-2xl font-black text-slate-900">{service.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-slate-500">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      {service._count?.appointments || 0} Reservas Generadas
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => handleCopyLink(service.id, service.tenantId)}
                      className="flex-1 py-3 px-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      {copiedId === service.id ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                      {copiedId === service.id ? "Copiado" : "Enlace"}
                    </button>
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 py-3 px-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="w-12 h-12 shrink-0 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Placeholder */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", description: "", duration: 30, price: 0 });
              setIsModalOpen(true);
            }}
            className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-[32px] flex flex-col items-center justify-center p-8 group hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer min-h-[320px]"
          >
            <div className="w-16 h-16 rounded-[20px] bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 text-slate-400 transition-all duration-300">
              <Plus className="w-8 h-8" />
            </div>
            <p className="text-lg font-black text-slate-600 group-hover:text-blue-700 transition-colors">Nuevo Servicio</p>
            <p className="text-xs font-medium text-slate-400 mt-2 text-center max-w-[200px]">Añade una nueva oferta a tu catálogo de reservas.</p>
          </motion.div>
        </div>
      )}

      {/* Pagination/Footer Stats */}
      {!loading && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] gap-6 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Servicios</span>
              <span className="font-black text-slate-900 text-xl">{services.length} activos</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duración Promedio</span>
              <span className="font-black text-slate-900 text-xl">
                {services.length > 0
                  ? Math.round(services.reduce((acc, curr) => acc + curr.duration, 0) / services.length)
                  : 0} min
              </span>
            </div>
          </div>
          {services.length > 5 && (
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-colors bg-white shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-slate-600 px-4 text-xs uppercase tracking-widest">
                Página 1 de {Math.ceil(services.length / 5)}
              </span>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-colors bg-white shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Creación */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 p-8 rounded-[40px] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingId ? "Editar Servicio" : "Nuevo Servicio"}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración Comercial</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 hover:text-slate-900 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ej: Consulta General"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duración (min)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        required
                        min={5}
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-11 rounded-2xl text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="mt-2 flex items-start gap-2 px-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium text-slate-400 leading-tight">
                        Se recomienda añadir 5-10 min de cortesía entre citas.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Precio ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-11 rounded-2xl text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Descripción Corta</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Detalles sobre el servicio que verán tus clientes..."
                  />
                </div>

                <button
                  disabled={submitting}
                  className="w-full py-4 mt-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Servicio"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Borrado */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 p-8 rounded-[32px] shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">¿Eliminar Servicio?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8">
                Esta acción no se puede deshacer. Los clientes ya no podrán agendar este servicio en el portal.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
