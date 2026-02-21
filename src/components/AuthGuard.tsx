'use client';

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePathname } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

// Paths that don't require auth (public scan pages)
const PUBLIC_PATHS = ['/public/', '/location/', '/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { role, isLoading } = useUser();
    const pathname = usePathname();

    // Public paths don't need auth
    const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-14 h-14 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center"
                >
                    <Home className="w-7 h-7 text-white" />
                </motion.div>
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!isPublicPath && role === 'guest') {
        return <LoginPage />;
    }

    return <>{children}</>;
}
