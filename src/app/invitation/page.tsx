"use client";

import { SignUp, useUser, useOrganizationList } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Users, ShieldCheck, ArrowRight, Building2 } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InvitationPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { setActive, isLoaded: isOrgListLoaded } = useOrganizationList();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // En una invitación real, Clerk suele pasar un ticket o token en la URL
  const invitationToken = searchParams.get("__clerk_ticket");

  return (
    <main className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden p-6">
      <AnimatedBackground />
      
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LADO IZQUIERDO: MENSAJE DE BIENVENIDA AL EQUIPO */}
        <motion.section 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Invitación de Equipo</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic">
            ÚNETE AL <br />
            <span className="text-blue-600">EQUIPO.</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-bold max-w-md leading-relaxed">
            Has sido invitado a formar parte de una organización en Agendo. Configura tu perfil profesional para empezar a gestionar tus citas.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Acceso Directo</p>
                <p className="font-bold text-slate-700">Vinculación automática con tu empresa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Seguridad Agendo</p>
                <p className="font-bold text-slate-700">Tu panel profesional está protegido</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* LADO DERECHO: COMPONENTE DE REGISTRO DE CLERK */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
          <div className="w-full max-w-md">
            {/* El componente SignUp de Clerk detecta automáticamente la invitación si viene el token en la URL */}
            <SignUp 
              signInUrl="/sign-in"
              fallbackRedirectUrl="/admin"
              appearance={{
                elements: {
                  card: "bg-white/80 backdrop-blur-3xl border border-white shadow-2xl rounded-[40px] p-2",
                  headerTitle: "hidden", // Ocultamos el título de Clerk para usar el nuestro
                  headerSubtitle: "hidden"
                }
              }}
            />
          </div>
        </motion.section>

      </div>
    </main>
  );
}
