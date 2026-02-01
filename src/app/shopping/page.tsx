'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    Check,
    ArrowLeft,
    Package,
    MapPin,
    TrendingDown,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function ShoppingListPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItems() {
            try {
                const res = await fetch('/api/items');
                if (res.ok) {
                    const data = await res.json();
                    // Filter items that are low in stock
                    setItems(data.filter((i: any) => i.quantity <= i.minStock));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, []);

    const handleRestock = async (itemId: string, currentMin: number) => {
        try {
            // Suggesting a restock to min + 10 or something similar
            const newQty = currentMin + 10;
            const res = await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty })
            });
            if (res.ok) {
                setItems(items.filter(i => i._id !== itemId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-3 bg-white dark:bg-zinc-900 rounded-2xl hover:bg-zinc-100 transition-colors shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black">Danh sách <span className="gradient-text">Mua sắm</span></h1>
                        <p className="text-zinc-500 font-medium">Những món đồ cần được bổ sung ngay.</p>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-indigo-600 rounded-[40px] p-8 text-white mb-8 shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-between overflow-hidden relative">
                    <ShoppingCart className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                    <div>
                        <span className="text-indigo-200 text-sm font-black uppercase tracking-widest">Tổng cộng</span>
                        <div className="text-5xl font-black mt-2">{items.length} <span className="text-2xl opacity-50 font-bold">món</span></div>
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
                        Chia sẻ danh sách
                    </button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <Package className="w-8 h-8 text-zinc-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{item.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location?.name}</span>
                                            <span className="text-rose-500 flex items-center gap-1 font-bold">
                                                <TrendingDown className="w-3 h-3" /> Còn {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRestock(item._id, item.minStock)}
                                        className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                        title="Đã mua và bổ sung"
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                    <button className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm">
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {items.length === 0 && (
                        <div className="text-center py-24 opacity-30">
                            <Check className="w-20 h-20 mx-auto mb-4" />
                            <p className="font-bold text-xl">Kho đồ của bạn đã đầy đủ!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
