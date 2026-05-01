"use client";

import { useState, useEffect, useRef } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useNavigationGuard } from "@/context/NavigationContext";
import {
  Building2,
  Palette,
  Bell,
  MapPin,
  ShieldAlert,
  Mail,
  Calendar,
  Copy,
  Check,
  Upload,
  ChevronRight,
  ExternalLink,
  Save,
  Undo2,
  Sparkles,
  Camera,
  Loader2,
  Plus,
  ShieldCheck,
  History,
  Timer,
  LayoutGrid,
  User,
  Settings as SettingsIcon,
  Shield,
  MessageCircle,
  Globe,
  Search,
  Users,
  PartyPopper,
  Quote,
  Share2,
  Navigation,
  Trash2,
  X,
  Strikethrough,
  UserPlus,
  Stethoscope,
  Info,
  Pencil,
  AlertTriangle,
  Link as LinkIcon,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getSettings, updateSettings } from "@/app/actions/settings";
import { getTeam, inviteMember, syncProfessionalProfile, deleteProfessional } from "@/app/actions/team";
import { getServices } from "@/app/actions/services";

type TabType = "negocio" | "agenda" | "alertas" | "equipo" | "seguridad";

export default function SettingsPage() {
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState<TabType>("negocio");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);

  // Global Navigation Guard
  const { setHasUnsavedChanges, resetNavigation } = useNavigationGuard();

  // Sincronizar con el guardia global
  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges, setHasUnsavedChanges]);

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "Salud y Bienestar",
    address: "",
    notifications: {
      email: true,
      calendar: true
    },
    bookingPolicies: {
      cancellationMargin: 24,
      minLeadTime: 2,
      maxLeadTime: 30,
      slotInterval: 30
    },
    social: {
      instagram: "",
      facebook: "",
      whatsapp: ""
    },
    seo: {
      title: "",
      description: ""
    },
    successMessage: "",
    coordinates: {
      lat: 19.4326,
      lng: -99.1332
    }
  });

  const [initialData, setInitialData] = useState<any>(null);

  // Team related state
  const [team, setTeam] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [editingMember, setEditingMember] = useState<any>(null);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleTabChange = (tabId: TabType) => {
    if (hasChanges) {
      setPendingTab(tabId);
      setShowExitModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [settings, teamData, servicesData] = await Promise.all([
        getSettings(),
        getTeam(),
        getServices()
      ]);

      if (settings) {
        const config = (settings.config as any) || {};
        const state = {
          name: settings.name || "",
          description: config.description || "",
          industry: config.industry || "Salud y Bienestar",
          address: config.address || "",
          notifications: config.notifications || { email: true, calendar: true },
          bookingPolicies: config.bookingPolicies || { cancellationMargin: 24, minLeadTime: 2, maxLeadTime: 30, slotInterval: 30 },
          social: config.social || { instagram: "", facebook: "", whatsapp: "" },
          seo: config.seo || { title: "", description: "" },
          successMessage: config.successMessage || "",
          coordinates: config.coordinates || { lat: 19.4326, lng: -99.1332 }
        };
        setFormData(state);
        setInitialData(JSON.stringify(state));
        setHasChanges(false);
      }
      setTeam(teamData);
      setServices(servicesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (initialData) {
      setFormData(JSON.parse(initialData));
      setHasChanges(false);
      resetNavigation();
    }
  };

  // Leaflet Setup
  useEffect(() => {
    if (activeTab === "negocio" && !loading) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [activeTab, loading]);

  const initMap = () => {
    if (typeof window === "undefined" || !(window as any).L || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([formData.coordinates.lat, formData.coordinates.lng], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    const marker = L.marker([formData.coordinates.lat, formData.coordinates.lng], { draggable: true }).addTo(map);
    marker.on('dragend', async (e: any) => {
      const pos = e.target.getLatLng();
      handleInputChange("coordinates", { lat: pos.lat, lng: pos.lng });

      // Actualizar dirección al arrastrar
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          handleInputChange("address", data.display_name);
        }
      } catch (error) {
        console.warn("No se pudo actualizar la dirección al arrastrar:", error);
      }
    });
    mapRef.current = map;
    markerRef.current = marker;
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      handleInputChange("coordinates", { lat: latitude, lng: longitude });

      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 15);
        markerRef.current.setLatLng([latitude, longitude]);
      }

      // 🗺️ Geocodificación Inversa (Coordenadas -> Dirección)
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data && data.display_name) {
          handleInputChange("address", data.display_name);
        }
      } catch (error) {
        console.warn("No se pudo obtener la dirección automática:", error);
      }
    });
  };

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setHasChanges(JSON.stringify(newData) !== initialData);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const newData = { ...formData, [parent]: { ...(formData[parent as keyof typeof formData] as any), [field]: value } };
    setFormData(newData);
    setHasChanges(JSON.stringify(newData) !== initialData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      setInitialData(JSON.stringify(formData));
      setHasChanges(false);
      resetNavigation();
      return true;
    } catch (e) {
      console.error(e);
      alert("Error al guardar los cambios. Por favor intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Team Actions
  const handleInvite = async () => {
    if (!inviteEmail) return;
    setSaving(true);
    try {
      await inviteMember(inviteEmail);
      setInviteEmail("");
      alert("¡Invitación enviada! El miembro recibirá un correo para unirse.");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error al enviar la invitación");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncProfile = async () => {
    if (!editingMember) return;
    setSaving(true);
    try {
      await syncProfessionalProfile({
        clerkId: editingMember.clerkId,
        name: editingMember.name,
        role: editingMember.profRole || "",
        bio: editingMember.bio || "",
        serviceIds: editingMember.serviceIds || []
      });
      setEditingMember(null);
      const updatedTeam = await getTeam();
      setTeam(updatedTeam);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const startEditing = (member: any) => {
    setEditingMember({
      ...member,
      profRole: member.professionalData?.role || "",
      bio: member.professionalData?.bio || "",
      serviceIds: member.professionalData?.services?.map((s: any) => s.id) || []
    });
  };

  const toggleServiceForEditing = (id: string) => {
    const current = editingMember.serviceIds || [];
    if (current.includes(id)) {
      setEditingMember({ ...editingMember, serviceIds: current.filter((s: string) => s !== id) });
    } else {
      setEditingMember({ ...editingMember, serviceIds: [...current, id] });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Sincronizando Ajustes...</span>
      </div>
    );
  }

  const tabs = [
    { id: "negocio", label: "Mi Negocio", icon: Building2 },
    { id: "agenda", label: "Agenda y UX", icon: SettingsIcon },
    { id: "alertas", label: "Alertas", icon: Bell },
    { id: "equipo", label: "Equipo", icon: Users },
    { id: "seguridad", label: "Seguridad", icon: Shield },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-2xl p-8 rounded-[40px] border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Sparkles className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Configuración Global</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ajustes</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm max-w-lg">Gestiona la identidad y reglas de tu negocio.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                onClick={resetForm}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
              >
                <Undo2 className="w-4 h-4" />Descartar
              </motion.button>
            )}
          </AnimatePresence>
          <button
            disabled={!hasChanges || saving}
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 min-w-[180px] justify-center",
              hasChanges && !saving
                ? "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (hasChanges ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
            {saving ? "Guardando..." : (hasChanges ? "Guardar Cambios" : "Sin Cambios")}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[24px] w-fit border border-slate-200/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AnimatePresence mode="wait">
          {activeTab === "negocio" && (
            <motion.div
              key="negocio"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-12 space-y-8"
            >
              {/* Perfil Público - Ancho Completo */}
              <section className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm">
                <div className="flex items-center gap-6 mb-10">
                  <div className="relative group/logo">
                    <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border-2 border-slate-100 shadow-sm overflow-hidden relative transition-all group-hover/logo:border-blue-400 group-hover/logo:shadow-lg group-hover/logo:shadow-blue-500/10">
                      {organization?.imageUrl ? (
                        <img src={organization.imageUrl} alt="Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover/logo:scale-110" />
                      ) : (
                        <Building2 className="w-10 h-10 text-slate-300" />
                      )}

                      {/* Overlay de Carga */}
                      <label className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover/logo:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white mb-1 translate-y-2 group-hover/logo:translate-y-0 transition-transform" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Cambiar</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && organization) {
                              setSaving(true);
                              try {
                                await organization.setLogo({ file });
                              } catch (err) {
                                console.error("Error subiendo logo:", err);
                              } finally {
                                setSaving(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className={cn(
                      "absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white pointer-events-none group-hover/logo:scale-110 transition-transform",
                      organization?.imageUrl ? "bg-slate-900" : "bg-blue-600"
                    )}>
                      {organization?.imageUrl ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Perfil Público</h3>
                    <p className="text-sm font-medium text-slate-500 italic">Identidad visual de tu clínica.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Nombre Comercial</label>
                    <input type="text" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 px-5 py-4 rounded-[20px] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Industria</label>
                    <select value={formData.industry} onChange={e => handleInputChange("industry", e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 px-5 py-4 rounded-[20px] outline-none font-bold text-slate-700 appearance-none cursor-pointer">
                      <option>Salud y Bienestar</option>
                      <option>Belleza y Estética</option>
                      <option>Servicios Profesionales</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Descripción</label>
                    <textarea rows={3} value={formData.description} onChange={e => handleInputChange("description", e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 px-5 py-4 rounded-[24px] focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-700 resize-none" />
                  </div>
                </div>
              </section>

              {/* Ubicación Inmersiva - Ancho Completo */}
              <section className="bg-white border border-slate-200 rounded-[48px] p-2 shadow-sm overflow-hidden relative group">
                {/* Header flotante sutil */}
                <div className="absolute top-8 left-8 z-20 flex flex-col gap-4 max-w-md w-full pr-16 pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-2xl shadow-slate-900/10 pointer-events-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">Ubicación</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sede del Negocio</p>
                        </div>
                      </div>
                      <button
                        onClick={detectLocation}
                        className="p-3 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg active:scale-95"
                        title="Detectar mi ubicación"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="relative group/input">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={e => handleInputChange("address", e.target.value)}
                          placeholder="Escribe la dirección o arrastra el pin..."
                          className="w-full bg-slate-50 border border-slate-100 pl-11 pr-5 py-3.5 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2 px-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordenadas sincronizadas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* El Mapa Inmersivo */}
                <div className="h-[500px] w-full rounded-[40px] overflow-hidden relative z-10 shadow-inner grayscale-[0.2] hover:grayscale-0 transition-all duration-700">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  {/* Overlay sutil para el efecto de profundidad */}
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-[40px] z-20" />
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "equipo" && (
            <motion.div key="equipo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-12 flex flex-col gap-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Formulario de Invitación */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Enviar Invitación</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="profesional@ejemplo.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 transition-all font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <button
                      onClick={handleInvite}
                      disabled={!inviteEmail || saving}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar Invitación Mágica</>}
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tight relative z-10">¿Cómo <span className="text-blue-400">funciona</span>?</h2>
                  <ul className="space-y-6 relative z-10">
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0">1</div>
                      <p className="text-slate-300 text-sm font-medium">Envías la invitación desde este panel para asegurar el enlace correcto.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0">2</div>
                      <p className="text-slate-300 text-sm font-medium">El profesional recibe un correo con acceso directo a la pantalla de registro premium.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0">3</div>
                      <p className="text-slate-300 text-sm font-medium">Al registrarse, se vincula automáticamente a {organization?.name || "tu empresa"} y ya podrá ver sus citas.</p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Members List */}
              <section className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm"><Users className="w-7 h-7" /></div>
                  <div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Miembros del Workspace</h3><p className="text-sm font-medium text-slate-500">Usuarios con acceso al sistema y perfiles de atención.</p></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {team.map((member) => (
                    <div key={member.clerkId || member.email} className="bg-slate-50/50 border border-slate-100 p-8 rounded-[40px] shadow-sm relative group hover:border-blue-200 hover:bg-white transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-100 flex items-center justify-center">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 tracking-tight truncate">{member.name}</h4>
                            {member.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse">Pendiente</span>
                            )}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rol de Sistema</span>
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit", member.role === 'org:admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600')}>
                            {member.role === 'org:admin' ? 'Administrador' : 'Miembro'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Perfil de Citas</span>
                          <span className={cn("flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest", member.professionalData ? "text-blue-600" : "text-slate-300")}>
                            {member.professionalData ? <Stethoscope className="w-3.5 h-3.5" /> : null}
                            {member.professionalData ? 'Especialista' : 'Solo Sistema'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => startEditing(member)}
                        disabled={member.status === 'pending'}
                        className={cn(
                          "w-full py-4 border font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2",
                          member.status === 'pending'
                            ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900"
                        )}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        {member.status === 'pending' ? 'Esperando Aceptación' : 'Configurar Perfil'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Edit Modal */}
              <AnimatePresence>
                {editingMember && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingMember(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="bg-white w-full max-w-2xl rounded-[48px] relative z-10 shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                      {/* Header Fijo */}
                      <div className="p-10 pb-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-xl border-4 border-white bg-slate-100 shrink-0">
                            <img src={editingMember.photoUrl} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{editingMember.name}</h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">Configuración de Especialista</p>
                          </div>
                        </div>
                        <button onClick={() => setEditingMember(null)} className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Área con Scroll */}
                      <div className="mx-2 mt-2 mb-4 pb-12 overflow-y-auto custom-scrollbar flex-1 space-y-8 pr-6 pl-8">
                        <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex gap-4">
                          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] font-medium text-blue-800 leading-relaxed">Si activas este perfil como especialista, aparecerá en tu página de reservas pública. Ideal para médicos, dentistas o técnicos.</p>
                        </div>

                        <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo Público</label>
                              <input type="text" value={editingMember.profRole} onChange={e => setEditingMember({ ...editingMember, profRole: e.target.value })} placeholder="Ej: Dentista Cirujano" className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-700" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Estatus Profesional</label>
                              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className={cn("w-10 h-6 rounded-full relative transition-all duration-300 cursor-pointer", editingMember.profRole ? "bg-blue-600" : "bg-slate-300")}>
                                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all", editingMember.profRole ? "left-5" : "left-1")} />
                                </div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{editingMember.profRole ? 'Habilitado' : 'Solo Sistema'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografía Breve</label>
                            <textarea rows={3} value={editingMember.bio} onChange={e => setEditingMember({ ...editingMember, bio: e.target.value })} className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-3xl focus:bg-white focus:border-blue-500 outline-none font-medium text-slate-700 resize-none" placeholder="Cuenta algo sobre este profesional..." />
                          </div>

                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Servicios que Realiza</label>
                            <div className="flex flex-wrap gap-2 p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                              {services.map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => toggleServiceForEditing(s.id)}
                                  className={cn(
                                    "px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                                    editingMember.serviceIds?.includes(s.id)
                                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                      : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                                  )}
                                >
                                  {editingMember.serviceIds?.includes(s.id) && <Check className="w-3 h-3" />}
                                  {s.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={handleSyncProfile}
                            disabled={saving}
                            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar Perfil de Especialista"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8">
                <section className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-10"><div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm"><ShieldCheck className="w-7 h-7" /></div><div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Políticas de Agenda</h3><p className="text-sm font-medium text-slate-500">Reglas de reserva.</p></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                    {/* Antelación Mínima */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Antelación Mínima (Horas)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={formData.bookingPolicies.minLeadTime}
                          onChange={e => handleNestedChange("bookingPolicies", "minLeadTime", Number(e.target.value))}
                          className="w-full bg-slate-50/50 border border-slate-200 px-5 py-4 rounded-[20px] outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                          placeholder="Ej: 2"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Horas</span>
                      </div>
                    </div>

                    {/* Antelación Máxima */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Antelación Máxima (Días)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={formData.bookingPolicies.maxLeadTime}
                          onChange={e => handleNestedChange("bookingPolicies", "maxLeadTime", Number(e.target.value))}
                          className="w-full bg-slate-50/50 border border-slate-200 px-5 py-4 rounded-[20px] outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                          placeholder="Ej: 30"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Días</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="lg:col-span-4">
                <section className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-8"><div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100"><PartyPopper className="w-7 h-7" /></div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Éxito UX</h3></div>
                  <div className="space-y-3 flex-grow flex flex-col">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje Post-Reserva</label>
                    <div className="w-full bg-slate-50/50 border border-slate-200 rounded-[24px] focus-within:bg-white focus-within:border-amber-500 transition-all overflow-hidden flex-grow flex">
                      <textarea
                        rows={4}
                        value={formData.successMessage}
                        onChange={e => handleInputChange("successMessage", e.target.value)}
                        className="w-full bg-transparent px-5 py-4 outline-none font-medium text-slate-700 resize-none text-sm flex-grow"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === "alertas" && (
            <motion.div key="alertas" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-12 space-y-6">
              <section className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-10"><div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm"><Bell className="w-7 h-7" /></div><div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Alertas</h3><p className="text-sm font-medium text-slate-500">Gestiona cómo te enteras de las nuevas citas.</p></div></div>
                <div className="space-y-4">
                  <div className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-blue-200 p-8 rounded-[32px] transition-all flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[22px] flex items-center justify-center border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                        <Mail className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">Notificaciones por Correo</h4>
                        <p className="text-sm font-medium text-slate-400">Envia un email instantáneo por cada nueva cita agendada.</p>
                      </div>
                    </div>
                    <button onClick={() => handleNestedChange("notifications", "email", !formData.notifications.email)} className={cn("w-16 h-9 rounded-full transition-all relative", formData.notifications.email ? "bg-blue-600" : "bg-slate-200")}>
                      <div className={cn("absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all shadow-md", formData.notifications.email ? "right-1.5" : "left-1.5")} />
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "seguridad" && (
            <motion.div key="seguridad" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="lg:col-span-12">
              <section className="bg-rose-50/30 border border-rose-100 rounded-[48px] p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-rose-600 tracking-tight">Zona de Peligro</h4>
                    <p className="text-sm font-medium text-rose-700/50">Acciones críticas e irreversibles.</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-rose-700/70 mb-8 leading-relaxed max-w-2xl">
                  Borrado definitivo de datos. Al eliminar tu cuenta o negocio, se perderán todas las citas, configuraciones y datos de clientes de forma permanente. Esta acción no se puede deshacer.
                </p>
                <button className="w-fit py-4 px-10 rounded-2xl bg-white border border-rose-200 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-95">
                  Eliminar Definitivamente
                </button>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl border border-slate-200 overflow-hidden text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-sm">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">¿Tienes cambios sin guardar?</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">Si sales ahora, perderás todas las modificaciones que has realizado. ¿Deseas guardar antes de salir?</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    const success = await handleSave();
                    if (success) {
                      if (pendingTab) setActiveTab(pendingTab);
                      setShowExitModal(false);
                    }
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  Guardar y Continuar
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    if (pendingTab) setActiveTab(pendingTab);
                    setShowExitModal(false);
                  }}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                >
                  Descartar y Salir
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-2 text-slate-400 font-bold text-xs hover:text-slate-600 transition-all mt-2"
                >
                  Regresar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
