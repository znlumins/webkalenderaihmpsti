import { useState, useEffect } from "react";
import { format, isWithinInterval, parseISO, differenceInMinutes, differenceInSeconds } from "date-fns";
import { id } from "date-fns/locale"; // Bahasa Indonesia
import { EventData } from "../lib/types";
import { PILLARS } from "../lib/constants";
import { Radio, MapPin, Clock, X, Hourglass } from "lucide-react";

interface FocusModeProps {
  events: EventData[];
  onExit: () => void;
}

export default function FocusMode({ events, onExit }: FocusModeProps) {
  const [realtime, setRealtime] = useState(new Date());

  // Update setiap detik
  useEffect(() => {
    const timer = setInterval(() => setRealtime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cari kegiatan yang sedang aktif SEKARANG
  const current = events.find(ev => 
    isWithinInterval(realtime, { start: parseISO(ev.start_time), end: parseISO(ev.end_time) })
  );
  
  // Ambil warna departemen (atau default)
  const deptInfo = current ? PILLARS.find(p => p.id === current.prokers.department_id) : null;
  const accentColor = deptInfo?.color || '#333';

  // --- LOGIC PROGRESS BAR ---
  const getProgress = () => {
    if (!current) return 0;
    const start = parseISO(current.start_time).getTime();
    const end = parseISO(current.end_time).getTime();
    const now = realtime.getTime();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    
    const percent = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(percent, 0), 100); // Batasi 0-100%
  };

  const getRemainingTime = () => {
    if (!current) return "";
    const minLeft = differenceInMinutes(parseISO(current.end_time), realtime);
    if (minLeft > 60) {
        const hours = Math.floor(minLeft / 60);
        return `${hours} Jam ${minLeft % 60} Menit lagi`;
    }
    return `${minLeft} Menit lagi`;
  };

  return (
    <div className="fixed inset-0 bg-gray-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden z-[9999]">
      
      {/* Background Glow Effect */}
      {current && (
        <div 
            className="absolute inset-0 opacity-20 blur-[100px] animate-pulse"
            style={{ backgroundColor: accentColor }}
        ></div>
      )}

      {/* Tombol Exit */}
      <button 
        onClick={onExit} 
        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md transition border border-white/10 z-50"
      >
        Keluar Mode Fokus
      </button>

      {/* --- KONTEN UTAMA --- */}
      <div className="relative z-10 text-center w-full max-w-4xl">
        
        {/* JAM UTAMA */}
        <h1 className="text-6xl md:text-9xl font-mono font-bold mb-8 tracking-tighter opacity-80">
            {format(realtime, "HH:mm:ss")}
        </h1>

        {current ? (
          // --- TAMPILAN JIKA ADA ACARA (ALERT MODE) ---
          <div 
            className="bg-gray-900/80 backdrop-blur-xl border-l-[12px] rounded-r-3xl rounded-l-md shadow-2xl p-8 md:p-12 text-left relative overflow-hidden"
            style={{ borderColor: accentColor }}
          >
             {/* Logo Proker Watermark */}
             {current.prokers.logo_url && (
                <img 
                    src={current.prokers.logo_url} 
                    className="absolute top-1/2 right-[-50px] transform -translate-y-1/2 w-64 h-64 opacity-10 object-contain grayscale"
                />
             )}

             {/* BADGE "SEDANG BERLANGSUNG" (BERKEDIP) */}
             <div className="flex items-center gap-3 mb-6">
                 <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs md:text-sm font-extrabold animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)]">
                    <Radio size={16} className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"/>
                    <Radio size={16} className="relative inline-flex"/>
                    SEDANG BERLANGSUNG
                 </span>
                 <span 
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-black"
                 >
                    {deptInfo?.name || "UMUM"}
                 </span>
             </div>

             {/* JUDUL KEGIATAN */}
             <h2 className="text-3xl md:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
                {current.title}
             </h2>

             {/* DETAIL LOKASI & DESKRIPSI */}
             <div className="flex flex-col gap-2 text-gray-300 text-lg md:text-xl mb-8">
                 <div className="flex items-center gap-2">
                    <MapPin className="text-red-400" />
                    <span>{current.location}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Hourglass className="text-blue-400" />
                    <span>Selesai: {format(parseISO(current.end_time), "HH.mm")} WIB ({getRemainingTime()})</span>
                 </div>
             </div>

             {/* PROGRESS BAR WAKTU */}
             <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                    className="h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor]"
                    style={{ 
                        width: `${getProgress()}%`,
                        backgroundColor: accentColor 
                    }}
                ></div>
             </div>
             <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                <span>Mulai: {format(parseISO(current.start_time), "HH.mm")}</span>
                <span>{Math.round(getProgress())}% Berjalan</span>
                <span>Selesai: {format(parseISO(current.end_time), "HH.mm")}</span>
             </div>

          </div>
        ) : (
          // --- TAMPILAN JIKA KOSONG ---
          <div className="border-2 border-dashed border-gray-800 p-12 rounded-3xl bg-gray-900/30">
             <Clock size={64} className="mx-auto text-gray-700 mb-4"/>
             <h2 className="text-2xl font-bold text-gray-500">Tidak ada kegiatan aktif saat ini</h2>
             <p className="text-gray-600 mt-2">Mode pemantauan aktif. Layar akan berubah otomatis jika jadwal dimulai.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-gray-600 text-xs">
        <p>HMPSTI EVENT MONITORING SYSTEM • {format(realtime, "eeee, dd MMMM yyyy", {locale:id})}</p>
      </div>
    </div>
  );
}