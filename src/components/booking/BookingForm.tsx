"use client";

import { useForm } from "react-hook-form";
import { User, Phone, Mail, ArrowRight, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookingFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading: externalIsLoading }: BookingFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isLoading = externalIsLoading || localIsLoading;

  const handleFormSubmit = async (data: any) => {
    setLocalIsLoading(true);
    await onSubmit(data);
    setIsSuccess(true);
    setLocalIsLoading(false);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 space-y-4 text-center"
      >
        <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
           <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 italic">¡Cita Agendada!</h3>
        <p className="text-slate-500 font-bold max-w-sm">
          Hemos recibido tus datos con éxito. En breve recibirás un mensaje de confirmación por WhatsApp.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
      <div className="grid grid-cols-1 gap-8">
        
        {/* Nombre Completo */}
        <div className="relative group">
          <div className="absolute -top-3 left-6 px-2 bg-white/80 backdrop-blur-md z-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-indigo-600 transition-colors">
              Nombre Completo
            </label>
          </div>
          <div className="relative">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-all group-focus-within:scale-110" />
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="Escribe tu nombre aquí..."
              className={cn(
                "w-full bg-white/40 backdrop-blur-sm border-2 border-slate-100 rounded-[32px] h-20 pl-16 pr-8 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all shadow-sm",
                errors.name && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/5"
              )}
            />
          </div>
          {errors.name && <span className="absolute -bottom-6 left-6 text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">Este campo es obligatorio</span>}
        </div>

        {/* WhatsApp / Teléfono */}
        <div className="relative group">
          <div className="absolute -top-3 left-6 px-2 bg-white/80 backdrop-blur-md z-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-indigo-600 transition-colors">
              WhatsApp / Teléfono
            </label>
          </div>
          <div className="relative">
            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-all group-focus-within:scale-110" />
            <input
              {...register("phone", { required: true })}
              type="tel"
              placeholder="Ej: +52 123 456 7890"
              className={cn(
                "w-full bg-white/40 backdrop-blur-sm border-2 border-slate-100 rounded-[32px] h-20 pl-16 pr-8 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all shadow-sm",
                errors.phone && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/5"
              )}
            />
          </div>
          {errors.phone && <span className="absolute -bottom-6 left-6 text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">Número de contacto necesario</span>}
        </div>

        <div className="relative group">
          <div className="absolute -top-3 left-6 px-2 bg-white/80 backdrop-blur-md z-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-indigo-600 transition-colors">
              Correo Electrónico
            </label>
          </div>
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-all group-focus-within:scale-110" />
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="nombre@ejemplo.com"
              className={cn(
                "w-full bg-white/40 backdrop-blur-sm border-2 border-slate-100 rounded-[32px] h-20 pl-16 pr-8 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all shadow-sm",
                errors.email && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/5"
              )}
            />
          </div>
          {errors.email && <span className="absolute -bottom-6 left-6 text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">Email necesario para confirmación</span>}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full h-24 rounded-[40px] bg-slate-900 text-white font-black text-xl transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:grayscale overflow-hidden relative group/btn",
            !isLoading && "hover:bg-indigo-600 hover:-translate-y-2"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>Confirmar Mi Cita</span>
              <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 py-2 px-6 bg-slate-50/50 rounded-2xl border border-slate-100 w-fit mx-auto">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          Transacción Segura y Encriptada
        </p>
      </div>
    </form>
  );
}
