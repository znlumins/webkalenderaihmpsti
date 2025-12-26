import { useState } from "react";
import { X, Users, Briefcase, FileText, Copy, Sparkles, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { EventData, UserProfile } from "../../lib/types"; // Perhatikan path relative
import { PILLARS } from "../../lib/constants";
import { EventService } from "../../services/EventService";

interface DetailModalProps {
    event: EventData;
    onClose: () => void;
    onDeleteSuccess: () => void;
    userProfile: UserProfile | null;
}

export default function DetailModal({ event, onClose, onDeleteSuccess, userProfile }: DetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'tim' | 'logistik' | 'file'>('info');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // Safety Check: Data Proker (cegah crash jika null)
    const prokerName = event.prokers?.name || "Kegiatan Umum";
    const deptId = event.prokers?.department_id;
    const pillarColor = PILLARS.find(p => p.id === deptId)?.color || '#333';

    // Permission Check
    const isSuperAdmin = userProfile?.role === 'super_admin';
    const myDeptId = userProfile?.department_id;
    const canEdit = isSuperAdmin || (deptId !== undefined && deptId === myDeptId);

    const handleDelete = async () => {
        if(confirm(`Yakin ingin menghapus kegiatan "${event.title}"?`)) {
            try {
                await EventService.deleteEvent(event.id);
                onDeleteSuccess();
            } catch (error) {
                alert("Gagal menghapus. Cek koneksi internet.");
            }
        }
    };

    const copyManual = () => {
        const text = `📢 *INFO KEGIATAN*\nProker: ${prokerName}\n📅 ${format(parseISO(event.start_time), "eeee, dd MMMM", { locale: id })}\n⏰ ${format(parseISO(event.start_time), "HH.mm")} - ${format(parseISO(event.end_time), "HH.mm")}\n📍 ${event.location}\n📝 ${event.title}\n🔗 ${event.file_url || "-"}`;
        navigator.clipboard.writeText(text); 
        alert("Teks berhasil disalin!");
    };

    const handleAiCopy = async () => {
        setIsAiLoading(true);
        try {
            const deptName = PILLARS.find(p => p.id === deptId)?.name || "HMPSTI";
            const body = {
                title: event.title, 
                date: format(parseISO(event.start_time), "eeee, dd MMMM yyyy", { locale: id }),
                time: `${format(parseISO(event.start_time), "HH.mm")} - ${format(parseISO(event.end_time), "HH.mm")} WIB`,
                location: event.location, 
                description: event.description || "-", 
                type: event.activity_type,
                proker: prokerName, 
                dept: deptName, 
                logistics: event.logistics
            };
            
            const response = await fetch('/api/generate-jarkoman', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(body) 
            });
            
            const data = await response.json();
            if (data.jarkoman) {
                let finalText = data.jarkoman; 
                if (event.file_url) finalText += `\n\n📂 *Link Materi/File:*\n${event.file_url}`;
                navigator.clipboard.writeText(finalText); 
                alert("✨ Jarkoman AI Disalin ke Clipboard!");
            } else {
                alert("AI Error: Gagal generate teks.");
            }
        } catch (err) { 
            console.error(err);
            alert("Gagal koneksi ke API AI."); 
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-4 md:p-5 flex justify-between items-start text-white relative" style={{ backgroundColor: pillarColor }}>
                 <div className="relative z-10">
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold backdrop-blur">
                        {prokerName}
                    </span>
                    <h2 className="text-lg md:text-xl font-bold mt-1 md:mt-2 line-clamp-2">{event.title}</h2>
                 </div>
                 <button onClick={onClose} className="relative z-10 bg-white/10 p-1 rounded-full hover:bg-white/20 transition"><X size={20}/></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 overflow-x-auto">
                 {['info', 'tim', 'logistik', 'file'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} 
                        className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase whitespace-nowrap transition-colors ${activeTab === t ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>
                        {t}
                    </button>
                 ))}
              </div>

              {/* Konten */}
              <div className="p-4 md:p-6 overflow-y-auto flex-1">
                 {activeTab === 'info' && (
                    <div className="space-y-3">
                        <p className="font-bold text-gray-400 text-xs">WAKTU & TEMPAT</p>
                        <p className="text-sm md:text-base">{format(parseISO(event.start_time), "eeee, dd MMMM yyyy • HH.mm", {locale:id})} WIB</p>
                        <p className="font-bold text-sm md:text-base">{event.location}</p>
                        <div className="bg-gray-50 p-3 rounded text-sm mt-2 border border-gray-100 italic">"{event.description || "-"}"</div>
                    </div>
                 )}
                 {activeTab === 'tim' && (
                    <div className="text-center py-4">
                        <Users className="mx-auto text-blue-500 mb-2" size={32}/>
                        <p className="font-bold text-gray-500 text-xs mb-2">PARTISIPAN</p>
                        <p className="bg-blue-50 p-3 rounded text-sm text-blue-900 inline-block px-4">{event.participants}</p>
                    </div>
                 )}
                 {activeTab === 'logistik' && (
                    <div className="text-center py-4">
                        <Briefcase className="mx-auto text-orange-500 mb-2" size={32}/>
                        <p className="font-bold text-gray-500 text-xs mb-2">KEBUTUHAN LOGISTIK</p>
                        <p className="bg-orange-50 p-3 rounded text-sm text-orange-900 px-4">{event.logistics || "-"}</p>
                    </div>
                 )}
                 {activeTab === 'file' && (
                    <div className="text-center py-4">
                        <FileText className="mx-auto text-gray-500 mb-2" size={32}/>
                        <p className="font-bold text-gray-500 text-xs mb-2">DOKUMEN / MATERI</p>
                        <p>{event.file_url ? <a href={event.file_url} target="_blank" className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition">Download File</a> : "Tidak ada file dilampirkan"}</p>
                    </div>
                 )}
              </div>

              {/* Footer Actions */}
              <div className="p-3 md:p-4 border-t flex flex-col gap-2 bg-gray-50">
                 <div className="flex gap-2">
                    <button onClick={copyManual} className="px-3 border bg-white rounded-xl text-gray-500 hover:bg-gray-100 transition" title="Copy Manual">
                        <Copy size={18}/>
                    </button>
                    
                    <button onClick={handleAiCopy} disabled={isAiLoading} 
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 text-sm shadow-md hover:opacity-90 transition disabled:opacity-70">
                        {isAiLoading ? <span className="animate-spin">⏳</span> : <Sparkles size={16}/>} 
                        {isAiLoading ? "Sedang Membuat..." : "Buat Jarkoman AI"}
                    </button>
                 </div>
                 
                 {canEdit && (
                    <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 text-red-600 text-xs font-bold py-2 hover:bg-red-50 rounded transition">
                        <Trash2 size={14}/> Hapus Kegiatan
                    </button>
                 )}
              </div>
           </div>
        </div>
    );
}