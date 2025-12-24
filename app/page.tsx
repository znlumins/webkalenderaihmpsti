"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, 
  addMonths, subMonths, parseISO, areIntervalsOverlapping, isWithinInterval 
} from "date-fns";
import { id } from "date-fns/locale"; 
import { 
  ChevronLeft, ChevronRight, X, Clock, MapPin, Copy, Plus, Trash2, Zap, 
  LogIn, LogOut, Users, Briefcase, FileText, CheckSquare, FolderPlus, Sparkles, Menu 
} from "lucide-react";

// --- DATA KONFIGURASI ---
const PILLARS = [
  { id: 1, name: "PSDM", color: "#84A98C" },
  { id: 2, name: "INOVASI", color: "#64748B" },
  { id: 3, name: "MEDIA", color: "#FF7F50" },
  { id: 4, name: "ADVOKESMA", color: "#F28B82" },
  { id: 5, name: "HUMAS", color: "#6FA8DC" },
  { id: 6, name: "EKRAF", color: "#F1C40F" },
  { id: 7, name: "SENI OR", color: "#9B59B6" }
];
const ACTIVITY_TYPES = ["Rapat Rutin", "Rapat Besar", "Technical Meeting", "Gladi Resik", "Hari H (Eksekusi)", "Lainnya"];
const DIVISIONS_OPT = ["Panitia Inti", "Sie Acara", "Sie Pubdok", "Sie Humas", "Sie Logistik", "Sie Konsumsi", "Sie Keamanan", "Seluruh Panitia"];

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [prokers, setProkers] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [view, setView] = useState<'calendar' | 'focus'>('calendar');
  const [modalType, setModalType] = useState<'none' | 'add_event' | 'add_proker' | 'detail' | 'login'>('none');
  const [activeTab, setActiveTab] = useState<'info' | 'tim' | 'logistik' | 'file'>('info');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [realtime, setRealtime] = useState(new Date());
  const [formData, setFormData] = useState({ title: "", activity_type: "Rapat Rutin", start_time: "", end_time: "", location: "", description: "", proker_id: "", logistics: "" });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [prokerData, setProkerData] = useState({ name: "", department_id: 0 });
  const [prokerLogo, setProkerLogo] = useState<File | null>(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => { fetchData(); checkSession(); setInterval(() => setRealtime(new Date()), 1000); }, []);

  const fetchData = async () => {
    const { data: e } = await supabase.from("events").select(`*, prokers (name, logo_url, department_id)`); setEvents(e || []);
    const { data: p } = await supabase.from("prokers").select("*"); setProkers(p || []);
  };
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession(); setSession(session);
    if (session) { const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single(); setUserProfile(data); }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(loginData);
    if(error) alert("Gagal: " + error.message); else { setSession(data.session); const { data: p } = await supabase.from('profiles').select('*').eq('id', data.session?.user.id).single(); setUserProfile(p); setModalType('none'); fetchData(); }
    setLoading(false);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setUserProfile(null); };

  const isSuperAdmin = userProfile?.role === 'super_admin';
  const myDeptId = userProfile?.department_id;
  const availableProkers = prokers.filter(p => isSuperAdmin || p.department_id === myDeptId);

  const handleAiCopy = async (ev: any) => {
    setIsAiLoading(true);
    try {
      const deptName = PILLARS.find(p => p.id === ev.prokers.department_id)?.name;
      const body = {
        title: ev.title, date: format(parseISO(ev.start_time), "eeee, dd MMMM yyyy", { locale: id }),
        time: `${format(parseISO(ev.start_time), "HH.mm")} - ${format(parseISO(ev.end_time), "HH.mm")} WIB`,
        location: ev.location, description: ev.description || "-", type: ev.activity_type,
        proker: ev.prokers?.name || "Kepanitiaan", dept: deptName, logistics: ev.logistics
      };
      const response = await fetch('/api/generate-jarkoman', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (data.jarkoman) {
        let finalText = data.jarkoman; if (ev.file_url) finalText += `\n\n📂 *Link Materi/File:*\n${ev.file_url}`;
        navigator.clipboard.writeText(finalText); alert("✨ Jarkoman AI Disalin!");
      } else alert("AI Error.");
    } catch (err) { alert("Cek koneksi internet."); }
    setIsAiLoading(false);
  };

  const copyManual = (ev: any) => {
    const text = `📢 *INFO KEGIATAN*\nProker: ${ev.prokers.name}\n📅 ${format(parseISO(ev.start_time), "eeee, dd MMMM", { locale: id })}\n⏰ ${format(parseISO(ev.start_time), "HH.mm")} - ${format(parseISO(ev.end_time), "HH.mm")}\n📍 ${ev.location}\n📝 ${ev.title}\n🔗 ${ev.file_url || "-"}`;
    navigator.clipboard.writeText(text); alert("Disalin (Manual).");
  };

  const handleSaveProker = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let logoUrl = "";
    if (prokerLogo) { const fileName = `logo_${Date.now()}_${prokerLogo.name}`; await supabase.storage.from('materials').upload(fileName, prokerLogo); const { data } = supabase.storage.from('materials').getPublicUrl(fileName); logoUrl = data.publicUrl; }
    await supabase.from("prokers").insert([{ name: prokerData.name, department_id: Number(prokerData.department_id), logo_url: logoUrl }]);
    setLoading(false); setModalType('none'); fetchData();
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const start = new Date(formData.start_time); const end = new Date(formData.end_time);
    const conflict = events.find(ev => areIntervalsOverlapping({ start, end }, { start: parseISO(ev.start_time), end: parseISO(ev.end_time) }));
    if (conflict && !confirm(`⚠️ BENTROK dengan "${conflict.title}". Lanjut?`)) { setLoading(false); return; }
    let fileUrl = "";
    if (uploadFile) { const fileName = `materi_${Date.now()}_${uploadFile.name}`; await supabase.storage.from('materials').upload(fileName, uploadFile); const { data } = supabase.storage.from('materials').getPublicUrl(fileName); fileUrl = data.publicUrl; }
    await supabase.from("events").insert([{ title: formData.title, activity_type: formData.activity_type, start_time: formData.start_time, end_time: formData.end_time, location: formData.location, description: formData.description, proker_id: formData.proker_id, participants: selectedParticipants.join(", ") || "Semua", logistics: formData.logistics || "-", file_url: fileUrl }]);
    setLoading(false); setModalType('none'); fetchData();
  };

  const handleDelete = async () => { if(confirm("Hapus?")) { await supabase.from("events").delete().eq("id", selectedEvent.id); setModalType('none'); fetchData(); }};

  if (view === 'focus') {
    const current = events.find(ev => isWithinInterval(realtime, { start: parseISO(ev.start_time), end: parseISO(ev.end_time) }));
    const color = current ? PILLARS.find(p => p.id === current.prokers.department_id)?.color : '#333';
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative text-center">
        <button onClick={() => setView('calendar')} className="absolute top-4 right-4 bg-gray-800 px-4 py-2 rounded-full text-sm font-bold z-20">Exit</button>
        <h1 className="text-5xl md:text-7xl font-mono font-bold mb-4 md:mb-8">{format(realtime, "HH:mm:ss")}</h1>
        {current ? (
          <div className="w-full max-w-2xl bg-gray-900 rounded-3xl p-6 md:p-10 border-l-[10px] md:border-l-[20px] shadow-2xl relative" style={{ borderColor: color }}>
             {current.prokers.logo_url && <img src={current.prokers.logo_url} className="absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24 opacity-20 object-contain"/>}
             <span className="px-3 py-1 rounded bg-white text-black text-xs md:text-sm font-bold mb-4 inline-block">NOW PLAYING</span>
             <h2 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight">{current.title}</h2>
             <p className="text-xl md:text-2xl text-gray-400">{current.location}</p>
          </div>
        ) : <div className="text-gray-600 text-lg md:text-2xl border-2 border-dashed border-gray-800 p-8 md:p-12 rounded-3xl">Tidak ada kegiatan.</div>}
      </div>
    );
  }

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      
      {/* HEADER RESPONSIVE */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo & Judul */}
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold flex items-center gap-2">
                  KALENDER PROKER HMPSTI
                  {session && (
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded-full hidden md:inline-block ${isSuperAdmin ? 'bg-black' : 'bg-blue-600'}`}>
                         {isSuperAdmin ? "SUPER ADMIN" : `ADMIN ${PILLARS.find(p => p.id === myDeptId)?.name || ''}`}
                      </span>
                  )}
              </h1>
              <p className="text-xs text-gray-500 font-medium">{format(currentDate, "MMMM yyyy", { locale: id })}</p>
            </div>
            
            {/* Navigasi Bulan (Mobile Friendly) */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
               <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-md transition"><ChevronLeft size={18}/></button>
               <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-md transition"><ChevronRight size={18}/></button>
            </div>

            {/* Menu Admin (Desktop) */}
            <div className="hidden md:flex gap-2">
              {session ? (
                <>
                  <button onClick={() => setView('focus')} className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-bold hover:bg-purple-200"><Zap size={18}/></button>
                  <button onClick={() => setModalType('add_proker')} className="bg-white border text-black px-3 py-2 rounded-lg font-bold hover:bg-gray-50 flex gap-2 text-sm items-center"><FolderPlus size={16}/> Kelola Proker</button>
                  <button onClick={handleLogout} className="bg-red-50 text-red-600 px-3 rounded-lg"><LogOut size={18}/></button>
                </>
              ) : <button onClick={() => setModalType('login')} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">Login</button>}
            </div>
        </div>
      </header>

      {/* KALENDER RESPONSIVE */}
      <main className="max-w-7xl mx-auto p-2 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Hari */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
              <div key={d} className="py-2 md:py-3 text-center text-xs md:text-sm font-bold text-gray-400">{d}</div>
            ))}
          </div>
          
          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 auto-rows-[80px] md:auto-rows-[140px]">
            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => <div key={`e-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30"></div>)}
            {days.map(day => {
              const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), day));
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toString()} onClick={() => { 
                    if(!session) return alert("Login Admin Dulu!");
                    const toLocal = (d: Date) => new Date(d.getTime()-(d.getTimezoneOffset()*60000)).toISOString().slice(0,16);
                    setFormData({...formData, start_time: toLocal(new Date(day.setHours(9,0))), end_time: toLocal(new Date(day.setHours(11,0)))});
                    setModalType('add_event');
                }} className={`border-b border-r border-gray-100 p-1 md:p-2 transition relative group ${isToday ? 'bg-blue-50/50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                  
                  <span className={`text-[10px] md:text-sm font-bold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-black text-white' : 'text-gray-500'}`}>{format(day, 'd')}</span>
                  
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[50px] md:max-h-[90px] no-scrollbar">
                    {dayEvents.map(ev => {
                        const color = PILLARS.find(p => p.id === ev.prokers.department_id)?.color;
                        return (
                            <div key={ev.id} onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setModalType('detail'); setActiveTab('info'); }} className="px-1 md:px-2 py-0.5 md:py-1.5 rounded border-l-[3px] md:border-l-4 bg-white shadow-sm flex items-center gap-1" style={{ borderLeftColor: color }}>
                                <div className="overflow-hidden w-full">
                                    <p className="text-[8px] md:text-[10px] font-bold text-gray-800 truncate leading-tight">{ev.title}</p>
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
      </main>

      {/* FLOATING ACTION BUTTON (Mobile Only) */}
      {session && (
        <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-2 z-30">
            <button onClick={() => setView('focus')} className="bg-purple-600 text-white p-3 rounded-full shadow-lg"><Zap size={20}/></button>
            <button onClick={() => setModalType('add_proker')} className="bg-white text-black border border-gray-300 p-3 rounded-full shadow-lg"><FolderPlus size={20}/></button>
            <button onClick={handleLogout} className="bg-red-500 text-white p-3 rounded-full shadow-lg"><LogOut size={20}/></button>
        </div>
      )}
      {!session && (
        <div className="md:hidden fixed bottom-4 right-4 z-30">
           <button onClick={() => setModalType('login')} className="bg-black text-white px-5 py-3 rounded-full font-bold shadow-xl">Login Admin</button>
        </div>
      )}

      {/* --- MODAL DETAIL (RESPONSIVE) --- */}
      {modalType === 'detail' && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-4 md:p-5 flex justify-between items-start text-white relative" style={{ backgroundColor: PILLARS.find(p => p.id === selectedEvent.prokers.department_id)?.color }}>
                 <div className="relative z-10">
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold backdrop-blur">{selectedEvent.prokers.name}</span>
                    <h2 className="text-lg md:text-xl font-bold mt-1 md:mt-2 line-clamp-2">{selectedEvent.title}</h2>
                 </div>
                 <button onClick={() => setModalType('none')} className="relative z-10 bg-white/10 p-1 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex border-b border-gray-200 overflow-x-auto">
                 {['info', 'tim', 'logistik', 'file'].map(t => (<button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase whitespace-nowrap ${activeTab === t ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>{t}</button>))}
              </div>
              <div className="p-4 md:p-6 overflow-y-auto flex-1">
                 {activeTab === 'info' && <div className="space-y-3"><p className="font-bold text-gray-400 text-xs">WAKTU & TEMPAT</p><p className="text-sm md:text-base">{format(parseISO(selectedEvent.start_time), "eeee, dd MMMM HH.mm", {locale:id})}</p><p className="font-bold text-sm md:text-base">{selectedEvent.location}</p><div className="bg-gray-50 p-3 rounded text-sm mt-2">"{selectedEvent.description || "-"}"</div></div>}
                 {activeTab === 'tim' && <div className="text-center py-4"><Users className="mx-auto text-blue-500 mb-2"/><p className="bg-blue-50 p-3 rounded text-sm text-blue-900">{selectedEvent.participants}</p></div>}
                 {activeTab === 'logistik' && <div className="text-center py-4"><Briefcase className="mx-auto text-orange-500 mb-2"/><p className="bg-orange-50 p-3 rounded text-sm text-orange-900">{selectedEvent.logistics}</p></div>}
                 {activeTab === 'file' && <div className="text-center py-4"><FileText className="mx-auto text-gray-500 mb-2"/><p>{selectedEvent.file_url ? <a href={selectedEvent.file_url} target="_blank" className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold">Download File</a> : "Kosong"}</p></div>}
              </div>
              <div className="p-3 md:p-4 border-t flex flex-col gap-2 bg-gray-50">
                 <div className="flex gap-2">
                    <button onClick={() => copyManual(selectedEvent)} className="px-3 border bg-white rounded-xl text-gray-500"><Copy size={18}/></button>
                    <button onClick={() => handleAiCopy(selectedEvent)} disabled={isAiLoading} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 text-sm shadow-md">
                        {isAiLoading ? <span className="animate-spin">⏳</span> : <Sparkles size={16}/>} {isAiLoading ? "..." : "Jarkom AI"}
                    </button>
                 </div>
                 {(isSuperAdmin || selectedEvent.prokers.department_id === myDeptId) && <button onClick={handleDelete} className="w-full text-red-600 text-xs font-bold py-2 hover:bg-red-50 rounded">Hapus Kegiatan</button>}
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL ADD PROKER (RESPONSIVE) --- */}
      {modalType === 'add_proker' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white p-5 rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg flex gap-2"><FolderPlus size={20}/> Proker Baru</h2><button onClick={()=>setModalType('none')}><X size={20}/></button></div>
              <form onSubmit={handleSaveProker} className="space-y-3">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pemilik</label>
                    <div className="flex flex-wrap gap-1.5">
                       {PILLARS.map(p => {
                          const disabled = !isSuperAdmin && myDeptId !== p.id;
                          return <button key={p.id} type="button" onClick={()=>!disabled && setProkerData({...prokerData, department_id: p.id})} disabled={disabled} className={`px-2 py-1 text-[10px] rounded border ${prokerData.department_id===p.id ? 'bg-black text-white' : 'bg-white text-gray-500'} ${disabled ? 'opacity-30':''}`}>{p.name}</button>
                       })}
                    </div>
                 </div>
                 <input required className="w-full border p-2 rounded text-sm" placeholder="Nama Proker" value={prokerData.name} onChange={e=>setProkerData({...prokerData, name:e.target.value})}/>
                 <input type="file" className="text-xs w-full" onChange={e=>setProkerLogo(e.target.files ? e.target.files[0] : null)}/>
                 <button disabled={loading} className="w-full bg-black text-white py-2.5 rounded-xl font-bold text-sm">{loading?'...':'Buat'}</button>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL ADD EVENT (RESPONSIVE) --- */}
      {modalType === 'add_event' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b flex justify-between items-center"><h2 className="font-bold text-lg">Input Kegiatan</h2><button onClick={()=>setModalType('none')}><X size={20}/></button></div>
              <form onSubmit={handleSaveEvent} className="p-4 md:p-6 overflow-y-auto space-y-3">
                 <select required className="w-full p-2 rounded border bg-yellow-50 text-sm font-bold" value={formData.proker_id} onChange={e=>setFormData({...formData, proker_id: e.target.value})}>
                      <option value="">-- Pilih Proker --</option>
                      {availableProkers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <input required className="w-full border p-2 rounded text-sm" placeholder="Nama Kegiatan" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}/>
                 <select className="w-full border p-2 rounded text-sm" value={formData.activity_type} onChange={e=>setFormData({...formData, activity_type:e.target.value})}>{ACTIVITY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                 
                 <div className="bg-blue-50 p-2 rounded border border-blue-100"><label className="text-[10px] font-bold text-blue-800 uppercase mb-1 block">Peserta</label><div className="grid grid-cols-2 gap-1">{DIVISIONS_OPT.map(div => (<label key={div} className="flex gap-1.5 text-[10px] items-center cursor-pointer p-0.5"><input type="checkbox" checked={selectedParticipants.includes(div)} onChange={() => {if (selectedParticipants.includes(div)) setSelectedParticipants(selectedParticipants.filter(x => x !== div)); else setSelectedParticipants([...selectedParticipants, div]);}} className="rounded text-blue-600 w-3 h-3"/>{div}</label>))}</div></div>

                 <div className="grid grid-cols-2 gap-2">
                    <input type="datetime-local" className="w-full border p-2 rounded text-xs" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}/>
                    <input type="datetime-local" className="w-full border p-2 rounded text-xs" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}/>
                 </div>
                 <input required className="w-full border p-2 rounded text-sm" placeholder="Lokasi" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}/>
                 <input className="w-full border p-2 rounded text-sm" placeholder="Logistik" value={formData.logistics} onChange={e => setFormData({...formData, logistics: e.target.value})}/>
                 <input type="file" className="text-xs w-full" onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}/>
                 
                 <button disabled={loading || availableProkers.length === 0} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">Simpan</button>
              </form>
           </div>
        </div>
      )}

      {modalType === 'login' && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-xl w-full max-w-sm"><h2 className="font-bold text-xl mb-4 text-center">Login Admin</h2><form onSubmit={handleLogin} className="space-y-3"><input className="border w-full p-3 rounded-lg text-sm" type="email" placeholder="Email" onChange={e=>setLoginData({...loginData, email:e.target.value})}/><input className="border w-full p-3 rounded-lg text-sm" type="password" placeholder="Pass" onChange={e=>setLoginData({...loginData, password:e.target.value})}/><button className="bg-blue-600 text-white w-full py-3 rounded-lg font-bold text-sm">Masuk Dashboard</button><button type="button" onClick={()=>setModalType('none')} className="w-full text-gray-500 text-xs mt-2 text-center block">Batal</button></form></div></div>}
    </div>
  );
}