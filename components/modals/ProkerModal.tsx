import { useState, useEffect } from "react";
import { X, FolderPlus, ShieldCheck } from "lucide-react";
import { PILLARS } from "../../lib/constants"; 
import { EventService } from "../../services/EventService";
import { UserProfile } from "../../lib/types";

interface ProkerModalProps {
    onClose: () => void;
    onSuccess: () => void;
    userProfile: UserProfile | null;
    isSuperAdmin: boolean;
}

export default function ProkerModal({ onClose, onSuccess, userProfile, isSuperAdmin }: ProkerModalProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [deptId, setDeptId] = useState(0);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const myDeptId = userProfile?.department_id;

    // --- LOGIC OTOMATIS ---
    // Sesuai SQL kamu: Kalau bukan 'super_admin', kunci ke dept_id dia sendiri
    useEffect(() => {
        if (!isSuperAdmin && myDeptId) {
            setDeptId(myDeptId);
        }
    }, [isSuperAdmin, myDeptId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!deptId) return alert("Pilih Departemen pemilik proker ini!");
        
        setLoading(true);
        try {
            let logoUrl = "";
            if (logoFile) {
                logoUrl = await EventService.uploadFile('materials', logoFile, 'logo');
            }
            
            await EventService.createProker({
                name: name,
                department_id: Number(deptId), // SQL butuh Integer
                logo_url: logoUrl
            });
            
            onSuccess();
        } catch (err: any) {
            alert("Gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-lg flex gap-2 items-center text-gray-800">
                      <FolderPlus size={24} className="text-black"/> 
                      Proker Baru
                  </h2>
                  <button onClick={onClose} className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-5">
                 
                 {/* PILIHAN DEPARTEMEN */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pemilik Proker</label>
                        {isSuperAdmin && (
                            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck size={10}/> Mode Super Admin
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {PILLARS.map(p => {
                          // LOGIKA SESUAI SQL KAMU:
                          // Jika Super Admin -> Tidak Disabled (False)
                          // Jika Dept Admin -> Disabled (True), KECUALI tombol itu milik dept dia
                          const disabled = !isSuperAdmin && myDeptId !== p.id;
                          const isSelected = deptId === p.id;

                          return (
                            <button 
                                key={p.id} 
                                type="button" 
                                onClick={() => !disabled && setDeptId(p.id)} 
                                disabled={disabled} 
                                className={`
                                    px-3 py-1.5 text-[10px] md:text-xs rounded-lg font-bold border transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-black text-white border-black shadow-md scale-105' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                    } 
                                    ${disabled 
                                        ? 'opacity-30 cursor-not-allowed bg-gray-50 grayscale'
                                        : 'cursor-pointer'
                                    }
                                `}
                            >
                                {p.name}
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 {/* NAMA PROKER */}
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Program Kerja</label>
                    <input required className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition" 
                        placeholder="Contoh: Open House 2024" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                    />
                 </div>

                 {/* LOGO */}
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Logo (Opsional)</label>
                    <input type="file" className="text-xs w-full" 
                        onChange={e => setLogoFile(e.target.files ? e.target.files[0] : null)}
                    />
                 </div>

                 <button 
                    disabled={loading || deptId === 0} 
                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg active:scale-95 disabled:opacity-50"
                 >
                    {loading ? 'Menyimpan...' : 'Simpan Proker'}
                 </button>
              </form>
           </div>
        </div>
    );
}