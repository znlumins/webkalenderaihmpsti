"use client";
import { useEffect, useState } from "react";
import Image from "next/image"; // Import ini untuk optimasi logo
import { supabase } from "../lib/supabaseClient"; 
import { EventService } from "../services/EventService";
import { EventData, Proker, UserProfile } from "../lib/types";
import { formatToWIB } from "../lib/dateHelper";
import { Menu, Smartphone, RotateCw } from "lucide-react";

// Components
import Sidebar from "../components/Sidebar";
import CalendarGrid from "../components/CalendarGrid";
import UpcomingList from "../components/UpcomingList";

// Modals
import EventModal from "../components/modals/EventModal";
import ProkerModal from "../components/modals/ProkerModal";
import LoginModal from "../components/modals/LoginModal";
import DetailModal from "../components/modals/DetailModal";
import LogoutModal from "../components/modals/LogoutModal";
import UserManagementModal from "../components/modals/UserManagementModal";

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [prokers, setProkers] = useState<Proker[]>([]);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [modalType, setModalType] = useState<'none' | 'add_event' | 'add_proker' | 'detail' | 'login' | 'logout' | 'users'>('none');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterDeptId, setFilterDeptId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<{start: string, end: string} | undefined>(undefined);
  
  // State untuk deteksi orientasi
  const [isPortrait, setIsPortrait] = useState(false);

  const isSuperAdmin = userProfile?.role === 'super_admin';
  const filteredEvents = filterDeptId ? events.filter((e: EventData) => e.prokers?.department_id === filterDeptId) : events;

  // --- LOGIC DETEKSI PORTRAIT ---
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portrait);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const fetchData = async () => {
    try {
      const [e, p] = await Promise.all([EventService.getAllEvents(), EventService.getAllProkers()]);
      setEvents(e || []); setProkers(p || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({data}) => {
        if (data.session) {
            setSession(data.session);
            supabase.from('profiles').select('*').eq('id', data.session.user.id).maybeSingle().then(({data: p}) => setUserProfile(p));
        }
    });
    const channel = supabase.channel('sync').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- RENDER PERINGATAN LANDSCAPE ---
  if (isPortrait) {
    return (
      <div className="fixed inset-0 bg-[#0a0f0d] z-[9999] flex flex-col items-center justify-center p-10 text-center">
        <div className="relative mb-8">
            <Smartphone size={80} className="text-gray-800 animate-pulse" />
            <RotateCw size={32} className="text-indigo-500 absolute -right-2 -bottom-2 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tighter mb-4">Miringkan Layar Anda</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Mohon gunakan posisi Landscape untuk pengalaman dashboard kalender HMPSTI yang lebih baik.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      
      <Sidebar 
        userProfile={userProfile} onLogout={() => session ? setModalType('logout') : setModalType('login')} onOpenUsers={() => setModalType('users')}
        onAddEvent={() => { setSelectedEvent(null); setModalType('add_event'); }} onManageProker={() => setModalType('add_proker')}
        isSuperAdmin={isSuperAdmin} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        filterDeptId={filterDeptId} onFilterChange={setFilterDeptId}
      />

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden flex flex-col">
        
        {/* Mobile Header dengan Image Optimization */}
        <div className="lg:hidden flex justify-between items-center mb-6 px-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"><Menu/></button>
            <div className="relative w-32 h-10">
                <Image 
                    src="/logo-hmpsti.png" 
                    alt="Logo HMPSTI" 
                    fill 
                    className="object-contain"
                    priority // Agar logo di-load paling pertama
                />
            </div>
        </div>

        <div className="flex-1">
            <CalendarGrid 
                currentDate={currentDate} 
                events={filteredEvents} 
                selectedDate={selectedDate}
                onDateClick={(day: Date) => {
                    setSelectedDate(day);
                    if(!session) return;
                    const yyyy = day.getFullYear();
                    const mm = String(day.getMonth() + 1).padStart(2, '0');
                    const dd = String(day.getDate()).padStart(2, '0');
                    setInitialFormDate({ start: `${yyyy}-${mm}-${dd}T09:00`, end: `${yyyy}-${mm}-${dd}T11:00` });
                    setSelectedEvent(null);
                    setModalType('add_event');
                }}
                onEventClick={(ev: EventData) => { setSelectedEvent(ev); setModalType('detail'); }} 
            />
        </div>
      </main>

      <UpcomingList events={filteredEvents} />

      {/* MODALS */}
      {modalType === 'login' && <LoginModal onClose={() => setModalType('none')} onSuccess={() => { setModalType('none'); window.location.reload(); }} />}
      {modalType === 'logout' && <LogoutModal onClose={() => setModalType('none')} onConfirm={async () => { await supabase.auth.signOut(); window.location.reload(); }} />}
      {modalType === 'users' && isSuperAdmin && <UserManagementModal onClose={() => setModalType('none')} />}
      {modalType === 'add_proker' && <ProkerModal onClose={() => setModalType('none')} onSuccess={() => fetchData()} userProfile={userProfile} isSuperAdmin={isSuperAdmin} />}
      {modalType === 'add_event' && <EventModal onClose={() => { setModalType('none'); setSelectedEvent(null); }} onSuccess={() => { setModalType('none'); setSelectedEvent(null); fetchData(); }} prokers={prokers} initialDate={initialFormDate} userProfile={userProfile} editData={selectedEvent} />}
      {modalType === 'detail' && selectedEvent && <DetailModal event={selectedEvent} onClose={() => { setModalType('none'); setSelectedEvent(null); }} onDeleteSuccess={() => { setModalType('none'); fetchData(); }} userProfile={userProfile} onEdit={(ev: EventData) => { setSelectedEvent(ev); setModalType('add_event'); }} />}

    </div>
  );
}