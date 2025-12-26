"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; 
import { EventService } from "../services/EventService";
import { EventData, Proker, UserProfile } from "../lib/types";

// Components & Modals
import Header from "../components/Header";
import CalendarGrid from "../components/CalendarGrid";
import FocusMode from "../components/FocusMode";
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
  const [view, setView] = useState<'calendar' | 'focus'>('calendar');
  const [modalType, setModalType] = useState<'none' | 'add_event' | 'add_proker' | 'detail' | 'login' | 'logout' | 'users'>('none');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<{start: string, end: string} | undefined>(undefined);

  useEffect(() => {
    fetchData();
    checkSession();
  }, []);

  const fetchData = async () => {
    try {
      const [e, p] = await Promise.all([EventService.getAllEvents(), EventService.getAllProkers()]);
      setEvents(e || []); setProkers(p || []);
    } catch (err) { console.error(err); }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(session);
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        setUserProfile(data);
      }
    } catch (err) {
      await supabase.auth.signOut(); setSession(null); setUserProfile(null);
    }
  };

  const handleDateClick = (day: Date) => {
    if(!session) return; 
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    setInitialFormDate({ start: `${yyyy}-${mm}-${dd}T09:00`, end: `${yyyy}-${mm}-${dd}T11:00` });
    setModalType('add_event');
  };

  if (view === 'focus') return <FocusMode events={events} onExit={() => setView('calendar')} />;

  const isSuperAdmin = userProfile?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      <Header currentDate={currentDate} setCurrentDate={setCurrentDate} session={session} userProfile={userProfile} onViewFocus={() => setView('focus')} onOpenProker={() => setModalType('add_proker')} onLogin={() => setModalType('login')} onLogout={() => setModalType('logout')} onOpenUsers={() => setModalType('users')} />
      <main className="max-w-7xl mx-auto p-2 md:p-6">
        <CalendarGrid currentDate={currentDate} events={events} onDateClick={handleDateClick} onEventClick={(ev) => { setSelectedEvent(ev); setModalType('detail'); }} />
      </main>

      {modalType === 'login' && <LoginModal onClose={() => setModalType('none')} onSuccess={() => { setModalType('none'); checkSession(); }} />}
      {modalType === 'logout' && <LogoutModal onClose={() => setModalType('none')} onConfirm={async () => { await supabase.auth.signOut(); setSession(null); setUserProfile(null); setModalType('none'); }} />}
      {modalType === 'users' && isSuperAdmin && <UserManagementModal onClose={() => setModalType('none')} />}
      {modalType === 'add_proker' && <ProkerModal onClose={() => setModalType('none')} onSuccess={() => { setModalType('none'); fetchData(); }} userProfile={userProfile} isSuperAdmin={isSuperAdmin} />}
      {modalType === 'add_event' && <EventModal onClose={() => setModalType('none')} onSuccess={() => { setModalType('none'); fetchData(); }} prokers={prokers} initialDate={initialFormDate} userProfile={userProfile} />}
      {modalType === 'detail' && selectedEvent && <DetailModal event={selectedEvent} onClose={() => { setModalType('none'); setSelectedEvent(null); }} onDeleteSuccess={() => { setModalType('none'); fetchData(); }} userProfile={userProfile} />}
    </div>
  );
}