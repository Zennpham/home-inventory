'use client';

import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Check,
    Package,
    Trash2,
    Plus,
    ArrowLeft,
    ShoppingBag,
    AlertCircle,
    ChevronRight,
    Search,
    X,
    MoreHorizontal,
    PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShoppingListPage() {
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [manualItems, setManualItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'inventory' | 'manual'>('all');

    useEffect(() => {
        async function fetchData() {
            try {
                const [invRes, manRes] = await Promise.all([
                    fetch('/api/items'),
                    fetch('/api/shopping')
                ]);

                if (invRes.ok) {
                    const data = await invRes.json();
                    setInventoryItems(data.filter((i: any) => i.quantity <= i.minStock));
                }
                if (manRes.ok) {
                    setManualItems(await manRes.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleRestock = async (itemId: string, currentMin: number) => {
        const newQty = prompt('Nhập số lượng mới:', String(currentMin + 5));
        if (!newQty) return;

        try {
            const res = await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: parseInt(newQty) })
            });
            if (res.ok) {
                setInventoryItems(inventoryItems.filter(i => i._id !== itemId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddManualItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        try {
            const res = await fetch('/api/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newItemName })
            });
            if (res.ok) {
                const item = await res.json();
                setManualItems([item, ...manualItems]);
                setNewItemName('');
                setShowAddModal(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleManualItem = async (id: string, checked: boolean) => {
        try {
            const res = await fetch(`/api/shopping/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checked: !checked })
            });
            if (res.ok) {
                setManualItems(manualItems.map(item =>
                    item._id === id ? { ...item, checked: !checked } : item
                ));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteManualItem = async (id: string) => {
        try {
            const res = await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setManualItems(manualItems.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
            <div className="w-10 h-10 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-[1000px] mx-auto space-y-12 bg-white dark:bg-zinc-950">
            {/* Minimalist Header */}
            <header className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl hover:bg-zinc-200 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-5xl font-black tracking-tighter">Shopping <span className="gradient-text">List</span></h1>
                    </div>
                    <p className="text-zinc-500 text-lg font-medium">Bạn có {inventoryItems.length + manualItems.length} món cần mua.</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[32px] font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
                >
                    <Plus className="w-6 h-6" /> Thêm nhanh
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
                {(['all', 'inventory', 'manual'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-white dark:bg-zinc-800 shadow-md text-zinc-900 dark:text-white'
                                : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        {tab === 'all' ? 'Tất cả' : tab === 'inventory' ? 'Sắp hết' : 'Thủ công'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Manual List Section */}
                {(activeTab === 'all' || activeTab === 'manual') && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-zinc-400" /> Danh sách mua
                            </h2>
                            <span className="text-xs font-black uppercase text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                                {manualItems.length} món
                            </span>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {manualItems.map(item => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`group flex items-center gap-4 p-5 rounded-3xl border transition-all ${item.checked
                                                ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleManualItem(item._id, item.checked)}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${item.checked
                                                    ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black'
                                                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white'
                                                }`}
                                        >
                                            {item.checked && <Check className="w-5 h-5" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-lg ${item.checked ? 'line-through text-zinc-400' : ''}`}>
                                                {item.name}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteManualItem(item._id)}
                                            className="p-2 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {manualItems.length === 0 && (
                                <div className="text-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[40px]">
                                    <PlusCircle className="w-12 h-12 mx-auto mb-4 text-zinc-200" />
                                    <p className="text-zinc-500 font-bold">Chưa có món đồ thủ công nào</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="text-sm font-black text-zinc-900 dark:text-white mt-4 underline"
                                    >
                                        Thêm ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Inventory Alert Section */}
                {(activeTab === 'all' || activeTab === 'inventory') && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-500" /> Sắp hết trong kho
                            </h2>
                            <span className="text-xs font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full">
                                {inventoryItems.length} cảnh báo
                            </span>
                        </div>

                        <div className="space-y-3">
                            {inventoryItems.map(item => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-5 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 group"
                                >
                                    <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-zinc-200" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/items/${item._id}`} className="font-black text-lg hover:text-zinc-900 group-hover:underline block truncate">
                                            {item.name}
                                        </Link>
                                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mt-1">
                                            {item.quantity} / {item.minStock} {item.unit}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRestock(item._id, item.minStock)}
                                        className="p-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl hover:scale-105 transition-all shadow-md"
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                </div>
                            ))}

                            {inventoryItems.length === 0 && (activeTab === 'inventory' || activeTab === 'all') && (
                                <div className="text-center py-20 bg-emerald-50 dark:bg-emerald-950/10 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30">
                                    <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">Kho bãi ổn định</p>
                                    <p className="text-xs text-emerald-600/60 mt-2 font-medium">Không có món nào sắp hết.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Quick Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 max-w-xl w-full shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black">Thêm <span className="text-zinc-400">Nhanh</span></h2>
                                <button onClick={() => setShowAddModal(false)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddManualItem} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-zinc-400">Tên món đồ</label>
                                    <input
                                        autoFocus
                                        required
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-5 px-8 font-black text-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                                        placeholder="Ví dụ: Sữa tươi, Trứng..."
                                    />
                                </div>
                                <button type="submit" className="w-full bg-zinc-950 dark:bg-white text-white dark:text-black py-7 rounded-[32px] font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
                                    <Plus className="w-8 h-8" /> Thêm vào danh sách
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
