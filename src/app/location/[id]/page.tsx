'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    Home,
    Layout,
    Box,
    Plus,
    Search,
    Package,
    ChevronRight,
    QrCode,
    MapPin,
    CheckSquare,
    Square,
    MoveHorizontal,
    X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SemanticPath from '@/components/SemanticPath';

export default function LocationDetailPage() {
    const { id } = useParams(); // nfcId or mongoose ID
    const [location, setLocation] = useState<any>(null);
    const [subLocations, setSubLocations] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [allLocations, setAllLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [targetLocId, setTargetLocId] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data for context
                const [locRes, itemsRes] = await Promise.all([
                    fetch('/api/locations'),
                    fetch('/api/items')
                ]);
                const locsData = await locRes.json();
                const itemsData = await itemsRes.json();

                const currentLoc = locsData.find((l: any) => l.nfcId === id || l._id === id);
                setAllLocations(locsData);
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

    const toggleSelectItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleBulkMove = async () => {
        if (!targetLocId || selectedItems.length === 0) return;
        setIsTransferring(true);
        try {
            const res = await fetch('/api/items/bulk-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemIds: selectedItems, targetLocationId: targetLocId })
            });

            if (res.ok) {
                // Refresh local items
                setItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
                setSelectedItems([]);
                setIsSelectionMode(false);
                setShowTransferModal(false);
                // Also update local allLocations in case we need counts to update (optional for now)
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsTransferring(false);
        }
    };

    if (loading) return null;

    if (!location) return (
        <div className="min-h-screen flex items-center justify-center p-12">
            <div className="text-center">
                <p className="text-zinc-500 mb-6">Mã vị trí không hợp lệ.</p>
                <Link href="/" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black">Quay lại Dashboard</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 max-w-7xl mx-auto space-y-12">
            <SemanticPath segments={location.pathSegments || []} className="mb-6" />

            <header className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl text-indigo-500 shadow-sm border border-zinc-100 dark:border-zinc-800">
                            {location.type === 'room' ? <Home className="w-8 h-8" /> :
                                location.type === 'cabinet' ? <Layout className="w-8 h-8" /> :
                                    <Box className="w-8 h-8" />}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black mb-1">{location.name}</h1>
                            <SemanticPath segments={location.pathSegments || []} showIcon={false} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-indigo-50 dark:bg-zinc-900 rounded-2xl border border-indigo-100 dark:border-zinc-800 flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{location.nfcId}</span>
                        </div>
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Tổng {location.totalItemCount} món đồ con</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    {items.length > 0 && (
                        <button
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedItems([]);
                            }}
                            className={`px-6 py-4 rounded-[28px] font-black flex items-center justify-center gap-3 transition-all ${isSelectionMode
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600'
                                }`}
                        >
                            <CheckSquare className="w-5 h-5" /> {isSelectionMode ? 'Hủy chọn' : 'Chọn nhiều'}
                        </button>
                    )}
                    <Link href={`/items/new?location=${location._id}`} className="flex-1 md:flex-none px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[28px] font-black flex items-center justify-center gap-3 hover:scale-105 transition-all">
                        <Plus className="w-6 h-6" /> Thêm đồ vào đây
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Sub-locations Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black ml-2 uppercase tracking-widest text-zinc-400">Vị trí con ({subLocations.length})</h3>
                    <div className="space-y-3">
                        {subLocations.map(sub => (
                            <Link key={sub._id} href={`/location/${sub.nfcId}`}>
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                            {sub.type === 'cabinet' ? <Layout className="w-5 h-5" /> : <Box className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{sub.name}</p>
                                            <p className="text-[10px] font-black text-indigo-500 opacity-60 uppercase">{sub.totalItemCount} items</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                                </motion.div>
                            </Link>
                        ))}
                        {subLocations.length === 0 && (
                            <p className="text-zinc-400 text-sm italic ml-2">Không có vị trí con nào.</p>
                        )}
                    </div>
                </div>

                {/* Direct Items Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-black ml-2 uppercase tracking-widest text-zinc-400">Đồ đạc tại đây ({items.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => (
                            <div key={item._id} className="relative group">
                                {isSelectionMode && (
                                    <button
                                        onClick={() => toggleSelectItem(item._id)}
                                        className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-lg"
                                    >
                                        {selectedItems.includes(item._id)
                                            ? <CheckSquare className="w-5 h-5 text-indigo-500" />
                                            : <Square className="w-5 h-5 text-zinc-300" />
                                        }
                                    </button>
                                )}
                                <Link href={isSelectionMode ? '#' : `/items/${item._id}`} onClick={(e) => isSelectionMode && (e.preventDefault(), toggleSelectItem(item._id))}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-6 bg-white dark:bg-zinc-900 rounded-[32px] border shadow-sm flex gap-4 transition-all ${selectedItems.includes(item._id)
                                            ? 'border-indigo-500 bg-indigo-50/10'
                                            : 'border-zinc-100 dark:border-zinc-800'
                                            }`}
                                    >
                                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-zinc-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-base group-hover:text-indigo-500 transition-colors">{item.name}</h4>
                                                <span className="text-xs font-black text-indigo-500">{item.quantity} {item.unit}</span>
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.status === 'in stock' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="col-span-full py-16 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                <Package className="w-12 h-12 mx-auto mb-4 text-zinc-300 opacity-50" />
                                <p className="text-zinc-500 font-bold">Vị trí này trống.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {isSelectionMode && selectedItems.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-6 rounded-[32px] shadow-2xl flex items-center gap-12"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Đang chọn</span>
                            <span className="text-xl font-black">{selectedItems.length} món đồ</span>
                        </div>
                        <div className="h-10 w-px bg-zinc-700 dark:bg-zinc-200" />
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                        >
                            <MoveHorizontal className="w-5 h-5" /> Di chuyển ngay
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transfer Modal */}
            <AnimatePresence>
                {showTransferModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[48px] p-10 relative shadow-2xl overflow-hidden"
                        >
                            <button onClick={() => setShowTransferModal(false)} className="absolute top-8 right-8 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-2xl font-black mb-2">Di chuyển đồ đạc</h3>
                            <p className="text-zinc-500 text-sm mb-8">Chọn nơi bạn muốn chuyển {selectedItems.length} món đồ này tới.</p>

                            <div className="space-y-4 mb-10 overflow-y-auto max-h-[300px] no-scrollbar">
                                {allLocations.filter(l => l._id !== location._id).map(l => (
                                    <button
                                        key={l._id}
                                        onClick={() => setTargetLocId(l._id)}
                                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between group transition-all ${targetLocId === l._id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-zinc-100 dark:border-zinc-800 hover:border-indigo-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors ${targetLocId === l._id ? 'bg-indigo-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'}`}>
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{l.name}</p>
                                                <p className="text-[10px] text-zinc-400 font-medium">{l.path}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleBulkMove}
                                disabled={!targetLocId || isTransferring}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                            >
                                {isTransferring ? 'Đang chuyển...' : 'Xác nhận chuyển'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
