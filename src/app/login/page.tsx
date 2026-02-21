'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Delete, LogIn, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const { login } = useUser();
    const router = useRouter();

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
        const result = await login(p);
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
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <div className="w-16 h-16 bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                    <Home className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-white text-xl font-black tracking-tight">HomeInventory</h1>
                <p className="text-zinc-500 text-sm mt-1">Nhập mã PIN để tiếp tục</p>
            </motion.div>

            {/* PIN Dots */}
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex gap-4 mb-8"
            >
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > i
                                ? 'bg-white border-white scale-110'
                                : 'bg-transparent border-zinc-600'
                            }`}
                    />
                ))}
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2"
                    >
                        <Shield className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-red-300 text-sm font-medium">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Numpad */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-3 w-full max-w-[280px]"
            >
                {digits.map((d, i) => {
                    if (d === '') return <div key={i} />;

                    if (d === 'del') return (
                        <button
                            key={i}
                            onClick={handleDelete}
                            disabled={loading || pin.length === 0}
                            className="h-16 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-30"
                        >
                            <Delete className="w-5 h-5" />
                        </button>
                    );

                    return (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDigit(d)}
                            disabled={loading || pin.length >= 4}
                            className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-md backdrop-blur-sm"
                        >
                            {d}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Loading indicator */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 flex items-center gap-2 text-zinc-400 text-sm"
                    >
                        <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                        Đang xác thực...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hint */}
            <p className="absolute bottom-6 text-zinc-700 text-[11px] text-center px-4">
                Liên hệ Admin để được cấp PIN tiếp cận
            </p>
        </div>
    );
}
