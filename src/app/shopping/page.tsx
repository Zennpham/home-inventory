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
    X
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

    const handleSync = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/shopping/sync', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                window.location.reload();
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
                    <div className="space-y-1">
                        <div className="w-24 h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                        <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
                    <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3"></div>
                    {[1, 2].map(i => (
                        <div key={i} className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black">Mua sắm</h1>
                        <p className="text-xs text-zinc-500">{inventoryItems.length + manualItems.length} món cần mua</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                        <ShoppingCart className="w-4 h-4" /> Đồng bộ
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Thêm tay
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-4 w-fit">
                {(['all', 'inventory', 'manual'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-zinc-800 shadow text-zinc-900 dark:text-white'
                            : 'text-zinc-500'
                            }`}
                    >
                        {tab === 'all' ? 'Tất cả' : tab === 'inventory' ? 'Sắp hết' : 'Thủ công'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual List */}
                {(activeTab === 'all' || activeTab === 'manual') && (
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5" /> Danh sách mua
                            </p>
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
                                {manualItems.length}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <AnimatePresence mode="popLayout">
                                {manualItems.map(item => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.4}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            if (offset.x < -100 || (offset.x < -50 && velocity.x < -500)) {
                                                deleteManualItem(item._id);
                                            } else if (offset.x > 100 || (offset.x > 50 && velocity.x > 500)) {
                                                toggleManualItem(item._id, item.checked);
                                            }
                                        }}
                                        className={`group flex items-center gap-2 p-2.5 rounded-xl border transition-all touch-pan-y shadow-sm cursor-grab active:cursor-grabbing ${item.checked
                                            ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-50'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="absolute -z-10 bg-rose-500 rounded-xl inset-y-0 right-0 w-1/2 flex items-center justify-end px-4 text-white">
                                            <Trash2 className="w-4 h-4" />
                                        </div>
                                        <div className="absolute -z-10 bg-emerald-500 rounded-xl inset-y-0 left-0 w-1/2 flex items-center justify-start px-4 text-white">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <button
                                            onClick={() => toggleManualItem(item._id, item.checked)}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 bg-white dark:bg-zinc-900 ${item.checked
                                                ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black'
                                                : 'border-zinc-200 dark:border-zinc-700'
                                                }`}
                                        >
                                            {item.checked && <Check className="w-3 h-3" />}
                                        </button>
                                        <span className={`flex-1 text-sm font-medium bg-transparent pointer-events-none select-none ${item.checked ? 'line-through text-zinc-400' : ''}`}>
                                            {item.name}
                                        </span>
                                        <button
                                            onClick={() => deleteManualItem(item._id)}
                                            className="p-1 text-zinc-300 hover:text-rose-500 opacity-0 md:group-hover:opacity-100 bg-white/50 dark:bg-black/50 rounded pointer-events-auto"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {manualItems.length === 0 && (
                                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                    <p className="text-xs text-zinc-400">Chưa có món nào</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Inventory Alerts */}
                {(activeTab === 'all' || activeTab === 'inventory') && (
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Sắp hết trong kho
                            </p>
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                                {inventoryItems.length}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            {inventoryItems.map(item => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 group"
                                >
                                    <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-full h-full p-2 text-zinc-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/items/${item._id}`} className="text-sm font-medium hover:underline truncate block">
                                            {item.name}
                                        </Link>
                                        <p className="text-[10px] font-bold text-zinc-400">
                                            {item.quantity}/{item.minStock} {item.unit}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRestock(item._id, item.minStock)}
                                        className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {inventoryItems.length === 0 && (
                                <div className="text-center py-8 bg-emerald-50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <Check className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                                    <p className="text-xs text-emerald-600">Kho ổn định</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-black">Thêm nhanh</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddManualItem} className="space-y-3">
                                <input
                                    autoFocus
                                    required
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900"
                                    placeholder="Tên món đồ..."
                                />
                                <button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Thêm
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
