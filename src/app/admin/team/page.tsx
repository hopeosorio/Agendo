"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { inviteMember, generateInviteLink } from "@/app/actions/onboarding";
import { Users, Mail, Send, CheckCircle2, AlertCircle, Loader2, Copy, Link as LinkIcon } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";

export default function TeamPage() {
  const { organization, isLoaded } = useOrganization();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await inviteMember(email);
      setStatus("success");
      setMessage(`Invitación enviada con éxito a ${email}`);
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "No se pudo enviar la invitación");
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = await generateInviteLink();
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Gestión de Talento</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Mi <span className="text-blue-600">Equipo</span></h1>
        <p className="text-slate-500 font-medium mt-1">Invita a nuevos profesionales a unirse a {organization?.name || "tu negocio"}.</p>
      </header>

      {/* Enlace de Acceso Rápido (Igual que E-Learning Mewi) */}
      <section className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              <h2 className="text-xl font-black uppercase italic tracking-tight">Enlace de Acceso Rápido</h2>
            </div>
            <p className="text-blue-100 text-sm font-medium max-w-md">Envía este enlace por WhatsApp para que tu equipo se registre y se vincule a {organization?.name || 'la empresa'} al instante.</p>
          </div>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
          >
            {copied ? <><CheckCircle2 className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Enlace</>}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Invitación */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Enviar Invitación</h2>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="profesional@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 transition-all font-bold text-slate-900 outline-none"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={status === "loading"}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50"
            >
              {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar Invitación Mágica</>}
            </button>
          </form>

          {status === "success" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> {message}
            </motion.div>
          )}

          {status === "error" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 font-bold text-sm">
              <AlertCircle className="w-5 h-5" /> {message}
            </motion.div>
          )}
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
    </div>
  );
}
