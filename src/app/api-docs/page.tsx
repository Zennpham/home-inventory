'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Database, MapPin, Zap } from 'lucide-react';

interface ApiEndpoint {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    description: string;
    example?: string;
}

const apiEndpoints = [
    {
        group: 'Đồ đạc (Items)', icon: Database, routes: [
            { method: 'GET', path: '/api/items', desc: 'Lấy tất cả món đồ' },
            { method: 'POST', path: '/api/items', desc: 'Tạo món đồ mới' },
            { method: 'GET', path: '/api/items/[id]', desc: 'Chi tiết món đồ' },
            { method: 'PATCH', path: '/api/items/[id]', desc: 'Cập nhật món đồ' },
            { method: 'DELETE', path: '/api/items/[id]', desc: 'Xóa món đồ' }
        ]
    },
    {
        group: 'Vị trí (Locations)', icon: MapPin, routes: [
            { method: 'GET', path: '/api/locations', desc: 'Lấy danh sách vị trí' },
            { method: 'POST', path: '/api/locations', desc: 'Tạo vị trí mới' },
            { method: 'PATCH', path: '/api/locations/[id]', desc: 'Cập nhật vị trí' },
            { method: 'DELETE', path: '/api/locations/[id]', desc: 'Xóa vị trí' }
        ]
    },
    {
        group: 'Hỗ trợ (Utils)', icon: Zap, routes: [
            { method: 'GET', path: '/api/reminders', desc: 'Cảnh báo hết hạn/hết hàng' },
            { method: 'POST', path: '/api/admin/bulk-import', desc: 'Import hàng loạt' },
            { method: 'GET', path: '/api/family', desc: 'Quyền hạn gia đình' }
        ]
    }
];

export default function ApiDocsPage() {
    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    function copyToClipboard(path: string) {
        navigator.clipboard.writeText(`${baseUrl}${path}`);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
    }

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
            <header className="flex items-center gap-2 mb-6">
                <Link href="/" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-lg font-black tracking-tight">API Documentation</h1>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hệ thống Kho Nhà V1.0</p>
                </div>
            </header>

            <div className="space-y-6">
                {apiEndpoints.map((group, i) => (
                    <section key={i}>
                        <div className="flex items-center gap-2 mb-2.5 px-1">
                            <group.icon className="w-3.5 h-3.5 text-zinc-400" />
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{group.group}</h2>
                        </div>
                        <div className="space-y-1.5">
                            {group.routes.map((route, j) => (
                                <div key={j} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className={`px-1 py-0.5 rounded text-[8px] font-black ${route.method === 'GET' ? 'bg-emerald-100 text-emerald-700' :
                                                route.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                                                    route.method === 'PATCH' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-rose-100 text-rose-700'
                                                }`}>{route.method}</span>
                                            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white truncate">{route.path}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{route.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(route.path)}
                                        className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        {copiedPath === route.path ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-300" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="mt-8 p-4 bg-zinc-900 text-white rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Antigravity API Terminal</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </footer>
        </div>
    );
}

