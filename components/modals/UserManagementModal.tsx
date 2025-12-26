import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, ShieldCheck, Users, Lock, KeyRound, ArrowLeft } from "lucide-react";
import { PILLARS } from "../../lib/constants";
import { UserProfile } from "../../lib/types";

interface UserManagementModalProps {
    onClose: () => void;
}

export default function UserManagementModal({ onClose }: UserManagementModalProps) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form State (Add User)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("dept_admin");
    const [deptId, setDeptId] = useState(1);

    // Form State (Reset Password)
    const [editMode, setEditMode] = useState<{id: string, email: string} | null>(null);
    const [newPass, setNewPass] = useState("");

    // --- FETCH DATA ---
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error("Gagal ambil data");
            const data = await res.json();
            if(Array.isArray(data)) setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- CREATE USER ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Buat user baru?")) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ email, password, role, department_id: deptId }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            alert("User Berhasil Dibuat!");
            setEmail(""); setPassword(""); 
            fetchUsers(); 
        } catch (err: any) {
            alert("Gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- RESET PASSWORD ---
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editMode) return;
        if (!confirm(`Yakin ubah password untuk ${editMode.email}?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                body: JSON.stringify({ id: editMode.id, newPassword: newPass }),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            alert("Password Berhasil Diubah!");
            setEditMode(null);
            setNewPass("");
        } catch (err: any) {
            alert("Gagal: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE USER ---
    const handleDelete = async (id: string) => {
        if (!confirm("Yakin hapus user ini?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Gagal menghapus");
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                  <h2 className="font-bold text-xl flex gap-2 items-center text-gray-800">
                      <Users className="text-blue-600"/> Manajemen User (Super Admin)
                  </h2>
                  <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X/></button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  
                  {/* KOLOM KIRI: FORM DINAMIS */}
                  <div className={`w-full md:w-1/3 p-5 border-r overflow-y-auto transition-colors duration-300 ${editMode ? 'bg-orange-50' : 'bg-gray-50'}`}>
                      
                      {editMode ? (
                          // --- MODE RESET PASSWORD ---
                          <div className="animate-in slide-in-from-left duration-300">
                              <button onClick={() => setEditMode(null)} className="text-xs flex items-center gap-1 text-gray-500 mb-4 hover:text-black">
                                  <ArrowLeft size={12}/> Kembali ke Tambah User
                              </button>
                              <h3 className="font-bold mb-4 flex gap-2 items-center text-orange-700">
                                  <KeyRound size={18}/> Reset Password
                              </h3>
                              <p className="text-xs text-gray-600 mb-4 bg-white p-2 rounded border border-orange-200">
                                  Mengubah password untuk akun: <br/><strong>{editMode.email}</strong>
                              </p>
                              <form onSubmit={handleResetPassword} className="space-y-4">
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Password Baru</label>
                                    <input required type="text" placeholder="Min. 6 karakter" className="w-full border border-orange-300 p-2 rounded-lg text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none" 
                                        value={newPass} onChange={e=>setNewPass(e.target.value)} />
                                  </div>
                                  <button disabled={loading} className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 transition shadow-md disabled:opacity-50">
                                      {loading ? "Menyimpan..." : "Simpan Password Baru"}
                                  </button>
                              </form>
                          </div>
                      ) : (
                          // --- MODE TAMBAH USER ---
                          <div className="animate-in fade-in duration-300">
                              <h3 className="font-bold mb-4 flex gap-2 items-center text-gray-700"><UserPlus size={18}/> Tambah Admin</h3>
                              <form onSubmit={handleCreate} className="space-y-4">
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input required type="email" placeholder="contoh@hmpsti.com" className="w-full border p-2 rounded-lg text-sm mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                    <input required type="text" placeholder="Min. 6 karakter" className="w-full border p-2 rounded-lg text-sm mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Jabatan</label>
                                    <select className="w-full border p-2 rounded-lg text-sm mt-1" value={role} onChange={e=>setRole(e.target.value)}>
                                        <option value="dept_admin">Admin Departemen</option>
                                        <option value="super_admin">Super Admin (Ketua)</option>
                                    </select>
                                  </div>

                                  {role === 'dept_admin' && (
                                      <div className="space-y-1">
                                          <label className="text-xs font-bold text-gray-500 uppercase">Pilih Departemen</label>
                                          <div className="grid grid-cols-2 gap-2">
                                              {PILLARS.map(p => (
                                                  <button type="button" key={p.id} onClick={()=>setDeptId(p.id)} 
                                                    className={`text-[10px] p-2 rounded border transition-all ${deptId === p.id ? 'bg-black text-white border-black' : 'bg-white hover:border-gray-400'}`}>
                                                    {p.name}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                                      {loading ? "Memproses..." : "Buat User Baru"}
                                  </button>
                              </form>
                          </div>
                      )}
                  </div>

                  {/* KOLOM KANAN: LIST USER */}
                  <div className="w-full md:w-2/3 p-5 overflow-y-auto bg-white">
                      <h3 className="font-bold mb-4 text-gray-700">Daftar Pengguna ({users.length})</h3>
                      <div className="space-y-2">
                          {users.map(u => {
                              const deptName = PILLARS.find(p => p.id === u.department_id)?.name;
                              const isSuperAdminTarget = u.role === 'super_admin';
                              const isEditing = editMode?.id === u.id;

                              return (
                                  <div key={u.id} className={`flex justify-between items-center p-3 border rounded-xl transition ${isEditing ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                                      <div>
                                          <p className="font-bold text-sm text-gray-800">{u.email}</p>
                                          <div className="flex gap-2 mt-1">
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${isSuperAdminTarget ?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-600'}`}>
                                                  {isSuperAdminTarget ? <ShieldCheck size={10}/> : null}
                                                  {isSuperAdminTarget ? 'Super Admin' : 'Admin'}
                                              </span>
                                              {u.department_id && (
                                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                                                      {deptName}
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                      
                                      <div className="flex gap-2">
                                          {/* TOMBOL RESET PASSWORD */}
                                          <button 
                                            onClick={() => setEditMode({ id: u.id, email: u.email })}
                                            className="text-orange-400 hover:bg-orange-100 hover:text-orange-600 p-2 rounded-lg transition" 
                                            title="Ganti Password User Ini"
                                          >
                                              <KeyRound size={18}/>
                                          </button>

                                          {/* TOMBOL HAPUS */}
                                          {isSuperAdminTarget ? (
                                              <div className="p-2 text-gray-300 cursor-not-allowed" title="Protected Account">
                                                  <Lock size={18} />
                                              </div>
                                          ) : (
                                              <button onClick={()=>handleDelete(u.id)} className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition" title="Hapus User">
                                                  <Trash2 size={18}/>
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
           </div>
        </div>
    );
}