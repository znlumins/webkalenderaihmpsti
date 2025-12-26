"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; 
import { EventService } from "../services/EventService";
import { EventData, Proker, UserProfile } from "../lib/types";
import { formatForInput } from "../lib/dateHelper"; // <--- IMPORT HELPER

// Components
import Header from "../components/Header";
import CalendarGrid from "../components/CalendarGrid";
import FocusMode from "../components/FocusMode";

// Modals
import EventModal from "../components/modals/EventModal";
import ProkerModal from "../components/modals/ProkerModal";
import LoginModal from "../components/modals/LoginModal";
import DetailModal from "../components/modals/DetailModal";
import LogoutModal from "../components/modals/LogoutModal";
import UserManagementModal from "../components/modals/UserManagementModal";

export default function Home() {
  // --- STATE ---
  const [events, setEvents] = useState<EventData[]>([]);
  const [prokers, setProkers] = useState<Proker[]>([]);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // UI State
  const [view, setView] = useState<'calendar' | 'focus'>('calendar');
  const [modalType, setModalType] = useState<'none' | 'add_event' | 'add_proker' | 'detail' | 'login' | 'logout' | 'users'>('none');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<{start: string, end: string} | undefined>(undefined);

  // --- EFFECT ---
  useEffect(() => {
    fetchData();
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserProfile(null);
      } else if (session) {
        setSession(session);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOGIC ---
  const fetchData = async () => {
    try {
      const [e, p] = await Promise.all([
        EventService.getAllEvents(),
        EventService.getAllProkers()
      ]);
      setEvents(e || []);
      setProkers(p || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setUserProfile(data);
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(session);
      if (session) await fetchProfile(session.user.id);
    } catch (error) {
      console.error("Session Error (Auto Logout):", error);
      await supabase.auth.signOut(); 
      setSession(null);
      setUserProfile(null);
    }
  };

  const performLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setModalType('none');
  };

  // --- HANDLERS ---
  const handleDateClick = (day: Date) => {
    // Read-only untuk public
    if(!session) return; 
    
    // SETUP JAM DEFAULT (09.00 - 11.00 WIB)
    const startDate = new Date(day);
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(day);
    endDate.setHours(11, 0, 0, 0);

    // GUNAKAN HELPER (Agar timezone Vercel tidak mengacaukan jam)
    setInitialFormDate({
        start: formatForInput(startDate),
        end: formatForInput(endDate)
    });
    setModalType('add_event');
  };

  const handleEventClick = (ev: EventData) => {
    setSelectedEvent(ev);
    setModalType('detail');
  };

  if (view === 'focus') {
    return <FocusMode events={events} onExit={() => setView('calendar')} />;
  }

  const isSuperAdmin = userProfile?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      
      <Header 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        session={session}
        userProfile={userProfile}
        onViewFocus={() => setView('focus')}
        onOpenProker={() => setModalType('add_proker')}
        onLogin={() => setModalType('login')}
        onLogout={() => setModalType('logout')}
        onOpenUsers={() => setModalType('users')}
      />

      <main className="max-w-7xl mx-auto p-2 md:p-6">
        <CalendarGrid 
            currentDate={currentDate} 
            events={events} 
            onDateClick={handleDateClick}
            onEventClick={handleEventClick} 
        />
      </main>

      {/* --- MODALS --- */}
      
      {modalType === 'login' && (
        <LoginModal 
            onClose={() => setModalType('none')} 
            onSuccess={() => { setModalType('none'); checkSession(); }}
        />
      )}

      {modalType === 'logout' && (
        <LogoutModal 
            onClose={() => setModalType('none')}
            onConfirm={performLogout}
        />
      )}

      {modalType === 'users' && isSuperAdmin && (
        <UserManagementModal 
            onClose={() => setModalType('none')}
        />
      )}

      {modalType === 'add_proker' && (
        <ProkerModal 
            onClose={() => setModalType('none')}
            onSuccess={() => { setModalType('none'); fetchData(); }}
            userProfile={userProfile}
            isSuperAdmin={isSuperAdmin}
        />
      )}

      {modalType === 'add_event' && (
        <EventModal 
            onClose={() => setModalType('none')}
            onSuccess={() => { setModalType('none'); fetchData(); }}
            prokers={prokers}
            initialDate={initialFormDate}
            userProfile={userProfile}
        />
      )}

      {modalType === 'detail' && selectedEvent && (
        <DetailModal 
            event={selectedEvent}
            onClose={() => { setModalType('none'); setSelectedEvent(null); }}
            onDeleteSuccess={() => { setModalType('none'); fetchData(); }}
            userProfile={userProfile}
        />
      )}
    </div>
  );
}