"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number; // Porcentaje de cambio
  icon: LucideIcon;
  description?: string;
  variant?: "indigo" | "pink" | "emerald";
}

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  description,
  variant = "indigo",
}: StatCardProps) {
  const isPositive = trend && trend > 0;
  
  const variants = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    pink: "text-rose-400 bg-rose-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="group relative flex flex-col p-8 rounded-[36px] bg-white/5 border border-slate-800/60 backdrop-blur-3xl shadow-premium overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:bg-white/10">
      
      {/* Visual top accent */}
      <div className={cn(
        "absolute top-0 right-0 p-5 opacity-10 animate-pulse",
        variants[variant]
      )}>
        <Icon className="w-16 h-16" strokeWidth={3} />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className={cn("p-4 rounded-2xl", variants[variant])}>
          <Icon className="w-6 h-6" strokeWidth={3} />
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase",
            isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
          )}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</span>
        <h4 className="text-4xl font-black text-white leading-none tracking-tighter">
          {value}
        </h4>
        {description && (
          <p className="text-xs font-bold text-slate-400 mt-4 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
