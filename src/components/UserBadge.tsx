'use client';

import { useUser } from '@/contexts/UserContext';
import { User, Shield, Users, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserBadge() {
    const { role, name, isLoading, logout } = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse">
                <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                <div className="w-16 h-3 bg-zinc-300 dark:bg-zinc-700 rounded" />
            </div>
        );
    }

    const roleConfig = {
        admin: {
            icon: Shield,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800',
            label: 'Admin'
        },
        family: {
            icon: Users,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
            label: 'Gia đình'
        },
        guest: {
            icon: User,
            color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
            label: 'Khách'
        }
    };

    const config = roleConfig[role];
    const Icon = config.icon;

    const handleLogout = () => {
        logout();
        setShowMenu(false);
        router.push('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-95 ${config.color}`}
            >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{name}</span>
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-10 z-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden min-w-[160px]">
                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold">{name}</p>
                            <p className="text-[10px] text-zinc-500">{config.label}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
