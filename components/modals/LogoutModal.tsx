import { LogOut, X } from "lucide-react";
import { useState } from "react";

interface LogoutModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutModal({ onClose, onConfirm }: LogoutModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(); // Jalankan proses logout
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl scale-100">
                
                {/* Ikon Warning */}
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut size={32} className="text-red-500 ml-1" />
                </div>

                <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Konfirmasi Logout</h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Apakah Anda yakin ingin keluar dari halaman Admin? Anda harus login kembali untuk mengelola kegiatan.
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition flex justify-center items-center gap-2"
                    >
                        {loading ? "Keluar..." : "Ya, Logout"}
                    </button>
                </div>
            </div>
        </div>
    );
}