import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { LogIn } from "lucide-react";

interface LoginModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            setLoading(false);
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LogIn size={24} className="text-gray-600"/>
                    </div>
                    <h2 className="font-bold text-xl text-gray-800">Login Admin</h2>
                    <p className="text-xs text-gray-400 mt-1">Masukkan akun pengurus untuk mengelola kegiatan</p>
                </div>
                
                {errorMsg && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 text-center border border-red-100">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-3">
                    <input 
                        className="border border-gray-300 w-full p-3 rounded-xl text-sm outline-none focus:border-black transition" 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        className="border border-gray-300 w-full p-3 rounded-xl text-sm outline-none focus:border-black transition" 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    
                    <button disabled={loading} className="bg-black text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50 mt-2">
                        {loading ? "Memproses..." : "Masuk Dashboard"}
                    </button>
                    
                    <button type="button" onClick={onClose} className="w-full text-gray-400 text-xs py-2 hover:text-gray-600">
                        Batal
                    </button>
                </form>
            </div>
        </div>
    );
}