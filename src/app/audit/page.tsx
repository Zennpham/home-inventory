'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    Trash2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    PackageCheck,
    MapPin,
    Plus,
    Minus,
    ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AuditMode() {
    const [locations, setLocations] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [auditState, setAuditState] = useState<Record<string, { qty: number, checked: boolean }>>({});

    useEffect(() => {
        async function fetchData() {
            const [locRes, itemRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/items')
            ]);
            const locData = await locRes.json();
            const itemData = await itemRes.json();
            setLocations(locData);
            setItems(itemData);

            const initialState: Record<string, { qty: number, checked: boolean }> = {};
            itemData.forEach((item: any) => {
                initialState[item._id] = { qty: item.quantity, checked: false };
            });
            setAuditState(initialState);
            setLoading(false);
        }
        fetchData();
    }, []);

    const updateQty = (itemId: string, delta: number) => {
        setAuditState(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], qty: Math.max(0, prev[itemId].qty + delta), checked: true }
        }));
    };

    const confirmItem = (itemId: string) => {
        setAuditState(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], checked: true }
        }));
    };

    const saveAudit = async () => {
        const checkedItems = Object.entries(auditState)
            .filter(([_, state]) => state.checked)
            .map(([id, state]) => ({ id, quantity: state.qty }));

        if (checkedItems.length === 0) return;

        setLoading(true);
        await Promise.all(checkedItems.map(item =>
            fetch(`/api/items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: item.quantity, lastChecked: new Date() })
            })
        ));

        // Refresh
        window.location.reload();
    };

    if (loading) return null;

    const filteredItems = items.filter(item =>
        !selectedLocation || (item.location?._id || item.location) === selectedLocation
    );

    const progress = Math.round((Object.values(auditState).filter(s => s.checked).length / items.length) * 100);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 space-y-12">
            <Breadcrumbs items={[{ label: 'Chế độ Kiểm kê' }]} />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Audit <span className="gradient-text">Kho Đồ</span></h1>
                    <p className="text-zinc-500 font-medium font-mono text-xs uppercase tracking-widest">Tiến độ kiểm tra: {progress}%</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={saveAudit}
                        className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-[32px] font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                    >
                        <ClipboardCheck className="w-6 h-6" /> Xác nhận & Lưu
                    </button>
                    <Link href="/" className="px-8 py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-[32px] font-bold">Hủy</Link>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Location Sidebar */}
                <aside className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Lọc theo vị trí</h4>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setSelectedLocation(null)}
                            className={`p-4 rounded-2xl text-left font-bold transition-all ${!selectedLocation ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'}`}
                        >
                            Tất cả
                        </button>
                        {locations.map(loc => (
                            <button
                                key={loc._id}
                                onClick={() => setSelectedLocation(loc._id)}
                                className={`p-4 rounded-2xl text-left transition-all ${selectedLocation === loc._id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'}`}
                            >
                                <p className="font-bold text-sm">{loc.name}</p>
                                <p className={`text-[10px] ${selectedLocation === loc._id ? 'text-indigo-200' : 'text-zinc-400'}`}>{loc.path}</p>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Items Grid */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map(item => {
                            const state = auditState[item._id];
                            return (
                                <motion.div
                                    layout
                                    key={item._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-6 bg-white dark:bg-zinc-900 rounded-[32px] border transition-all ${state.checked ? 'border-emerald-500 shadow-lg' : 'border-zinc-100 dark:border-zinc-800 opacity-80 hover:opacity-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-black text-lg">{item.name}</h4>
                                            <p className="text-xs text-zinc-500 font-medium">{item.location?.path || item.location?.name}</p>
                                        </div>
                                        {state.checked && (
                                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                                <Check className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                                            <button onClick={() => updateQty(item._id, -1)} className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm hover:scale-105 active:scale-90 transition-all"><Minus className="w-4 h-4" /></button>
                                            <div className="w-16 text-center font-black text-xl">{state.qty}</div>
                                            <button onClick={() => updateQty(item._id, 1)} className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm hover:scale-105 active:scale-90 transition-all"><Plus className="w-4 h-4" /></button>
                                        </div>

                                        {!state.checked && (
                                            <button
                                                onClick={() => confirmItem(item._id)}
                                                className="px-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                                            >
                                                Khớp (OK)
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <span className="text-[10px] font-black uppercase text-zinc-400">Đơn vị: {item.unit}</span>
                                        <span className="text-[10px] font-black uppercase text-zinc-400">|</span>
                                        <span className="text-[10px] font-black uppercase text-zinc-400">ID: {item.barcode || 'N/A'}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
