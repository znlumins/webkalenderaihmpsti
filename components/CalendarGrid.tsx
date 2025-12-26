import { useState, useEffect } from "react";
import { PILLARS } from "../lib/constants";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { EventData } from "../lib/types";
import { formatToWIB } from "../lib/dateHelper";

interface CalendarGridProps {
    currentDate: Date;
    events: EventData[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: EventData) => void;
}

export default function CalendarGrid({ currentDate, events, onDateClick, onEventClick }: CalendarGridProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

  if (!isMounted) return <div className="min-h-[400px] bg-white rounded-xl animate-pulse"></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-0">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
          <div key={d} className="py-2 md:py-3 text-center text-xs md:text-sm font-bold text-gray-400">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-[80px] md:auto-rows-[140px]">
        {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30"></div>
        ))}
        
        {days.map(day => {
          const dayString = format(day, "yyyy-MM-dd");
          const dayEvents = events.filter(e => formatToWIB(e.start_time, "yyyy-MM-dd") === dayString);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toString()} onClick={() => onDateClick(day)} className={`border-b border-r border-gray-100 p-1 md:p-2 transition relative group ${isToday ? 'bg-blue-50/50' : 'hover:bg-gray-50 cursor-pointer'}`}>
              <span className={`text-[10px] md:text-sm font-bold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-black text-white' : 'text-gray-500'}`}>{format(day, 'd')}</span>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[50px] md:max-h-[90px] no-scrollbar relative z-10">
                {dayEvents.map(ev => {
                    const color = PILLARS.find(p => p.id === ev.prokers?.department_id)?.color || '#666';
                    return (
                        <div key={ev.id} onClick={(e) => { e.stopPropagation(); onEventClick(ev); }} className="relative z-50 px-1 md:px-2 py-0.5 md:py-1.5 rounded border-l-[3px] md:border-l-4 bg-white shadow-sm flex items-center gap-1 cursor-pointer hover:scale-[1.02] transition-all" style={{ borderLeftColor: color }}>
                            <div className="overflow-hidden w-full pointer-events-none">
                                <p className="text-[8px] md:text-[10px] font-bold text-gray-800 truncate leading-tight">
                                    <span className="opacity-60 mr-1">{formatToWIB(ev.start_time, "HH.mm")}</span>
                                    {ev.title}
                                </p>
                            </div>
                        </div>
                    )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}