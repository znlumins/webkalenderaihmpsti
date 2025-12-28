"use client";
import Image from "next/image"; // Import ini untuk optimasi gambar
import { LayoutDashboard, LogOut, ShieldCheck, X, ChevronRight, Plus, Briefcase, Users } from "lucide-react";
import { PILLARS } from "../lib/constants";
import { UserProfile } from "../lib/types";

interface SidebarProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
  onOpenUsers: () => void;
  onAddEvent: () => void;
  onManageProker: () => void;
  isSuperAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  filterDeptId: number | null;
  onFilterChange: (id: number | null) => void;
}

export default function Sidebar({ 
  userProfile, onLogout, onOpenUsers, onAddEvent, onManageProker,
  isSuperAdmin, isOpen, onClose, filterDeptId, onFilterChange 
}: SidebarProps) {
  
  return (
    <>
      {/* Backdrop untuk mobile saat sidebar terbuka */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0a0f0d] text-white flex flex-col p-6 z-[70] transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Tombol Tutup (Hanya Mobile) */}
        <button 
            onClick={onClose} 
            className="lg:hidden absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
            <X size={24}/>
        </button>

        {/* --- LOGO OPTIMIZED --- */}
        <div className="mb-12 px-2 shrink-0 relative w-full h-16">
          <Image 
            src="/logo-hmpsti.png" 
            alt="Logo HMPSTI UB" 
            fill // Mengisi area kontainer h-16
            className="object-contain brightness-110"
            priority // Memaksa logo dimuat paling pertama (LCP Optimization)
            sizes="(max-width: 768px) 100vw, 256px"
          />
        </div>

        {/* --- AREA NAVIGASI --- */}
        <nav className="flex-1 space-y-10 overflow-y-auto pr-2 sidebar-scroll no-scrollbar">
          
          {/* Menu Beranda */}
          <div className="space-y-1">
             <NavItem 
                icon={<LayoutDashboard size={18}/>} 
                label="Beranda Utama" 
                active={filterDeptId === null} 
                onClick={() => { onFilterChange(null); onClose(); }} 
             />
          </div>

          {/* Fitur Admin (Hanya tampil jika sudah login) */}
          {userProfile && (
            <div className="space-y-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-3 block">Kontrol Admin</span>
                <div className="space-y-2.5">
                    <button 
                        onClick={onAddEvent}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-900/40 active:scale-[0.98] group"
                    >
                        <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                           <Plus size={16} strokeWidth={3}/>
                        </div>
                        <span className="text-sm font-bold">Tambah Jadwal</span>
                    </button>
                    <button 
                        onClick={onManageProker}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1a211e] hover:bg-[#252d2a] text-white rounded-2xl transition border border-white/5 active:scale-[0.98]"
                    >
                        <Briefcase size={18} className="text-orange-400"/>
                        <span className="text-sm font-medium">Kelola Proker</span>
                    </button>
                </div>
            </div>
          )}
          
          {/* Filter Divisi / Departemen */}
          <div className="space-y-4">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-3 block">Filter Divisi</span>
              <div className="space-y-1">
                {PILLARS.map((p: any) => (
                    <div 
                        key={p.id} 
                        onClick={() => { onFilterChange(p.id); onClose(); }}
                        className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${filterDeptId === p.id ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="text-[11px] font-bold uppercase tracking-tight">{p.name}</span>
                        </div>
                        {filterDeptId === p.id && <ChevronRight size={14} className="opacity-40 animate-pulse"/>}
                    </div>
                ))}
              </div>
          </div>

          {/* User Manager (Hanya Super Admin) */}
          {isSuperAdmin && (
            <div className="space-y-3">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-3 block">Konfigurasi</span>
              <button onClick={onOpenUsers} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5 group border border-transparent hover:border-white/10">
                  <Users size={18} className="text-blue-400 group-hover:scale-110 transition-transform"/>
                  <span className="text-sm font-medium">User Manager</span>
              </button>
            </div>
          )}
        </nav>

        {/* --- AREA PROFIL & FOOTER --- */}
        <div className="pt-6 border-t border-white/5 shrink-0 mt-8">
            {userProfile ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-full flex items-center justify-center font-black text-black text-xs uppercase shadow-lg">
                            {userProfile.email[0]}
                        </div>
                        <div className="overflow-hidden text-left">
                            <p className="text-xs font-bold truncate text-gray-100">{userProfile.email.split('@')[0]}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mt-1">{userProfile.role}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group active:scale-95">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform"/>
                        <span className="text-sm font-bold">Keluar</span>
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onLogout} 
                    className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition shadow-2xl active:scale-95"
                >
                    Sign In Admin
                </button>
            )}
        </div>
      </aside>
    </>
  );
}

/**
 * Komponen Kecil untuk Item Navigasi
 */
function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
        onClick={onClick} 
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all active:scale-95 ${active ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
  );
}