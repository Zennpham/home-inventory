'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Delete, LogIn, Shield, ArrowLeft, Users } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const { login, logout } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        fetch('/api/auth/members')
            .then(res => res.json())
            .then(data => {
                const guestMember = { name: 'Khách', role: 'guest' };
                const adminMember = { name: 'Hngan', role: 'admin' };

                // Filter out any members from DB that might have the same name as our hardcoded ones
                const dbMembers = Array.isArray(data) ? data.filter((m: any) =>
                    m.name !== 'Khách' && m.name !== 'Hngan' && m.name !== 'Admin'
                ) : [];

                setMembers([guestMember, adminMember, ...dbMembers]);
            })
            .catch(console.error);
    }, []);

    const handleGuestLogin = () => {
        logout();
        router.push('/');
    };

    const handleDigit = (d: string) => {
        if (pin.length >= 4) return;
        const newPin = pin + d;
        setPin(newPin);
        if (newPin.length === 4) {
            handleSubmit(newPin);
        }
    };

    const handleDelete = () => {
        setPin(p => p.slice(0, -1));
        setError('');
    };

    const handleSubmit = async (p: string) => {
        setLoading(true);
        setError('');
        const result = await login(p, selectedMember?.name);
        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'PIN không đúng');
            setShake(true);
            setTimeout(() => { setShake(false); setPin(''); setLoading(false); }, 600);
        }
    };

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
            <AnimatePresence mode="wait">
                {!selectedMember ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm"
                    >
                        <div className="text-center mb-10">
                            <h1 className="text-2xl font-black mb-2">Chào bạn!</h1>
                            <p className="text-zinc-500 text-sm italic">Bạn là ai trong gia đình mình?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {members.map(member => (
                                <button
                                    key={member._id || member.name}
                                    onClick={() => {
                                        if (member.role === 'guest') {
                                            handleGuestLogin();
                                        } else {
                                            setSelectedMember(member);
                                        }
                                    }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all flex flex-col items-center gap-3 group active:scale-95"
                                >
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {member.role === 'guest' ? <Users className="w-6 h-6 text-emerald-400" /> :
                                            member.role === 'admin' ? <Shield className="w-6 h-6 text-indigo-400" /> :
                                                <LogIn className="w-6 h-6" />}
                                    </div>
                                    <p className="font-bold text-sm">{member.name}</p>
                                    {member.role === 'guest' && (
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 -mt-1">Vào ngay</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="numpad"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center w-full"
                    >
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="absolute top-10 left-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Đổi tài khoản</span>
                        </button>

                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                                {selectedMember.name === 'Admin' ? <Shield className="w-8 h-8" /> : <Home className="w-8 h-8" />}
                            </div>
                            <h2 className="text-xl font-black">Hi, {selectedMember.name}!</h2>
                            <p className="text-zinc-500 text-sm mt-1">Nhập mã PIN cá nhân</p>
                        </div>

                        {/* PIN Dots */}
                        <motion.div
                            animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                            className="flex gap-4 mb-8"
                        >
                            {[0, 1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${pin.length > i
                                        ? 'bg-white border-white scale-125'
                                        : 'bg-transparent border-zinc-700'
                                        }`}
                                />
                            ))}
                        </motion.div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 text-red-400 text-xs font-bold uppercase tracking-tighter">
                                {error}
                            </div>
                        )}

                        {/* Numpad */}
                        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                            {digits.map((d, i) => {
                                if (d === '') return <div key={i} />;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => d === 'del' ? handleDelete() : handleDigit(d)}
                                        disabled={loading}
                                        className="h-16 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-xl font-bold flex items-center justify-center active:scale-90 transition-all"
                                    >
                                        {d === 'del' ? <Delete className="w-5 h-5" /> : d}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
