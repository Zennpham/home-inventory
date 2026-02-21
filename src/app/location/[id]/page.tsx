'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Home, Layout, Box, Package, ChevronRight, MapPin, Zap, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import SemanticPath from '@/components/SemanticPath';
import { useUser } from '@/contexts/UserContext';

export default function LocationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [location, setLocation] = useState<any>(null);
    const [subLocations, setSubLocations] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quickUsageMode, setQuickUsageMode] = useState(false);
    const { name: userName } = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, itemsRes] = await Promise.all([
                    fetch('/api/locations'),
                    fetch('/api/items')
                ]);
                const locsData = await locRes.json();
                const itemsData = await itemsRes.json();

                const currentLoc = locsData.find((l: any) => l.nfcId === id || l._id === id);
                if (currentLoc) {
                    setLocation(currentLoc);
                    setSubLocations(locsData.filter((l: any) => (l.parentId?._id || l.parentId) === currentLoc._id));
                    setItems(itemsData.filter((i: any) => (i.location?._id || i.location) === currentLoc._id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!location) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-zinc-500 mb-4">Không tìm thấy vị trí</p>
                <Link href="/locations" className="text-zinc-900 dark:text-white font-medium hover:underline">← Quay lại</Link>
            </div>
        </div>
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'room': return <Home className="w-5 h-5" />;
            case 'cabinet': return <Layout className="w-5 h-5" />;
            default: return <Box className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1200px] mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
                <SemanticPath segments={location.pathSegments || []} disableLinks={false} />
            </div>

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                        <Home className="w-5 h-5" />
                    </Link>
                    <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
                        {getIcon(location.type)}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{location.name}</h1>
                        <p className="text-sm text-zinc-500">{location.nfcId}</p>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-2xl font-bold mb-1">{items.length}</p>
                    <p className="text-xs text-zinc-500">Món đồ</p>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-2xl font-bold mb-1">{subLocations.length}</p>
                    <p className="text-xs text-zinc-500">Vị trí con</p>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-2xl font-bold mb-1">{items.reduce((sum, i) => sum + i.quantity, 0)}</p>
                    <p className="text-xs text-zinc-500">Tổng số lượng</p>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-2xl font-bold mb-1">{location.type}</p>
                    <p className="text-xs text-zinc-500">Loại</p>
                </div>
            </div>

            {/* Sub-locations */}
            {subLocations.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4">Vị trí bên trong ({subLocations.length})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {subLocations.map(sub => (
                            <Link
                                key={sub._id}
                                href={`/location/${sub.nfcId}`}
                                className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-white transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center">
                                        {getIcon(sub.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{sub.name}</p>
                                        <p className="text-xs text-zinc-500">{sub.totalItemCount || 0} món</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Items */}
            <section className="pb-24">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Món đồ tại đây ({items.length})</h2>
                    <button
                        onClick={() => setQuickUsageMode(!quickUsageMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quickUsageMode ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 text-zinc-600'}`}
                    >
                        <Zap className={`w-3.5 h-3.5 ${quickUsageMode ? 'fill-current' : ''}`} />
                        {quickUsageMode ? 'Đóng Chế độ Nhanh' : 'Chế độ Dùng nhanh'}
                    </button>
                </div>

                {items.length > 0 ? (
                    <div className={quickUsageMode ? "grid grid-cols-1 gap-2" : "grid grid-cols-1 md:grid-cols-2 gap-3"}>
                        {items.map(item => quickUsageMode ? (
                            <div key={item._id} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 m-4 text-zinc-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-zinc-400 font-bold">{item.quantity} {item.unit}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            const newQty = Math.max(0, item.quantity - 1);
                                            const res = await fetch(`/api/items/${item._id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ quantity: newQty, historyNote: 'Lấy dùng (Nhanh)', performedBy: userName })
                                            });
                                            if (res.ok) {
                                                setItems(prev => prev.map(i => i._id === item._id ? { ...i, quantity: newQty } : i));
                                            }
                                        }}
                                        className="w-12 h-12 flex items-center justify-center bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl active:scale-90 transition-transform"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const newQty = item.quantity + 1;
                                            const res = await fetch(`/api/items/${item._id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ quantity: newQty, historyNote: 'Thêm đồ (Nhanh)', performedBy: userName })
                                            });
                                            if (res.ok) {
                                                setItems(prev => prev.map(i => i._id === item._id ? { ...i, quantity: newQty } : i));
                                            }
                                        }}
                                        className="w-12 h-12 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl active:scale-90 transition-transform"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={item._id}
                                href={`/items/${item._id}`}
                                className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-white transition-colors group"
                            >
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-5 h-5 text-zinc-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">{item.quantity} {item.unit}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <Package className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                        <p className="text-zinc-500 text-sm">Chưa có món đồ nào</p>
                    </div>
                )}
            </section>
        </div>
    );
}
