"use client";
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { PILLARS } from "../lib/constants";
import { EventData } from "../lib/types";

interface CalendarGridProps {
  currentDate: Date;
  events: EventData[];
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: EventData) => void;
}

// Helper function untuk menentukan kontras warna teks berdasarkan latar belakang
function getTextColorForBackground(hexColor: string): string {
  if (!hexColor) return '#1e293b'; // Teks gelap sebagai default

  const color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return brightness > 150 ? '#1e293b' : '#ffffff'; 
}


export default function CalendarGrid({ currentDate, events, selectedDate, onDateClick, onEventClick }: CalendarGridProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) { calendarApi.gotoDate(currentDate); }
  }, [currentDate]);

  if (!isMounted) return <div className="h-screen w-full bg-slate-100 rounded-lg animate-pulse"></div>;

  const calendarEvents = events.map((ev) => {
    const pillar = PILLARS.find((p) => p.id === ev.prokers?.department_id);
    const bgColor = pillar?.color || "#64748b";
    const textColor = getTextColorForBackground(bgColor);

    return {
      id: ev.id,
      title: ev.title,
      start: ev.start_time,
      end: ev.end_time,
      backgroundColor: bgColor, 
      borderColor: bgColor,
      textColor: textColor,
      extendedProps: { ...ev },     
    };
  });

  return (
    <div className="calendar-container-premium">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listMonth'
        }}
        
        buttonText={{ 
            today: 'Hari Ini', 
            month: 'Bulan', 
            week: 'Minggu', 
            list: 'Agenda' 
        }}

        events={calendarEvents}
        height="auto"
        contentHeight="80vh"
        selectable={true}
        locale="id"
        weekNumbers={true}
        dayMaxEvents={3}
        nowIndicator={true}
        dateClick={(info) => onDateClick(new Date(info.dateStr))}
        eventClick={(info) => onEventClick(info.event.extendedProps as EventData)}
        
        eventContent={(info) => {
            const isListView = info.view.type === 'listMonth';
            const eventColor = info.event.backgroundColor || '#64748b';

            if (isListView) {
                // Tampilan untuk Agenda/List
                return (
                    <div 
                        className="fc-list-custom-event"
                        style={{ borderLeft: `5px solid ${eventColor}` }}
                    >
                        <p className="fc-list-custom-event-title">
                            {info.event.title}
                        </p>
                    </div>
                );
            }

            // <<< PERUBAHAN FINAL: Tambahkan backgroundColor di sini >>>
            // Tampilan default untuk Bulan/Minggu
            return (
                <div 
                  className="fc-custom-event" 
                  style={{ 
                    backgroundColor: info.event.backgroundColor, // Set warna latar 'pil' event
                    color: info.event.textColor // Set warna teks agar kontras
                  }}
                >
                    <div className="fc-custom-event-indicator" style={{ backgroundColor: info.event.textColor, opacity: 0.5 }}/>
                    <p className="fc-custom-event-title">
                        {info.event.title}
                    </p>
                </div>
            );
        }}
      />

      <style jsx global>{`
        /* 1. LAYOUT TOOLBAR */
        .fc .fc-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2.5rem !important; }

        /* 2. JUDUL TENGAH */
        .fc .fc-toolbar-title { font-size: 2rem !important; font-weight: 800 !important; letter-spacing: -0.05em; color: #1e293b; text-transform: capitalize; }

        /* 3. TOMBOL NAVIGASI & VIEW SWITCHER */
        .fc .fc-button { display: inline-flex !important; align-items: center !important; justify-content: center !important; height: 44px !important; padding: 0 20px !important; border-radius: 12px !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: capitalize !important; letter-spacing: normal !important; transition: all 0.2s ease !important; background: white !important; border: 1px solid #e2e8f0 !important; color: #64748b !important; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important; margin: 0 4px !important; }
        .fc .fc-button .fc-icon { font-size: 1.2rem; }
        .fc .fc-button:hover { background: #f8fafc !important; color: #1e293b !important; border-color: #cbd5e1 !important; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07) !important; }
        .fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active { background: #0f172a !important; color: white !important; border-color: #0f172a !important; box-shadow: 0 7px 15px -3px rgba(15, 23, 42, 0.2) !important; transform: translateY(0); }

        /* 4. DESIGN GRID */
        .fc-theme-standard .fc-scrollgrid { border: 1px solid #e2e8f0 !important; border-radius: 1rem; overflow: hidden; }
        .fc td, .fc th { border-color: #f1f5f9 !important; }
        .fc th { background: #f8fafc !important; padding: 1rem 0 !important; font-size: 0.75rem !important; font-weight: 600 !important; color: #94a3b8 !important; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0 !important; border-left: none !important; border-right: none !important; }
        .fc .fc-daygrid-day-number { font-size: 0.875rem; font-weight: 600; padding: 0.75rem !important; color: #64748b; }

        /* 5. TODAY HIGHLIGHT */
        .fc .fc-day-today { background: #eef2ff !important; }
        .fc .fc-day-today .fc-daygrid-day-number { color: #4f46e5; font-weight: 800; }

        /* 6. EVENT BARS (Wadah) */
        .fc-h-event {
             background: transparent !important; /* Biarkan elemen anak yg mengatur warna */
             border: none !important; 
             margin: 3px 6px !important; 
        }
        .fc-daygrid-event-harness {
             border-radius: 8px; /* Pastikan container hover/klik punya radius */
        }
        
        /* 7. CUSTOM EVENT STYLE (Bulan/Minggu) */
        .fc-custom-event {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 8px;
            border-radius: 8px; /* Radius untuk kotak event */
            overflow: hidden;
            width: 100%;
            height: 100%;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        }
        .fc-custom-event:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .fc-custom-event-indicator {
            width: 4px;
            height: 12px;
            border-radius: 99px;
            flex-shrink: 0;
        }
        .fc-custom-event-title {
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            margin: 0;
        }

        /* 8. Week Number */
        .fc .fc-daygrid-week-number { color: #cbd5e1 !important; font-weight: 600; font-size: 0.7rem; font-style: normal; padding-right: 1rem !important; }
        
        /* 9. Responsif */
        @media (max-width: 768px) {
            .fc .fc-toolbar { flex-direction: column; align-items: stretch; margin-bottom: 1.5rem !important; }
            .fc .fc-toolbar-title { font-size: 1.5rem !important; text-align: center; }
            .fc .fc-toolbar-chunk { display: flex; justify-content: center; gap: 0.5rem; }
        }

        /* 10. STYLE TAMPILAN AGENDA */
        .fc-list-event { background-color: transparent !important; border: none !important; margin-bottom: 0.75rem !important; }
        .fc-list-event:hover td { background-color: #f8fafc !important; }
        .fc-list-event-time { color: #0f172a !important; font-weight: 700 !important; font-size: 0.8rem !important; white-space: nowrap; padding-left: 1rem !important; }
        .fc-list-event-dot { border-color: transparent !important; margin-right: 1rem !important; }
        .fc-list-event-title { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        .fc-list-custom-event { width: 100%; padding: 0.5rem 1rem; color: #1e293b; }
        .fc-list-custom-event-title { font-weight: 600; font-size: 0.9rem; margin: 0; }
      `}</style>
    </div>
  );
}