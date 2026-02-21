'use client';

import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, History, Plus, Minus, Edit3, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Log {
    _id: string;
    itemId?: {
        _id: string;
        name: string;
        imageUrl: string;
        category: string;
        unit: string;
    };
    type: 'add' | 'remove' | 'update' | 'audit';
    amount: number;
    user: string;
    timestamp: string;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/audit?limit=100')
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'add': return <Plus className="w-4 h-4 text-emerald-600" />;
            case 'remove': return <Minus className="w-4 h-4 text-rose-600" />;
            case 'update': return <Edit3 className="w-4 h-4 text-blue-600" />;
            case 'audit': return <ShieldAlert className="w-4 h-4 text-amber-600" />;
            default: return <History className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getActionText = (type: string, amount: number, unit: string) => {
        switch (type) {
            case 'add': return `đã nhập thêm ${amount} ${unit}`;
            case 'remove': return `đã lấy ra ${amount} ${unit}`;
            case 'update': return `đã cập nhật thông tin`;
            case 'audit': return `đã kiểm kê kho`;
            default: return `đã thao tác`;
        }
    };

    return (
        <div className="min-h-screen p-4 max-w-2xl mx-auto pb-24">
            <header className="flex items-center gap-3 mb-6">
                <Link href="/items" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black">Lịch sử hoạt động</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Lưu vết nhập xuất kho</p>
                </div>
            </header>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">Chưa có lịch sử hoạt động</div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {logs.map((log) => (
                            <div key={log._id} className="p-4 flex gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors items-center">
                                {/* Icon Bubble */}
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                    {getIcon(log.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-bold">{log.user || 'Unknown'}</span>{' '}
                                        <span className="text-zinc-600 dark:text-zinc-400">
                                            {getActionText(log.type, log.amount, log.itemId?.unit || 'pcs')}
                                        </span>
                                    </p>

                                    {log.itemId ? (
                                        <Link href={`/items/${log.itemId._id}`} className="inline-flex items-center gap-2 mt-1.5 p-1.5 pr-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg group">
                                            {log.itemId.imageUrl ? (
                                                <img src={log.itemId.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-700 flex flex-shrink-0 items-center justify-center">
                                                    <Package className="w-3 h-3 text-zinc-400" />
                                                </div>
                                            )}
                                            <span className="text-xs font-semibold group-hover:underline truncate">{log.itemId.name}</span>
                                        </Link>
                                    ) : (
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <Package className="w-3 h-3 text-zinc-400" />
                                            <span className="text-xs text-zinc-500 italic">Món đồ đã xóa</span>
                                        </div>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="text-[10px] text-zinc-400 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleDateString('vi-VN', {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
