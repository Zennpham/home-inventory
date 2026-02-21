'use client';

import { useUser } from '@/contexts/UserContext';
import { User, Shield, Users } from 'lucide-react';

export default function UserBadge() {
    const { role, name, isLoading } = useUser();

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
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950',
            label: 'Admin'
        },
        family: {
            icon: Users,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
            label: 'Gia đình'
        },
        guest: {
            icon: User,
            color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-900',
            label: 'Khách'
        }
    };

    const config = roleConfig[role];
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
            <Icon className="w-4 h-4" />
            <span>{name}</span>
        </div>
    );
}
