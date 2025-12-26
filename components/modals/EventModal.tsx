import { useState } from "react";
import { X } from "lucide-react";
import { ACTIVITY_TYPES, DIVISIONS_OPT } from "@/lib/constants";
import { EventService } from "@/services/EventService";
import { Proker } from "@/lib/types";

interface EventModalProps {
    onClose: () => void;
    onSuccess: () => void;
    prokers: Proker[];
    initialDate?: { start: string, end: string };
    userProfile: any;
}

export default function EventModal({ onClose, onSuccess, prokers, initialDate, userProfile }: EventModalProps) {
    const isSuperAdmin = userProfile?.role === 'super_admin';
    const myDeptId = userProfile?.department_id;
    // Filter proker sesuai hak akses
    const availableProkers = prokers.filter(p => isSuperAdmin || p.department_id === myDeptId);

    const [loading, setLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "", activity_type: "Rapat Rutin", 
        start_time: initialDate?.start || "", end_time: initialDate?.end || "",
        location: "", description: "", proker_id: "", logistics: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let fileUrl = "";
            if (uploadFile) {
                fileUrl = await EventService.uploadFile('materials', uploadFile, 'materi');
            }
            await EventService.createEvent({
                ...formData,
                participants: selectedParticipants.join(", ") || "Semua",
                logistics: formData.logistics || "-",
                file_url: fileUrl
            });
            onSuccess();
        } catch (err: any) {
            alert("Gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b flex justify-between items-center"><h2 className="font-bold text-lg">Input Kegiatan</h2><button onClick={onClose}><X size={20}/></button></div>
              <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto space-y-3">
                 <select required className="w-full p-2 rounded border bg-yellow-50 text-sm font-bold" value={formData.proker_id} onChange={e=>setFormData({...formData, proker_id: e.target.value})}>
                      <option value="">-- Pilih Proker --</option>
                      {availableProkers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <input required className="w-full border p-2 rounded text-sm" placeholder="Nama Kegiatan" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}/>
                 <select className="w-full border p-2 rounded text-sm" value={formData.activity_type} onChange={e=>setFormData({...formData, activity_type:e.target.value})}>{ACTIVITY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                 
                 <div className="bg-blue-50 p-2 rounded border border-blue-100"><label className="text-[10px] font-bold text-blue-800 uppercase mb-1 block">Peserta</label><div className="grid grid-cols-2 gap-1">{DIVISIONS_OPT.map(div => (<label key={div} className="flex gap-1.5 text-[10px] items-center cursor-pointer p-0.5"><input type="checkbox" checked={selectedParticipants.includes(div)} onChange={() => {if (selectedParticipants.includes(div)) setSelectedParticipants(selectedParticipants.filter(x => x !== div)); else setSelectedParticipants([...selectedParticipants, div]);}} className="rounded text-blue-600 w-3 h-3"/>{div}</label>))}</div></div>

                 <div className="grid grid-cols-2 gap-2">
                    <input type="datetime-local" required className="w-full border p-2 rounded text-xs" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}/>
                    <input type="datetime-local" required className="w-full border p-2 rounded text-xs" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}/>
                 </div>
                 <input required className="w-full border p-2 rounded text-sm" placeholder="Lokasi" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}/>
                 <input className="w-full border p-2 rounded text-sm" placeholder="Logistik" value={formData.logistics} onChange={e => setFormData({...formData, logistics: e.target.value})}/>
                 <input type="file" className="text-xs w-full" onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}/>
                 
                 <button disabled={loading || availableProkers.length === 0} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                 </button>
              </form>
           </div>
        </div>
    );
}