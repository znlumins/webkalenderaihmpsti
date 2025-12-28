"use client";
import { useState } from "react";
import { X, Users, Briefcase, FileText, Copy, Sparkles, Trash2, Edit3, Clock, MapPin, ExternalLink, UserCheck, Tag, Info } from "lucide-react";
import { formatToWIB } from "../../lib/dateHelper";
import { PILLARS } from "../../lib/constants";
import { EventService } from "../../services/EventService";

export default function DetailModal({ event, onClose, onDeleteSuccess, onEdit, userProfile }: any) {
    const [activeTab, setActiveTab] = useState<'info' | 'tim' | 'logistik' | 'file'>('info');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const deptInfo = PILLARS.find((p:any) => p.id === event.prokers?.department_id);
    const canEdit = userProfile?.role === 'super_admin' || event.prokers?.department_id === userProfile?.department_id;

    const handleAiCopy = async () => {
        setIsAiLoading(true);
        try {
            const response = await fetch('/api/generate-jarkoman', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                    title: event.title,
                    proker: event.prokers?.name,
                    dept: deptInfo?.name || "HMPSTI",
                    type: event.activity_type,
                    date: formatToWIB(event.start_time, "eeee, dd MMMM yyyy"),
                    time: `${formatToWIB(event.start_time, "HH.mm")} WIB`,
                    location: event.location,
                    pic: event.pic,
                    status: event.status,
                    link_meeting: event.link_meeting,
                    description: event.description,
                    logistics: event.logistics
                }) 
            });
            const data = await response.json();
            if (data.jarkoman) {
                navigator.clipboard.writeText(data.jarkoman); 
                alert("✨ Jarkoman AI Disalin!");
            }
        } catch (err) { alert("Gagal."); } finally { setIsAiLoading(false); }
    };

    const handleDelete = async () => {
        if(confirm("Hapus jadwal ini?")) {
            await EventService.deleteEvent(event.id);
            onDeleteSuccess();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4 backdrop-blur-md transition-all cursor-pointer" onClick={onClose}>
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
              
              <button onClick={onClose} className="absolute top-6 right-6 z-[160] bg-white/20 p-2 rounded-full hover:bg-white/40 transition-all border border-white/10 text-white shadow-xl">
                 <X size={24} strokeWidth={3} />
              </button>

              {/* HEADER */}
              <div className="p-8 pb-10 text-white relative shrink-0" style={{ backgroundColor: deptInfo?.color || '#333' }}>
                 <div className="relative z-10">
                    <div className="flex gap-2 mb-3">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{event.prokers?.name}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${event.status === 'Fix' ? 'bg-green-500/30 border-green-400' : 'bg-orange-500/30 border-orange-400'}`}>● {event.status || 'Fix'}</span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight drop-shadow-md">{event.title}</h2>
                    <p className="text-[10px] font-bold text-white/70 uppercase mt-2 tracking-widest flex items-center gap-1"><Tag size={10}/> {event.activity_type}</p>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50"></div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                 {['info', 'tim', 'logistik', 'file'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === t ? 'text-black border-b-4 border-black bg-white' : 'text-gray-400 hover:text-gray-600'}`}>{t}</button>
                 ))}
              </div>

              {/* CONTENT AREA */}
              <div className="p-8 overflow-y-auto flex-1 no-scrollbar space-y-6 sidebar-scroll">
                 {activeTab === 'info' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Waktu</p>
                                <p className="font-bold text-sm text-gray-800">{formatToWIB(event.start_time, "eeee, dd MMMM")}</p>
                                <p className="text-xs text-gray-500 font-bold">{formatToWIB(event.start_time, "HH.mm")} WIB</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Lokasi</p>
                                <p className="font-bold text-sm leading-tight text-gray-800">{event.location}</p>
                            </div>
                        </div>

                        {event.link_meeting && (
                            <a href={event.link_meeting} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-indigo-600 rounded-[24px] shadow-lg shadow-indigo-100 group transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3 text-white">
                                    <ExternalLink size={20}/>
                                    <span className="text-sm font-bold tracking-tight">Tautan Meeting Online</span>
                                </div>
                                <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Join</span>
                            </a>
                        )}

                        {event.description && (
                            <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 relative">
                                <Info size={16} className="absolute top-4 right-4 text-gray-200" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deskripsi Agenda</p>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium italic whitespace-pre-wrap">
                                    "{event.description}"
                                </p>
                            </div>
                        )}
                    </div>
                 )}

                 {activeTab === 'tim' && (
                    <div className="animate-in fade-in duration-300 space-y-6 text-center">
                        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-50 shadow-sm">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner"><UserCheck size={32}/></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Penanggung Jawab (PIC)</p>
                            <p className="text-2xl font-black text-indigo-900 tracking-tighter">{event.pic || 'Admin Departemen'}</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                             <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center justify-center gap-2"><Users size={12}/> Peserta / Divisi</p>
                             <p className="text-xs font-bold text-gray-600 leading-relaxed px-4">{event.participants || 'Seluruh Panitia'}</p>
                        </div>
                    </div>
                 )}

                 {activeTab === 'logistik' && (
                    <div className="animate-in fade-in duration-300 p-8 bg-orange-50/50 rounded-[40px] border border-orange-100 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-orange-500"><Briefcase size={32}/></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Logistik & Bawaan</p>
                        <p className="text-sm text-orange-900 font-bold leading-relaxed italic">{event.logistics || 'Menyesuaikan kebutuhan acara.'}</p>
                    </div>
                 )}

                 {activeTab === 'file' && (
                    <div className="animate-in fade-in duration-300 text-center py-12 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6 text-gray-300 shadow-inner"><FileText size={48}/></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-8">Materi & Lampiran Pendukung</p>
                        {event.file_url ? (
                            <a 
                                href={event.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase shadow-2xl shadow-indigo-200 hover:scale-110 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer z-[200]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FileText size={20}/> Download Dokumen
                            </a>
                        ) : <p className="text-xs text-gray-300 italic">Tidak ada lampiran file</p>}
                    </div>
                 )}
              </div>

              {/* FOOTER */}
              <div className="p-8 border-t flex flex-col gap-3 bg-white shrink-0">
                 <div className="flex gap-2">
                    {canEdit && (
                        <button onClick={() => onEdit(event)} className="px-6 bg-white border border-gray-200 rounded-2xl text-indigo-600 font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
                            <Edit3 size={16}/> Edit
                        </button>
                    )}
                    <button onClick={handleAiCopy} disabled={isAiLoading} className="flex-1 bg-black text-white p-4 rounded-2xl font-black flex justify-center items-center gap-2 text-xs uppercase shadow-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95">
                        {isAiLoading ? 'Menulis...' : <><Sparkles size={16} className="text-yellow-400"/> Jarkoman AI</>}
                    </button>
                 </div>
                 {canEdit && <button onClick={handleDelete} className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-red-700 transition-all py-2">Hapus Jadwal</button>}
              </div>
           </div>
        </div>
    );
}