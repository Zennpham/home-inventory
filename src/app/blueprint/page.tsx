'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Maximize, MousePointer2 } from 'lucide-react';
import Link from 'next/link';

interface Location {
    _id: string;
    name: string;
    nfcId: string;
    type: string;
    parentId?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
}

export default function BlueprintMapPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Draft layout states during edit mode
    const [layout, setLayout] = useState<Record<string, { x: number, y: number, w: number, h: number }>>({});

    useEffect(() => {
        fetch('/api/locations')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLocations(data);
                    const initialLayout: any = {};
                    data.forEach((loc: Location) => {
                        initialLayout[loc._id] = {
                            x: loc.x || 0,
                            y: loc.y || 0,
                            w: loc.width || 150,
                            h: loc.height || 100
                        };
                    });
                    setLayout(initialLayout);
                } else {
                    console.error("API returned non-array:", data);
                    setLocations([]);
                }
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLocations([]);
                setLoading(false);
            });
    }, []);

    const getChildren = (parentId: string | null) => {
        return locations.filter(loc => {
            const pid = loc.parentId && typeof loc.parentId === 'object' ? (loc.parentId as any)._id : loc.parentId;
            return pid === parentId || (!pid && !parentId);
        });
    };

    const currentLocations = getChildren(currentParentId);

    const parentNode = currentParentId ? locations.find(l => l._id === currentParentId) : null;

    const handleDragEnd = (id: string, e: any, info: any) => {
        if (!isEditMode) return;
        setLayout(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                x: prev[id].x + info.offset.x,
                y: prev[id].y + info.offset.y
            }
        }));
    };

    const handleResize = (id: string, e: React.PointerEvent) => {
        if (!isEditMode) return;
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const initialW = layout[id].w;
        const initialH = layout[id].h;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newW = Math.max(50, initialW + (moveEvent.clientX - startX));
            const newH = Math.max(50, initialH + (moveEvent.clientY - startY));
            setLayout(prev => ({
                ...prev,
                [id]: { ...prev[id], w: newW, h: newH }
            }));
        };

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const saveLayout = async () => {
        setSaving(true);
        try {
            const updates = currentLocations.map(loc => {
                const draft = layout[loc._id];
                return fetch(`/api/locations/${loc._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        x: draft.x,
                        y: draft.y,
                        width: draft.w,
                        height: draft.h
                    })
                });
            });
            await Promise.all(updates);
            setLocations(prev => prev.map(loc => {
                if (layout[loc._id]) {
                    return { ...loc, x: layout[loc._id].x, y: layout[loc._id].y, width: layout[loc._id].w, height: layout[loc._id].h };
                }
                return loc;
            }));
            setIsEditMode(false);
        } catch (e) { console.error(e) }
        finally { setSaving(false) }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 flex flex-col no-scrollbar">
            <header className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (parentNode) {
                                const grandParentId = parentNode.parentId && typeof parentNode.parentId === 'object' ? (parentNode.parentId as any)._id : parentNode.parentId;
                                setCurrentParentId(grandParentId || null);
                            } else {
                                window.location.href = '/locations';
                            }
                        }}
                        className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black">{parentNode ? parentNode.name : 'Bản đồ 2D'}</h1>
                        <p className="text-xs text-zinc-500">
                            {isEditMode ? 'Kéo để di chuyển • Kéo góc dưới phải để thay đổi kích thước' : 'Nhấp vào một khu vực để xem chi tiết bên trong'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditMode ? (
                        <>
                            <button onClick={() => setIsEditMode(false)} className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold">
                                Hủy
                            </button>
                            <button onClick={saveLayout} disabled={saving} className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5">
                                <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <MousePointer2 className="w-4 h-4" /> Căn chỉnh Layout
                        </button>
                    )}
                </div>
            </header>

            {/* Canvas Area */}
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative overflow-hidden shadow-inner">
                {/* Grid Canvas */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(#d4d4d8 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        opacity: isEditMode ? 1 : 0.3
                    }}>
                </div>

                {currentLocations.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm italic">
                        Khu vực này trống. Thêm hộp ở tab "Bản đồ nhà".
                    </div>
                )}

                {/* Nodes */}
                {currentLocations.map((loc) => {
                    const l = layout[loc._id];
                    if (!l) return null;
                    const colorClass = loc.color || 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';

                    return (
                        <motion.div
                            key={loc._id}
                            drag={isEditMode}
                            dragMomentum={false}
                            onDragEnd={(e, info) => handleDragEnd(loc._id, e, info)}
                            onClick={() => {
                                if (!isEditMode) {
                                    setCurrentParentId(loc._id);
                                }
                            }}
                            className={`absolute flex flex-col p-3 rounded-xl border-2 shadow-sm ${colorClass} transition-shadow ${isEditMode ? 'cursor-grab active:cursor-grabbing hover:shadow-lg z-50' : 'cursor-pointer hover:shadow-md'}`}
                            initial={false}
                            animate={{ x: l.x, y: l.y, width: l.w, height: l.h }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                            style={{
                                touchAction: 'none' // Prevent scrolling while dragging
                            }}
                        >
                            <div className="text-sm font-bold truncate pr-3 pointer-events-none z-10">{loc.name}</div>

                            {/* Minimap for children */}
                            {!isEditMode && getChildren(loc._id).length > 0 && (
                                <div className="absolute inset-x-2 top-8 bottom-6 overflow-hidden pointer-events-none opacity-50 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                                    <div className="relative w-full h-full transform origin-top-left" style={{ transform: `scale(${Math.min(l.w / 800, l.h / 600)})` }}>
                                        {getChildren(loc._id).map((child) => {
                                            const cl = layout[child._id];
                                            if (!cl) return null;
                                            return (
                                                <div
                                                    key={child._id}
                                                    className="absolute border-2 border-zinc-400 bg-zinc-400/20 rounded-lg flex items-center justify-center overflow-hidden"
                                                    style={{ left: cl.x, top: cl.y, width: cl.w, height: cl.h }}
                                                >
                                                    <span className="text-xl font-black text-black/40 dark:text-white/40">{child.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="text-[10px] text-zinc-500 uppercase pointer-events-none mt-auto flex justify-between z-10">
                                <span className="bg-white/50 dark:bg-black/50 px-1 rounded">{loc.type}</span>
                                {!isEditMode && getChildren(loc._id).length > 0 && (
                                    <span className="bg-white/50 dark:bg-black/50 px-1 rounded">{getChildren(loc._id).length} child</span>
                                )}
                            </div>

                            {/* Resize Handle */}
                            {isEditMode && (
                                <div
                                    className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-10"
                                    onPointerDown={(e) => handleResize(loc._id, e)}
                                >
                                    <div className="w-2.5 h-2.5 bg-black/20 dark:bg-white/20 rounded-tl-sm rounded-br-sm pointer-events-none"></div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
