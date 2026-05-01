"use client";

import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceProps {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export function ServiceCard({
  id,
  name,
  duration,
  price,
  description,
  selected,
  onSelect,
}: ServiceProps) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={cn(
        "group relative flex flex-col p-7 rounded-[32px] cursor-pointer transition-all duration-700",
        "border shadow-card hover:shadow-premium hover:-translate-y-2",
        selected
          ? "bg-white/90 border-indigo-500 scale-[1.03] dark:bg-slate-900/80 dark:border-indigo-400"
          : "bg-white/40 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800/60 hover:border-indigo-200"
      )}
    >
      {/* Decorative selected glow */}
      {selected && (
        <div className="absolute -inset-0.5 bg-indigo-500/10 blur-2xl rounded-[32px] -z-10" />
      )}

      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className={cn(
          "text-2xl font-bold tracking-tight transition-colors",
          selected ? "text-indigo-600 dark:text-indigo-300" : "text-slate-900 dark:text-slate-100"
        )}>
          {name}
        </h3>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-500",
          selected 
            ? "bg-indigo-600 shadow-xl shadow-indigo-600/30 scale-110" 
            : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        )}>
          {selected ? (
            <Check className="w-4 h-4 text-white stroke-[4px]" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          )}
        </div>
      </div>
      
      <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed line-clamp-3">
        {description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <Clock className="w-4 h-4 mr-2 text-indigo-500" />
          <span>{duration} MIN</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1.5 uppercase tracking-widest">Desde</span>
          ${price.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
