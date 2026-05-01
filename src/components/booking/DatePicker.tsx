"use client";

import { cn } from "@/lib/utils";
import { 
  format, 
  startOfToday, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isBefore,
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DatePickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate || startOfToday()));
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
          <h3 className="text-[16px] font-medium text-slate-800 dark:text-slate-100 tracking-tight">
            Schedule
          </h3>
        </div>
        
        <div className="flex items-center gap-5">
          <button 
            type="button"
            onClick={prevMonth}
            className="p-1 text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={3} />
          </button>
          <span className="min-w-[120px] text-center text-[15px] font-medium text-slate-800 dark:text-slate-200 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </span>
          <button 
            type="button"
            onClick={nextMonth}
            className="p-1 text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
      
      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[13px] font-medium text-slate-400 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-3 flex-1">
        {days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isPast = isBefore(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => !isPast && onSelect(date)}
              disabled={isPast}
              className={cn(
                "relative aspect-square flex flex-col items-start p-3 sm:p-4 rounded-[16px] transition-all",
                isPast 
                  ? "opacity-30 cursor-not-allowed bg-transparent text-slate-400" 
                  : "cursor-pointer",
                !isPast && !isSelected && isCurrentMonth 
                  ? "bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm" 
                  : "",
                !isPast && !isSelected && !isCurrentMonth 
                  ? "bg-slate-50 dark:bg-slate-900/30 border border-slate-50 dark:border-slate-800/30 text-slate-400 dark:text-slate-600" 
                  : "",
                isSelected 
                  ? "bg-white dark:bg-slate-900 border-[2px] border-blue-500 text-slate-900 dark:text-white shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]" 
                  : ""
              )}
            >
              <span className={cn(
                "text-[14px] font-medium",
                isSelected ? "text-slate-900 dark:text-white font-semibold" : ""
              )}>
                {format(date, "d")}
              </span>
              
              {/* Event indicators inside selected day */}
              {isSelected && (
                <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-[3px]">
                  <div className="h-[3px] w-full bg-blue-500 rounded-full" />
                  <div className="h-[3px] w-2/3 bg-emerald-500 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
