"use client";

import { motion } from "framer-motion";
import { SignIn } from "@clerk/nextjs";
import { Sparkles, Building2, ArrowRight, LayoutDashboard, Globe } from "lucide-react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden p-6">
      <AnimatedBackground />
      
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
         <motion.aside 
           initial={{ opacity: 0, x: -40 }} 
           animate={{ opacity: 1, x: 0 }} 
           transition={{ duration: 0.8 }}
           className="hidden lg:flex flex-col space-y-12 max-w-xl text-left"
         >
            <Link href="/" className="flex items-center gap-3 group">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-white text-[24px]">bolt</span>
               </div>
               <span className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Agend<span className="text-blue-600">o</span></span>
            </Link>

            <div className="space-y-6">
               <h2 className="text-6xl xl:text-7xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] uppercase italic">GESTIONA TU <br/><span className="text-blue-600">NEGOCIO</span>.</h2>
               <p className="text-slate-500 font-bold text-xl leading-relaxed max-w-md">Accede a tu panel administrativo y controla tus citas, profesionales y sedes en tiempo real.</p>
            </div>

            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                     <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard Centralizado</p>
                    <p className="text-sm font-bold text-slate-700">Control total de tu agenda</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                     <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal de Reservas</p>
                    <p className="text-sm font-bold text-slate-700">Tus clientes agendan 24/7</p>
                  </div>
               </div>
            </div>
         </motion.aside>

         <motion.section 
           initial={{ opacity: 0, scale: 0.95 }} 
           animate={{ opacity: 1, scale: 1 }} 
           transition={{ duration: 0.5, delay: 0.2 }}
           className="relative w-full lg:w-auto"
         >
            <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full -z-10" />
            <SignIn 
              path="/sign-in"
              routing="path"
              fallbackRedirectUrl="/admin" 
              appearance={{ 
                elements: { 
                  rootBox: "mx-auto w-full", 
                  card: "bg-white/40 backdrop-blur-3xl border border-white/60 shadow-2xl shadow-blue-500/10 rounded-[32px] p-2", 
                  headerTitle: "font-black tracking-tighter uppercase italic text-2xl text-slate-900",
                  headerSubtitle: "text-slate-500 font-bold",
                  formButtonPrimary: "bg-slate-900 hover:bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] py-3 transition-all",
                  socialButtonsBlockButton: "rounded-2xl border-slate-200 hover:bg-white/50 transition-all",
                  socialButtonsBlockButtonText: "font-bold text-slate-600",
                  formFieldLabel: "text-[10px] font-black uppercase tracking-widest text-slate-400",
                  formFieldInput: "rounded-2xl border-slate-200 bg-white/50 focus:border-blue-600 transition-all",
                  footerActionLink: "text-blue-600 font-black",
                  identityPreviewEditButton: "text-blue-600"
                } 
              }} 
            />
         </motion.section>
      </div>
    </main>
  );
}
