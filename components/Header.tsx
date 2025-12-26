import { PILLARS } from "../lib/constants";
import { format, subMonths, addMonths } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, LogOut, Zap, FolderPlus, Users } from "lucide-react";

interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  session: any;
  userProfile: any;
  onViewFocus: () => void;
  onOpenProker: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onOpenUsers: () => void;
}

export default function Header({ 
  currentDate, setCurrentDate, session, userProfile, 
  onViewFocus, onOpenProker, onLogin, onLogout, onOpenUsers 
}: HeaderProps) {
    
  const isSuperAdmin = userProfile?.role === 'super_admin';
  const myDeptName = PILLARS.find(p => p.id === userProfile?.department_id)?.name;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
            <h1 className="text-lg md:text-2xl font-extrabold flex items-center gap-2">
                KALENDER PROKER HMPSTI
                {session && (
                    <span className={`text-[10px] text-white px-2 py-0.5 rounded-full hidden md:inline-block ${isSuperAdmin ? 'bg-black' : 'bg-blue-600'}`}>
                        {isSuperAdmin ? "SUPER ADMIN" : `ADMIN ${myDeptName || ''}`}
                    </span>
                )}
            </h1>
            <p className="text-xs text-gray-500 font-medium">{format(currentDate, "MMMM yyyy", { locale: id })}</p>
        </div>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-md transition"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-md transition"><ChevronRight size={18}/></button>
        </div>

        <div className="hidden md:flex gap-2">
            {session ? (
            <>
                <button onClick={onViewFocus} className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-bold hover:bg-purple-200" title="Mode Fokus"><Zap size={18}/></button>
                
                {isSuperAdmin && (
                    <button onClick={onOpenUsers} className="bg-black text-white px-3 py-2 rounded-lg font-bold hover:bg-gray-800 flex gap-2 text-sm items-center transition">
                        <Users size={16}/> User
                    </button>
                )}

                <button onClick={onOpenProker} className="bg-white border text-black px-3 py-2 rounded-lg font-bold hover:bg-gray-50 flex gap-2 text-sm items-center"><FolderPlus size={16}/> Proker</button>
                <button onClick={onLogout} className="bg-red-50 text-red-600 px-3 rounded-lg hover:bg-red-100 transition" title="Logout"><LogOut size={18}/></button>
            </>
            ) : <button onClick={onLogin} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">Login</button>}
        </div>
      </div>
    </header>
  );
}