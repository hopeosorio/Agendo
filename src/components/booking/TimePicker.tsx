"use client";

import { cn } from "@/lib/utils";

interface TimePickerProps {
  availableTimes: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  isLoading?: boolean;
}

export function TimePicker({ availableTimes, selectedTime, onSelect, isLoading }: TimePickerProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[16px] font-medium text-slate-800 dark:text-slate-100 tracking-tight">
          Upcoming Today
        </h3>
        <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
          Select time
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[84px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : availableTimes.length > 0 ? (
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 custom-scrollbar" style={{ maxHeight: "calc(100% - 40px)" }}>
          {availableTimes.map((time, index) => {
            const isSelected = selectedTime === time;
            
            // Generate a fake end time (45 mins later) for UI fidelity
            const [hours, minutes] = time.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes + 45);
            const endTimeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            // Alternate left border colors for visual fidelity with the screenshot
            const borderColors = ["bg-blue-600", "bg-emerald-500", "bg-indigo-600", "bg-amber-500", "bg-rose-500"];
            const borderColor = isSelected ? "bg-blue-600" : borderColors[index % borderColors.length];
            
            return (
              <button
                key={time}
                onClick={() => onSelect(time)}
                className={cn(
                  "relative min-h-[84px] w-full rounded-2xl flex flex-col justify-center px-6 transition-all duration-200 text-left overflow-hidden",
                  isSelected
                    ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md ring-1 ring-blue-500/20"
                    : "bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 hover:shadow-sm"
                )}
              >
                {/* Thick Left Border Indicator */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-[5px]",
                  borderColor
                )} />

                <div className="flex items-center justify-between w-full">
                  <span className={cn(
                    "text-[13px] font-medium",
                    borderColor.replace('bg-', 'text-').replace('-500', '-600')
                  )}>
                    {time} - {endTimeStr}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600 tracking-widest text-lg leading-none -mt-2">...</span>
                </div>
                
                <span className="text-[15px] font-medium text-slate-800 dark:text-slate-100 mt-1">
                  Reserva de Cita
                </span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                  General Service • In Person
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-10 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 mt-4">
            <p className="text-sm font-medium text-slate-400">Sin disponibilidad</p>
        </div>
      )}
    </div>
  );
}
