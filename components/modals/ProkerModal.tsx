import { useState, useEffect } from "react";
import { X, FolderPlus, Trash2, Edit3, ArrowLeft, Save, Search, Briefcase } from "lucide-react";
import { PILLARS } from "../../lib/constants"; 
import { EventService } from "../../services/EventService";
import { UserProfile, Proker } from "../../lib/types";

interface ProkerModalProps {
    onClose: () => void;
    onSuccess: () => void;
    userProfile: UserProfile | null;
    isSuperAdmin: boolean;
}

export default function ProkerModal({ onClose, onSuccess, userProfile, isSuperAdmin }: ProkerModalProps) {
    const [loading, setLoading] = useState(false);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [editMode, setEditMode] = useState<Proker | null>(null);
    const [name, setName] = useState("");
    const [deptId, setDeptId] = useState(0);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const myDeptId = userProfile?.department_id;

    useEffect(() => {
        loadProkers();
        if (!isSuperAdmin && myDeptId) setDeptId(myDeptId);
    }, [isSuperAdmin, myDeptId]);

    const loadProkers = async () => {
        try {
            const data = await EventService.getAllProkers();
            // Filter: Admin Dept hanya bisa mengelola proker milik mereka
            if (!isSuperAdmin && myDeptId) {
                setProkers(data.filter(p => p.department_id === myDeptId));
            } else {
                setProkers(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deptId) return alert("Pilih Departemen!");
        
        setLoading(true);
        try {
            let logoUrl = editMode?.logo_url || "";
            if (logoFile) {
                logoUrl = await EventService.uploadFile('materials', logoFile, 'logo');
            }
            
            const payload = { name, department_id: Number(deptId), logo_url: logoUrl };

            if (editMode) {
                await EventService.updateProker(editMode.id, payload);
            } else {
                await EventService.createProker(payload);
            }
            
            // Reset Form
            setEditMode(null); setName(""); setLogoFile(null);
            if (isSuperAdmin) setDeptId(0);
            
            await loadProkers();
            onSuccess(); // Refresh kalender di background
        } catch (err: any) {
            alert("Gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Peringatan! Menghapus Proker akan menghapus SEMUA jadwal kegiatan di dalamnya. Lanjutkan?")) return;
        try {
            await EventService.deleteProker(id);
            loadProkers();
            onSuccess();
        } catch (err) { alert("Gagal menghapus proker."); }
    };

    const startEdit = (p: Proker) => {
        setEditMode(p);
        setName(p.name);
        setDeptId(p.department_id);
    };

    const filteredProkers = prokers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[32px] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                  <h2 className="font-bold text-2xl flex gap-3 items-center text-gray-800">
                      <div className="p-2 bg-black rounded-xl text-white"><Briefcase size={22}/></div>
                      Proker Management
                  </h2>
                  <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  
                  {/* KOLOM KIRI: FORM */}
                  <div className={`w-full md:w-[360px] p-8 border-r overflow-y-auto transition-colors duration-300 ${editMode ? 'bg-indigo-50/50' : 'bg-white'}`}>
                      {editMode && (
                          <button onClick={() => {setEditMode(null); setName(""); if(isSuperAdmin) setDeptId(0);}} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 mb-4 uppercase tracking-widest hover:underline">
                              <ArrowLeft size={12}/> Batal Edit / Tambah Baru
                          </button>
                      )}
                      <h3 className="font-bold text-xl mb-6 text-gray-800">
                          {editMode ? 'Edit Program Kerja' : 'Buat Proker Baru'}
                      </h3>
                      
                      <form onSubmit={handleSave} className="space-y-6">
                         <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Departemen Pemilik</label>
                            <div className="flex flex-wrap gap-2">
                               {PILLARS.map(p => {
                                  const disabled = !isSuperAdmin && myDeptId !== p.id;
                                  const isSelected = deptId === p.id;
                                  return (
                                    <button key={p.id} type="button" onClick={() => !disabled && setDeptId(p.id)} disabled={disabled} 
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${isSelected ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'} ${disabled ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}>
                                        {p.name}
                                    </button>
                                  );
                               })}
                            </div>
                         </div>

                         <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nama Program Kerja</label>
                            <input required className="w-full border-2 border-gray-100 p-4 rounded-[20px] text-sm focus:border-black outline-none transition bg-gray-50/30" placeholder="Misal: Open House 2024" value={name} onChange={e => setName(e.target.value)} />
                         </div>

                         <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Logo Proker (Optional)</label>
                            <input type="file" className="text-xs w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:font-bold hover:file:bg-gray-200 transition" onChange={e => setLogoFile(e.target.files ? e.target.files[0] : null)} />
                         </div>

                         <button disabled={loading || deptId === 0} className={`w-full py-4 rounded-[20px] font-bold text-sm shadow-xl transition active:scale-95 flex justify-center items-center gap-2 ${editMode ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-black text-white shadow-gray-200'}`}>
                            {loading ? 'Processing...' : editMode ? <><Save size={18}/> Simpan Perubahan</> : <><FolderPlus size={18}/> Buat Proker</>}
                         </button>
                      </form>
                  </div>

                  {/* KOLOM KANAN: LIST */}
                  <div className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h3 className="font-bold text-xl text-gray-800">Daftar Proker <span className="text-gray-300 ml-2 font-medium">{prokers.length}</span></h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                            <input type="text" placeholder="Cari proker..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-full text-sm outline-none focus:ring-4 focus:ring-black/5 transition shadow-sm" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {filteredProkers.map(p => {
                              const dept = PILLARS.find(pil => pil.id === p.department_id);
                              const isEditing = editMode?.id === p.id;
                              return (
                                  <div key={p.id} className={`bg-white p-5 rounded-[28px] shadow-sm border transition-all group ${isEditing ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-50 hover:shadow-md hover:border-gray-200'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform">
                                              {p.logo_url ? <img src={p.logo_url} className="w-10 h-10 object-contain" /> : <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept?.color }}></div>}
                                          </div>
                                          <div className="flex-1 overflow-hidden text-left">
                                              <h4 className="font-bold text-gray-800 text-sm truncate">{p.name}</h4>
                                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block mt-1" style={{ backgroundColor: (dept?.color || '#ddd') + '20', color: dept?.color }}>
                                                  {dept?.name}
                                              </span>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => startEdit(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Edit"><Edit3 size={18}/></button>
                                              <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition" title="Delete"><Trash2 size={18}/></button>
                                          </div>
                                      </div>
                                  </div>
                              )
                          })}
                          {filteredProkers.length === 0 && (
                              <div className="col-span-full py-12 text-center text-gray-300 italic text-sm">
                                  Tidak ada program kerja ditemukan.
                              </div>
                          )}
                      </div>
                  </div>
              </div>
           </div>
        </div>
    );
}