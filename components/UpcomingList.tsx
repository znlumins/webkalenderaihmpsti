import { formatToWIB } from "../lib/dateHelper";
import { EventData } from "../lib/types";
import { PILLARS } from "../lib/constants";
import { addDays } from "date-fns";

export default function UpcomingList({ events }: { events: EventData[] }) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const todayStr = formatToWIB(today, "yyyy-MM-dd");
  const tomorrowStr = formatToWIB(tomorrow, "yyyy-MM-dd");

  const todayEvents = events.filter(e => formatToWIB(e.start_time, "yyyy-MM-dd") === todayStr);
  const tomorrowEvents = events.filter(e => formatToWIB(e.start_time, "yyyy-MM-dd") === tomorrowStr);

  return (
    <div className="w-80 bg-white p-6 border-l border-gray-100 h-screen sticky top-0 overflow-y-auto hidden xl:block">
      <h2 className="text-2xl font-bold mb-6">Mendatang</h2>
      
      <div className="space-y-8">
        <section>
            <h3 className="text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">Hari Ini</h3>
            <div className="space-y-4">
                {todayEvents.length > 0 ? todayEvents.map(e => <EventCard key={e.id} event={e} />) : <p className="text-xs text-gray-300 italic px-2">Tidak ada jadwal</p>}
            </div>
        </section>

        <section>
            <h3 className="text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">Besok</h3>
            <div className="space-y-4">
                {tomorrowEvents.length > 0 ? tomorrowEvents.map(e => <EventCard key={e.id} event={e} />) : <p className="text-xs text-gray-300 italic px-2">Tidak ada jadwal</p>}
            </div>
        </section>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventData }) {
  const color = PILLARS.find(p => p.id === event.prokers?.department_id)?.color || '#ddd';
  
  return (
    <div className="p-4 rounded-[28px] border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer group" style={{ backgroundColor: color + '10' }}>
        <div className="flex justify-between items-center mb-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-100 group-hover:scale-110 transition-transform">
                {event.prokers?.logo_url ? <img src={event.prokers.logo_url} className="w-5 h-5 object-contain" /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>}
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase bg-white px-2.5 py-1 rounded-full shadow-sm">
                {formatToWIB(event.start_time, "HH.mm")}
            </span>
        </div>
        <h4 className="font-bold text-gray-800 text-xs mb-1 line-clamp-1">{event.title}</h4>
        <p className="text-[10px] font-bold text-gray-400 opacity-80">{event.location}</p>
    </div>
  );
}