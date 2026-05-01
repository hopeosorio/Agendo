"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Rocket, Building2, Link as LinkIcon, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";
import { createBusiness } from "@/app/actions/onboarding";
import { useOrganizationList, useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { setActive, isLoaded: isOrgListLoaded } = useOrganizationList();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: ""
  });

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !setActive) return;
    setLoading(true);
    setError("");
    try {
      const result = await createBusiness(formData);
      if (result.success && result.orgId) {
        // ACTIVAR LA ORGANIZACIÓN EN EL CLIENTE
        await setActive({ organization: result.orgId });
        setStep(2);
        setTimeout(() => router.push("/admin"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear el negocio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden p-6">
      <AnimatedBackground />
      
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/60 bg-white/40 backdrop-blur-3xl"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
                  <Rocket className="text-white w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase italic mb-4">Configura tu <span className="text-blue-600">Negocio</span></h1>
                <p className="text-slate-500 font-bold text-lg max-w-md">Estás a un paso de digitalizar tu agenda. Cuéntanos cómo se llama tu proyecto.</p>
              </div>

              <div className="space-y-8 max-w-lg mx-auto">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Nombre del Negocio</label>
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="Ej. Barbería Elite"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full h-16 pl-14 pr-6 bg-white/50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 transition-all font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Tu Enlace Personalizado</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <div className="flex items-center w-full h-16 pl-14 pr-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-slate-400 font-bold overflow-hidden">
                      <span className="hidden sm:inline">agendo.com/book/</span>
                      <input 
                        type="text"
                        placeholder="tu-negocio"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="flex-1 bg-transparent border-none outline-none text-blue-600 ml-1"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold text-center">{error}</motion.p>
                )}

                <button 
                  onClick={handleSubmit}
                  disabled={loading || !formData.name || !formData.slug}
                  className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 shadow-xl shadow-blue-500/10 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Lanzar mi Negocio
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-12"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="text-white w-12 h-12" />
              </motion.div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase italic mb-4">¡Todo <span className="text-emerald-500">Listo</span>!</h1>
              <p className="text-slate-500 font-bold text-xl mb-8">Estamos preparando tu panel administrativo...</p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
