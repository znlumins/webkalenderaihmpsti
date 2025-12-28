"use client";
import { useState, useEffect } from "react";
import { X, Save, Calendar, Clock, MapPin, Tag, Package, User, Link, FileText, Upload } from "lucide-react";
import { ACTIVITY_TYPES, DIVISIONS_OPT } from "../../lib/constants";
import { EventService } from "../../services/EventService";
import { Proker, EventData } from "../../lib/types";
import { parseInputToUTC, formatForInput } from "../../lib/dateHelper";

export default function EventModal({ onClose, onSuccess, prokers, initialDate, userProfile, editData }: any) {
    const [loading, setLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    
    const [formData, setFormData] = useState({
        title: "", activity_type: "Rapat Rutin", 
        start_time: "", end_time: "",
        location: "", 
        description: "", 
        proker_id: "", 
        logistics: "",
        pic: "", link_meeting: "", status: "Fix"
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                title: editData.title, activity_type: editData.activity_type,
                start_time: formatForInput(editData.start_time),
                end_time: formatForInput(editData.end_time),
                location: editData.location, 
                description: editData.description || "",
                proker_id: editData.proker_id, 
                logistics: editData.logistics || "",
                pic: editData.pic || "", 
                link_meeting: editData.link_meeting || "",
                status: editData.status || "Fix"
            });
            setSelectedParticipants(editData.participants ? editData.participants.split(", ") : []);
        } else if (initialDate) {
            setFormData(prev => ({ ...prev, start_time: initialDate.start, end_time: initialDate.end }));
        }
    }, [editData, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let fileUrl = editData?.file_url || "";
            if (uploadFile) {
                fileUrl = await EventService.uploadFile('materials', uploadFile, 'materi');
            }

            const payload = {
                ...formData,
                start_time: parseInputToUTC(formData.start_time).toISOString(),
                end_time: parseInputToUTC(formData.end_time).toISOString(),
                participants: selectedParticipants.join(", ") || "Semua Panitia",
                file_url: fileUrl
            };

            if (editData) await EventService.updateEvent(editData.id, payload);
            else await EventService.createEvent(payload);
            onSuccess();
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    const isSuperAdmin = userProfile?.role === 'super_admin';
    const availableProkers = prokers.filter((p:any) => isSuperAdmin || p.department_id === userProfile?.department_id);

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                  <h2 className="font-black text-2xl flex items-center gap-3"><Calendar size={24}/> {editData ? 'Edit' : 'Tambah'} Jadwal</h2>
                  <button onClick={onClose} className="p-2 bg-white rounded-full border shadow-sm text-gray-400 hover:text-black"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 sidebar-scroll no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Program Kerja</label>
                        <select required className="w-full p-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-bold outline-none focus:border-black transition" value={formData.proker_id} onChange={e=>setFormData({...formData, proker_id: e.target.value})}>
                            <option value="">-- Pilih Proker --</option>
                            {availableProkers.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">PIC (Koordinator)</label>
                        <input required className="w-full p-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-bold outline-none focus:border-black transition" placeholder="Nama Koordinator" value={formData.pic} onChange={e=>setFormData({...formData, pic: e.target.value})}/>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nama Kegiatan</label>
                    <input required className="w-full p-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-bold focus:border-black transition" placeholder="Contoh: Rapat Pleno 1" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}/>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-2">Mulai</label>
                        <input type="datetime-local" required className="w-full p-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-xs font-bold focus:border-black" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-2">Selesai</label>
                        <input type="datetime-local" required className="w-full p-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-xs font-bold focus:border-black" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}/>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Lokasi</label>
                        <input required className="w-full p-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-bold outline-none focus:border-black" placeholder="Gedung/Zoom" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})}/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Status</label>
                        <select className="w-full p-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-bold outline-none focus:border-black" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                            <option value="Fix">FIX</option>
                            <option value="Tentative">TENTATIVE</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Link Meeting (Jika Online)</label>
                    <input className="w-full p-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-bold outline-none focus:border-black" placeholder="https://zoom.us/..." value={formData.link_meeting} onChange={e=>setFormData({...formData, link_meeting: e.target.value})}/>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Deskripsi Agenda</label>
                    <textarea rows={3} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-sm font-medium focus:border-black outline-none transition" placeholder="Tuliskan detail pembahasan..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}/>
                 </div>

                 <div className="space-y-1 bg-gray-50/50 p-6 rounded-[28px] border-2 border-dashed border-gray-100">
                    <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest flex items-center gap-2 mb-2">
                        <Upload size={14}/> Lampiran Materi / File
                    </label>
                    <input 
                        type="file" 
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="text-xs w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition cursor-pointer"
                    />
                 </div>

                 <button disabled={loading} className="w-full bg-black text-white py-5 rounded-3xl font-black text-sm hover:scale-[1.02] transition shadow-xl uppercase tracking-widest">
                    {loading ? 'MENYIMPAN...' : 'Simpan Jadwal'}
                 </button>
              </form>
           </div>
        </div>
    );
}