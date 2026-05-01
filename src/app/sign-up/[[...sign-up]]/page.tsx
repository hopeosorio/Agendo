"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Users, Building2 } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  
  // Detectamos si es una invitación de equipo (Clerk añade tickets o tokens)
  const isInvitation = searchParams.has("__clerk_ticket") || searchParams.has("invite_token") || searchParams.get("join") === "true";
  const orgId = searchParams.get("org_id");
  const isJoinFlow = searchParams.get("join") === "true";

  // AUTO-REDIRECCIÓN: Si el usuario ya está logueado y viene a unirse, lo mandamos al admin
  useEffect(() => {
    if (isAuthLoaded && isSignedIn && isJoinFlow) {
      router.replace("/admin");
    }
  }, [isSignedIn, isAuthLoaded, isJoinFlow, router]);

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden p-6">
      <AnimatedBackground />
      
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LADO IZQUIERDO: CONTENIDO DINÁMICO */}
        <motion.section 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
            {isInvitation ? <Users className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isInvitation ? "Invitación de Equipo" : "Plataforma de Élite"}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic">
            {isInvitation ? (
              <>ÚNETE AL <br /><span className="text-blue-600">EQUIPO.</span></>
            ) : (
              <>EMPIEZA TU <br /><span className="text-blue-600">IMPERIO.</span></>
            )}
          </h1>
          
          <p className="text-xl text-slate-500 font-bold max-w-md leading-relaxed">
            {isInvitation 
              ? "Has sido invitado a colaborar. Configura tu cuenta profesional para acceder a tus citas y clientes."
              : "Únete a los negocios que ya están optimizando su tiempo. Registro instantáneo, control total."
            }
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center text-blue-600">
                {isInvitation ? <Building2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isInvitation ? "VINCULACIÓN" : "LANZAMIENTO"}
                </p>
                <p className="font-bold text-slate-700 text-sm">
                  {isInvitation ? "Acceso Directo" : "Listo en segundos"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEGURIDAD</p>
                <p className="font-bold text-slate-700 text-sm">Protección total</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* LADO DERECHO: FORMULARIO */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
          <div className="w-full max-w-md">
            <SignUp 
              path="/sign-up"
              routing="path"
              fallbackRedirectUrl="/admin" 
              appearance={{ 
                elements: { 
                  rootBox: "mx-auto w-full", 
                  card: "bg-white/80 backdrop-blur-3xl border border-white shadow-2xl rounded-[40px] p-2", 
                } 
              }} 
            />
          </div>
        </motion.section>
      </div>
    </main>
  );
}
