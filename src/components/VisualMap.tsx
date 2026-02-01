'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    ChevronRight,
    Map as MapIcon,
    Layout,
    Archive,
    Maximize2,
    Package,
    ArrowLeft
} from 'lucide-react';

interface VisualMapProps {
    locations: any[];
    items: any[];
    onSelectLocation: (nfcId: string) => void;
}

export default function VisualMap({ locations, items, onSelectLocation }: VisualMapProps) {
    const [activeParent, setActiveParent] = useState<string | null>(null);

    const rooms = locations.filter(l => l.type === 'room' || !l.parentId);
    const currentLevelLocations = activeParent
        ? locations.filter(l => l.parentId?._id === activeParent)
        : rooms;

    const currentParent = activeParent ? locations.find(l => l._id === activeParent) : null;

    const getLocationItemsCount = (locationId: string) => {
        return items.filter(i => i.location?._id === locationId).length;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'room': return <MapIcon className="w-6 h-6" />;
            case 'cabinet': return <Layout className="w-6 h-6" />;
            case 'shelf': return <Archive className="w-6 h-6" />;
            case 'box': return <Box className="w-6 h-6" />;
            default: return <Package className="w-6 h-6" />;
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {activeParent && (
                        <button
                            onClick={() => setActiveParent(currentParent?.parentId?._id || null)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h3 className="text-xl font-bold">
                            {currentParent ? currentParent.name : 'Bản đồ vị trí'}
                        </h3>
                        <p className="text-sm text-zinc-500">
                            {activeParent ? 'Xem chi tiết bên trong' : 'Chọn một khu vực để bắt đầu'}
                        </p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">
                    Visual Mode
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                    {currentLevelLocations.map((loc) => (
                        <motion.div
                            key={loc._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -5 }}
                            onClick={() => {
                                const hasChildren = locations.some(l => l.parentId?._id === loc._id);
                                if (hasChildren) {
                                    setActiveParent(loc._id);
                                } else {
                                    onSelectLocation(loc.nfcId);
                                }
                            }}
                            className="group cursor-pointer p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-transparent hover:border-indigo-500/30 hover:bg-white dark:hover:bg-zinc-800 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    {getIcon(loc.type)}
                                </div>
                                <div className="bg-zinc-200/50 dark:bg-zinc-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider opacity-60">
                                    {loc.type}
                                </div>
                            </div>

                            <h4 className="text-lg font-bold mb-1">{loc.name}</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-500">{getLocationItemsCount(loc._id)} món đồ</span>
                                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            {/* Box Visualization */}
                            <div className="mt-4 flex gap-1 h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (getLocationItemsCount(loc._id) / 10) * 100)}%` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {currentLevelLocations.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        <Maximize2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>Không có vị trí con nào ở đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
