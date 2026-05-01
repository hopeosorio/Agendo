"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import {
  getPublicServices,
  createPublicAppointment,
  getAvailableSlotsAction,
  getPublicTenantInfo,
  getProfessionalsForService
} from "@/app/actions/public";
import {
  Loader2,
  CheckCircle2,
  MessageCircle,
  MapPin,
  Star,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  LayoutGrid,
  ExternalLink,
  User,
  Users,
  Briefcase,
  Clock,
  ChevronLeft,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  Info,
  Map,
  Compass,
  RefreshCcw,
  AlertCircle,
  AlertTriangle,
  AlertOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, parse, addDays, isSameDay, startOfToday, getDay, startOfMonth, getDaysInMonth, isBefore, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function BookingPage() {
  const { tenant_id } = useParams();

  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);

  const [viewDate, setViewDate] = useState<Date>(startOfToday());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const slotsRef = useRef<HTMLDivElement>(null);
  const [showBottomArrow, setShowBottomArrow] = useState(false);
  const [isLoadingPros, setIsLoadingPros] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const servicesScrollRef = useRef<HTMLDivElement>(null);
  const [showTopServicesArrow, setShowTopServicesArrow] = useState(false);
  const [showBottomServicesArrow, setShowBottomServicesArrow] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const [filter, setFilter] = useState<'all' | 'available'>('all');

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [info, srvs] = await Promise.all([
          getPublicTenantInfo(tenant_id as string),
          getPublicServices(tenant_id as string)
        ]);
        setTenantInfo(info);
        setServices(srvs);
      } catch (e) {
        console.error(e);
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [tenant_id]);

  // 🛡️ Helper para validar un día específico
  const getDayStatus = (date: Date) => {
    if (!tenantInfo) return { isActive: false, reason: "" };

    const jsDay = getDay(date);
    const dbDay = (jsDay + 6) % 7;
    const today = startOfToday();

    const scheduleForDay = tenantInfo?.schedules?.find((s: any) => s.dayOfWeek === dbDay);
    const isScheduleOpen = scheduleForDay?.isOpen ?? true;
    const isDateBlocked = tenantInfo?.blockedDates?.some((b: any) => isSameDay(new Date(b.date), date));

    const policies = tenantInfo?.config?.bookingPolicies || { minLeadTime: 0, maxLeadTime: 30 };
    const minDays = Math.ceil(policies.minLeadTime / 24);
    const minDate = addDays(today, minDays);
    const maxDate = addDays(today, policies.maxLeadTime);

    // Razones específicas
    if (!isScheduleOpen) return { isActive: false, reason: "Cerrado este día" };
    if (isDateBlocked) return { isActive: false, reason: "Día festivo o bloqueado" };
    if (isBefore(date, today)) return { isActive: false, reason: "Fecha pasada" };
    if (policies.minLeadTime > 0 && isBefore(date, minDate)) return { isActive: false, reason: "Requiere más antelación" };
    if (isBefore(maxDate, date)) return { isActive: false, reason: "Agenda aún no abierta" };

    return { isActive: true, reason: "" };
  };

  // 🛡️ Lógica para encontrar la primera fecha disponible al entrar al paso 3
  useEffect(() => {
    if (step === 3 && !selectedDate && tenantInfo) {
      const today = startOfToday();
      for (let i = 0; i < 60; i++) {
        const checkDate = addDays(today, i);
        const { isActive } = getDayStatus(checkDate);
        if (isActive) {
          setSelectedDate(checkDate);
          setViewDate(checkDate);
          break;
        }
      }
    }
  }, [step, tenantInfo, selectedDate]);

  // Load Leaflet for Public Map
  useEffect(() => {
    if (!initialLoading && tenantInfo?.config?.coordinates && step === 1) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        if (typeof window === "undefined" || !(window as any).L || !mapContainerRef.current) return;
        const L = (window as any).L;
        const coords = tenantInfo.config.coordinates;

        if (mapRef.current) mapRef.current.remove();

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          dragging: true,
          touchZoom: true
        }).setView([coords.lat, coords.lng], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#4f46e5; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 15px rgba(79,70,229,0.5);'></div>",
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([coords.lat, coords.lng], { icon }).addTo(map);
        mapRef.current = map;
      };
      document.head.appendChild(script);
    }
  }, [initialLoading, tenantInfo, step]);

  // Load Professionals when service changes
  useEffect(() => {
    if (selectedServiceId && tenantInfo?.id) {
      loadProfessionals();
    }
  }, [selectedServiceId, tenantInfo]);

  const loadProfessionals = async () => {
    setIsLoadingPros(true);
    try {
      const pros = await getProfessionalsForService(tenantInfo.id, selectedServiceId!);
      setProfessionals(pros);
      if (pros.length === 1) {
        setSelectedProfessionalId(pros[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPros(false);
    }
  };

  // Load Availability
  useEffect(() => {
    if (selectedServiceId && selectedDate) {
      const { isActive } = getDayStatus(selectedDate);
      if (isActive) {
        loadAvailability();
      } else {
        setAvailableTimes([]);
        setSelectedTime(null);
      }
    }
  }, [selectedServiceId, selectedDate]);

  const loadAvailability = async () => {
    if (!selectedServiceId || !selectedDate) return;
    setIsLoadingTimes(true);
    setAvailableTimes([]);
    setSelectedTime(null);

    try {
      const slots = await getAvailableSlotsAction(
        tenant_id as string,
        selectedServiceId,
        selectedDate,
        selectedProfessionalId
      );

      const policies = tenantInfo?.config?.bookingPolicies || { minLeadTime: 0 };
      const now = new Date();
      const isToday = isSameDay(selectedDate, now);

      let finalSlots = slots.filter(s => s.available).map(s => s.time);

      if (isToday && policies.minLeadTime > 0) {
        finalSlots = finalSlots.filter(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
          const minAllowedDate = new Date(now.getTime() + (policies.minLeadTime * 60 * 60 * 1000));
          return slotDate > minAllowedDate;
        });
      }

      setAvailableTimes(finalSlots);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  const handleSlotsScroll = () => {
    if (slotsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = slotsRef.current;
      setShowBottomArrow(scrollTop + clientHeight < scrollHeight - 5);
    }
  };

  const handleServicesScroll = () => {
    if (servicesScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = servicesScrollRef.current;
      setShowTopServicesArrow(scrollTop > 20);
      setShowBottomServicesArrow(scrollTop + clientHeight < scrollHeight - 20);
    }
  };

  useEffect(() => {
    if (services.length > 0 && step === 1) {
      setTimeout(handleServicesScroll, 500);
    }
  }, [services, step]);

  useEffect(() => {
    if (availableTimes.length > 0) {
      setTimeout(handleSlotsScroll, 100);
    }
  }, [availableTimes]);

  // 🛡️ Prevenir el rebote del Navbar (Viewport bounce) solo en esta página
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  const handleFinalSubmit = async (formData: any) => {
    if (!selectedTime || !selectedDate) return;
    setIsSubmitting(true);

    const parsedTime = parse(selectedTime, "HH:mm", selectedDate);

    try {
      await createPublicAppointment({
        tenantSlug: tenant_id as string,
        serviceId: selectedServiceId!,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        startTime: parsedTime,
        professionalId: selectedProfessionalId || undefined
      });
      setStep(5);
    } catch (error) {
      alert("Error al reservar la cita");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openInMaps = () => {
    if (!tenantInfo?.config?.coordinates) return;
    const { lat, lng } = tenantInfo.config.coordinates;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId);
  const config = tenantInfo?.config || {};

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full"
        />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Cargando Experiencia...</span>
      </div>
    );
  }

  const STEPS = [
    { id: 1, label: "Servicio" },
    { id: 2, label: "Especialista" },
    { id: 3, label: "Horario" },
    { id: 4, label: "Confirmar" }
  ];

  const currentDayStatus = selectedDate ? getDayStatus(selectedDate) : { isActive: false, reason: "" };

  return (
    <main className="h-screen bg-[#fafbff] font-sans text-slate-900 relative flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-emerald-600/5 rounded-full blur-[180px]"></div>
      </div>

      {step < 5 && (
        <header className="bg-white/60 backdrop-blur-2xl fixed top-0 left-0 right-0 z-[100] border-b border-white/50 shadow-sm px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-[0_8px_16px_-4px_rgba(79,70,229,0.1)] border border-slate-100 overflow-hidden">
                {tenantInfo?.logoUrl ? (
                  <img src={tenantInfo.logoUrl} alt={tenantInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-7 h-7" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">{tenantInfo?.name || "Agendo"}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{config.address || "Ver Ubicación"}</span>
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
              {STEPS.map((s) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;
                return (
                  <div key={s.id} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500", isActive ? "bg-white text-indigo-600 shadow-sm border border-white" : "text-slate-400")}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-500", isActive ? "bg-indigo-600 border-indigo-600 text-white" : isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-slate-400")}>
                      {isCompleted ? "✓" : s.id}
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest hidden sm:inline", isActive ? "text-slate-900" : "text-slate-400")}>{s.label}</span>
                  </div>
                );
              })}
            </nav>

            <button onClick={openInMaps} className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Compass className="w-3.5 h-3.5 text-indigo-600" /> Cómo Llegar
            </button>
          </div>
        </header>
      )}

      <div 
        className="flex-1 overflow-y-auto relative z-10 scroll-smooth pt-[89px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-200 transition-colors"
      >
        <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-90px)] items-stretch">
          <div className={cn(
            "flex flex-col gap-12 transition-all duration-700 px-6 py-12",
            (step === 5 || step === 1) ? "lg:col-span-12 max-w-7xl mx-auto w-full" : "lg:col-span-8 max-w-5xl ml-auto w-full"
          )}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.section key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8">
                  <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Selecciona un Servicio</h2>
                      <p className="text-slate-500 font-medium text-sm">Elige la experiencia que deseas disfrutar hoy.</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm"><LayoutGrid className="w-6 h-6" /></div>
                  </div>
                  {services.length === 0 ? (
                    <div className="py-24 bg-white/40 border-2 border-dashed border-slate-200 rounded-[56px] flex flex-col items-center gap-6 text-slate-400 font-bold"><Sparkles className="w-12 h-12 opacity-10" />No hay servicios publicados todavía.</div>
                  ) : (
                    <div className="relative group/scroll">
                      {/* 🔼 Indicador: Ver Anteriores */}
                      <AnimatePresence>
                        {showTopServicesArrow && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none"
                          >
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-white/80 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-indigo-50">Ver Anteriores</span>
                            <ChevronDown className="w-4 h-4 text-indigo-600 rotate-180 animate-bounce" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div 
                        ref={servicesScrollRef}
                        onScroll={handleServicesScroll}
                        className="max-h-[70vh] overflow-y-auto pr-4 scroll-smooth relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        style={{
                          maskImage: 'linear-gradient(to bottom, transparent, black 80px, black calc(100% - 100px), transparent)',
                          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 80px, black calc(100% - 100px), transparent)'
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 pt-16">
                          {services.map((service, idx) => (
                            <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} onClick={() => { setSelectedServiceId(service.id); setStep(2); }} className={cn("group bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[48px] cursor-pointer transition-all hover:bg-white hover:shadow-xl relative overflow-hidden", selectedServiceId === service.id && "border-indigo-600 ring-2 ring-indigo-600/10")}>
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors" />
                              <div className="flex justify-between items-start mb-10 relative z-10"><div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500"><Sparkles className="w-8 h-8" /></div><div className="text-right"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inversión</span><span className="text-3xl font-black text-slate-900 tracking-tighter">${service.price}</span></div></div>
                              <div className="relative z-10"><h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{service.name}</h3><p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 h-10 line-clamp-2">{service.description || "Un servicio premium diseñado para cumplir con los más altos estándares."}</p><div className="flex items-center justify-between pt-6 border-t border-slate-100"><div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest"><Clock className="w-4 h-4 text-indigo-600" />{service.duration} Minutos</div><div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:translate-x-2 transition-transform shadow-lg"><ChevronRight className="w-5 h-5" /></div></div></div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* 🔽 Indicador: Ver Más */}
                      <AnimatePresence>
                        {showBottomServicesArrow && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none"
                          >
                            <ChevronDown className="w-4 h-4 text-indigo-600 animate-bounce" />
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-white/80 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-indigo-50">Ver Más Servicios</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.section>
              )}

              {step === 2 && (
                <motion.section key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2"><div className="space-y-1"><button onClick={() => setStep(1)} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-5 group"><div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></div>Volver a Servicios</button><h2 className="text-4xl font-black text-slate-900 tracking-tight">Elige a tu Especialista</h2><p className="text-slate-500 font-medium text-sm">Contamos con los mejores profesionales para tu atención.</p></div><div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 w-fit"><button onClick={() => setFilter('all')} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600")}>Todos</button><button onClick={() => setFilter('available')} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'available' ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600")}>Disponibles</button></div></div>
                  {isLoadingPros ? (<div className="py-32 flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-indigo-600" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buscando especialistas...</span></div>) : (
                    <div className="flex flex-col gap-5">{professionals.filter(pro => filter === 'all' || true).map((pro, idx) => (
                      <motion.div key={pro.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => { setSelectedProfessionalId(pro.id); setStep(3); }} className={cn("group bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[32px] cursor-pointer transition-all hover:bg-white hover:shadow-xl relative flex flex-col md:flex-row items-center gap-8 overflow-hidden", selectedProfessionalId === pro.id && "border-indigo-600 ring-2 ring-indigo-600/10 bg-white")}>
                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" /><div className="relative shrink-0"><div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-indigo-50 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform">{pro.photoUrl ? (<img src={pro.photoUrl} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-3xl bg-gradient-to-br from-indigo-50 to-white">{pro.name[0]}</div>)}</div><div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-lg z-20 animate-pulse" /></div><div className="relative z-10 flex-grow text-center md:text-left space-y-3"><div className="space-y-1"><h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{pro.name}</h3><div className="flex items-center justify-center md:justify-start gap-2"><span className="px-3 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-[0.2em] rounded-md border border-indigo-100/50">{pro.role || "Especialista"}</span></div></div><p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 max-w-2xl">{pro.bio || "Profesional comprometido con la excelencia y el bienestar de cada paciente."}</p><div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">{pro.services?.slice(0, 3).map((s: any) => (<span key={s.id} className="px-3 py-1 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:text-indigo-500 transition-colors">{s.name}</span>))}</div></div><div className="relative z-10 w-full md:w-auto shrink-0"><button className="w-full md:w-48 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg group-hover:bg-indigo-600 group-hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-3">Elegir<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" /></button></div>
                      </motion.div>
                    ))}</div>
                  )}
                </motion.section>
              )}

              {step === 3 && (
                <motion.section key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2"><div className="space-y-1"><button onClick={() => setStep(2)} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-5 group"><div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></div>Volver</button><h2 className="text-4xl font-black text-slate-900 tracking-tight">Agenda tu Cita</h2></div>{selectedProfessional && (<div className="bg-white/60 backdrop-blur-md p-3 pr-8 rounded-3xl border border-white shadow-sm flex items-center gap-4"><div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm">{selectedProfessional.photoUrl ? (<img src={selectedProfessional.photoUrl} className="w-full h-full object-cover" />) : (<div className="w-full h-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">{selectedProfessional.name[0]}</div>)}</div><p className="text-sm font-black text-slate-900 leading-none">{selectedProfessional.name}</p></div>)}</div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm flex flex-col gap-8 h-[510px]">
                      <div className="flex items-center justify-between px-2"><h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{format(viewDate, "MMMM yyyy", { locale: es })}</h3><div className="flex gap-2"><button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-slate-400" /></button><button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-slate-400" /></button></div></div>
                      <div className="grid grid-cols-7 gap-1">{["D", "L", "M", "M", "J", "V", "S"].map((d, idx) => (<div key={`${d}-${idx}`} className="text-center text-[10px] font-black text-slate-300 py-4 uppercase tracking-widest">{d}</div>))}
                        {(() => {
                          const firstDayOfMonth = startOfMonth(viewDate);
                          const startOffset = getDay(firstDayOfMonth);
                          const daysInMonth = getDaysInMonth(viewDate);
                          const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
                          return Array.from({ length: totalCells }).map((_, i) => {
                            const dayNumber = i - startOffset + 1;
                            const isActualDay = dayNumber > 0 && dayNumber <= daysInMonth;
                            if (!isActualDay) return <div key={i} className="aspect-square" />;
                            const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNumber);
                            const isActive = getDayStatus(currentDayDate).isActive;
                            const isSelected = selectedDate ? isSameDay(currentDayDate, selectedDate) : false;

                            return (
                              <div key={i} className="aspect-square flex items-center justify-center relative">
                                <button
                                  onClick={() => {
                                    setSelectedDate(currentDayDate);
                                  }}
                                  className={cn(
                                    "w-12 h-12 rounded-2xl font-black text-sm transition-all relative overflow-hidden",
                                    // 1. Seleccionado y Activo (Azul Traslúcido Moderno)
                                    isSelected && isActive && "bg-indigo-50 border-2 border-indigo-200 text-indigo-600 shadow-sm scale-110 z-10",
                                    // 2. Seleccionado pero INACTIVO (Aviso suave)
                                    isSelected && !isActive && "bg-rose-50 border-2 border-rose-200 text-rose-500 scale-110 z-10",
                                    // 3. No seleccionado y Activo
                                    !isSelected && isActive && "text-slate-400 hover:bg-slate-50",
                                    // 4. No seleccionado e Inactivo
                                    !isSelected && !isActive && "bg-slate-50/50 text-slate-300"
                                  )}
                                >
                                  {dayNumber}
                                  {!isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                      <div className="w-[140%] h-[1.5px] bg-current rotate-[45deg]" />
                                    </div>
                                  )}
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm flex flex-col h-[510px] relative overflow-hidden">
                      <div className="flex items-center gap-3 px-2 mb-8"><Clock className="w-5 h-5 text-indigo-600" /><h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{selectedDate ? format(selectedDate, "dd MMM", { locale: es }) : "Selecciona un día"}</h4></div>
                      <div className="relative group flex-1 min-h-0">
                        <div ref={slotsRef} onScroll={handleSlotsScroll} className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          {!selectedDate ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20"><Calendar className="w-8 h-8 text-slate-100" /><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Elige una fecha para ver horarios</p></div>
                          ) : !currentDayStatus.isActive ? (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-20 px-4">
                              <AlertTriangle className="w-12 h-12 text-rose-500 mb-2" strokeWidth={2.5} />
                              <div className="space-y-2">
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{currentDayStatus.reason}</p>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[200px] mx-auto">Por favor selecciona uno de los días activos en el calendario.</p>
                              </div>
                            </div>
                          ) : isLoadingTimes ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calculando disponibilidad...</span></div>
                          ) : availableTimes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20"><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Sin horarios disponibles</p></div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 pb-12">{availableTimes.map((time) => (<button key={time} onClick={() => setSelectedTime(time)} className={cn("py-4 rounded-2xl font-black text-center transition-all text-xs border-2", selectedTime === time ? "bg-indigo-600 border-indigo-600 text-white shadow-xl" : "bg-slate-50 border-transparent text-slate-600 hover:border-indigo-100")}>{time}</button>))}</div>
                          )}
                        </div>
                        <AnimatePresence>{showBottomArrow && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />)}</AnimatePresence>
                      </div>
                      <button disabled={!selectedTime} onClick={() => setStep(4)} className="w-full py-6 bg-slate-900 rounded-[32px] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-4 group">Confirmar <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></button>
                    </div>
                  </div>
                </motion.section>
              )}

              {step === 4 && (
                <motion.section key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex flex-col gap-10"><div className="space-y-1 px-2"><button onClick={() => setStep(3)} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-4 hover:-translate-x-1 transition-transform"><ChevronLeft className="w-4 h-4" /> Volver a Horarios</button><h2 className="text-3xl font-black text-slate-900 tracking-tight">Finalizar Reserva</h2><p className="text-slate-500 font-medium text-sm">Completa tus datos para agendar.</p></div><div className="bg-white/60 backdrop-blur-2xl border border-white p-12 rounded-[56px] shadow-sm"><BookingForm onSubmit={handleFinalSubmit} isLoading={isSubmitting} /></div></motion.section>
              )}

              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full max-w-2xl mx-auto w-full flex flex-col items-center py-12 space-y-10"><div className="flex flex-col items-center text-center space-y-6"><div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20 animate-bounce"><CheckCircle2 className="w-12 h-12" strokeWidth={2.5} /></div><div className="space-y-2"><h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{(tenantInfo.config as any)?.successMessage ? "¡Listo!" : "¡Cita Agendada!"}</h2><p className="text-slate-500 font-medium text-lg mb-10 max-w-md mx-auto">{(tenantInfo.config as any)?.successMessage || "Tu espacio ha sido reservado con éxito. Te hemos enviado un correo con todos los detalles."}</p></div></div><div className="w-full bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16" /><div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-xl"><MapPin className="w-8 h-8 text-indigo-400" /></div><div className="flex-1 space-y-2 text-center md:text-left"><p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">¿Dónde nos vemos?</p><h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{config.address || "Dirección de la clínica"}</h4></div><button onClick={openInMaps} className="px-6 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm">Cómo Llegar</button></div><div className="pt-4"><button onClick={() => window.location.reload()} className="group flex items-center gap-4 px-10 py-5 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl border border-slate-100 hover:border-indigo-200 transition-all active:scale-95"><RefreshCcw className="w-4 h-4 text-indigo-500 group-hover:rotate-180 transition-transform duration-700" />Hacer otra reserva</button></div></motion.div>
              )}
            </AnimatePresence>
          </div>

          {step > 1 && step < 5 && (
            <div className="lg:col-span-4 h-full">
              <motion.aside 
                layout 
                className="bg-slate-900 text-white lg:fixed lg:top-[89px] lg:right-0 lg:h-[calc(100vh-89px)] lg:w-1/3 p-12 lg:pt-16 lg:pb-12 shadow-2xl relative overflow-hidden flex flex-col justify-between z-[40]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="relative z-10 flex flex-col gap-12">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Tu Reserva</span>
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>

                  <div className="space-y-10">
                    <div className="flex gap-5">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <LayoutGrid className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Servicio</p>
                        <p className="text-xl font-black tracking-tight leading-tight">{selectedService?.name || "Sin seleccionar"}</p>
                      </div>
                    </div>

                    <div className={cn("flex gap-5 transition-all duration-500", !selectedProfessional && "opacity-20 translate-x-4")}>
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <User className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Especialista</p>
                        <p className="text-xl font-black tracking-tight leading-tight">{selectedProfessional?.name || "Pendiente"}</p>
                      </div>
                    </div>

                    <div className={cn("flex gap-5 transition-all duration-500", !selectedTime && "opacity-20 translate-x-4")}>
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <CalendarDays className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Cita</p>
                        <p className="text-xl font-black tracking-tight leading-tight">
                          {selectedDate && selectedTime 
                            ? `${format(selectedDate, "dd MMM", { locale: es })} • ${selectedTime}` 
                            : "Selecciona horario"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="w-full h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Estimado</p>
                      <p className="text-5xl font-black tracking-tighter text-indigo-400">
                        ${selectedService?.price || "0"}
                      </p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-[24px] border border-white/10">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-center opacity-40">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Atención Profesional Garantizada</p>
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </div> {/* Closes Grid */}

        {step === 1 && (
          <section className="max-w-7xl mx-auto px-6 mt-24 mb-[30px]">
            <div className="bg-white border border-slate-100 rounded-[56px] p-12 shadow-sm flex flex-col md:flex-row items-center gap-12 group/maps overflow-hidden relative"><div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover/maps:opacity-100 transition-opacity duration-1000" /><div className="md:w-1/3 flex flex-col gap-8 relative z-10"><div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[24px] flex items-center justify-center border border-rose-100 shadow-sm"><MapPin className="w-8 h-8" /></div><div className="space-y-4"><h3 className="text-4xl font-black text-slate-900 tracking-tight">Visítanos</h3><p className="text-lg font-medium text-slate-500 leading-relaxed">Estamos ubicados en una zona estratégica para tu comodidad. Ven y vive la experiencia Agendo.</p><div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100"><p className="text-sm font-black text-slate-900 mb-1">Dirección:</p><p className="text-sm font-bold text-slate-500 leading-relaxed">{config.address || "Consulta nuestra ubicación en el mapa."}</p></div></div><button onClick={openInMaps} className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"><Compass className="w-4 h-4" />Abrir en Google Maps</button></div><div className="md:w-2/3 h-[450px] w-full rounded-[48px] bg-slate-100 overflow-hidden relative shadow-inner border border-slate-100 cursor-pointer"><div ref={mapContainerRef} className="w-full h-full grayscale group-hover/maps:grayscale-0 transition-all duration-1000" /><div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/20 to-transparent" /></div></div>
          </section>
        )}
        </div> {/* Closes w-full */}
      </div> {/* Closes flex-1 overflow-y-auto */}
    </main>
  );
}
