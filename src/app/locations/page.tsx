'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Home, Layout, Box, ArrowLeft, GripVertical, Package, Layers, Printer, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Location {
    _id: string;
    name: string;
    nfcId: string;
    type: 'room' | 'cabinet' | 'shelf' | 'drawer' | 'box' | 'area' | 'other';
    parentId?: string | { _id: string };
    totalItemCount?: number;
    color?: string;
}

const TYPE_COLORS = {
    room: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    cabinet: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
    shelf: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
    drawer: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900',
    box: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900',
    area: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900',
    other: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-900'
};

const TYPE_ICONS = { room: Home, cabinet: Layout, shelf: Box, drawer: Layers, box: Package, area: MapPin, other: Layers };
const TYPE_LABELS = { room: 'Phòng', cabinet: 'Tủ / Kệ', shelf: 'Kệ', drawer: 'Ngăn', box: 'Hộp', area: 'Khu vực', other: 'Khác' };

const PRESET_COLORS = [
    '', // Default (from type)
    'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-100',
    'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-100',
    'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/40 dark:border-yellow-800 dark:text-yellow-100',
    'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-100',
    'bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-100',
    'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100',
    'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-100',
    'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-100',
    'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'
];

export default function LocationMapPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', nfcId: '', type: 'room' as Location['type'], parentId: '', color: ''
    });

    useEffect(() => { fetchLocations(); }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/locations');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLocations(data);
            } else {
                console.error("API returned non-array:", data);
                setLocations([]);
            }
        } catch (e) {
            console.error(e);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetParentId: string | null) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetParentId) return;
        const res = await fetch(`/api/locations/${draggedId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parentId: targetParentId || null })
        });
        if (res.ok) fetchLocations();
        setDraggedId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingLoc ? `/api/locations/${editingLoc._id}` : '/api/locations';
        const method = editingLoc ? 'PATCH' : 'POST';
        const res = await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) { fetchLocations(); closeForm(); }
    };

    const handleDelete = async (loc: Location) => {
        const children = locations.filter(l => getParentId(l) === loc._id);
        const itemCount = loc.totalItemCount || 0;

        // Check if location has children
        if (children.length > 0) {
            alert(`❌ Không thể xóa vị trí này!\n\nVị trí "${loc.name}" có ${children.length} vị trí con bên trong.\n\nVui lòng xóa các vị trí con trước hoặc di chuyển chúng ra ngoài.`);
            return;
        }

        // Check if location has items
        if (itemCount > 0) {
            alert(`❌ Không thể xóa vị trí này!\n\nVị trí "${loc.name}" đang chứa ${itemCount} món đồ.\n\nVui lòng di chuyển các món đồ đi nơi khác trước khi xóa vị trí.`);
            return;
        }

        // Confirm deletion
        const confirmed = confirm(`🗑️ Xác nhận xóa vị trí?\n\n"${loc.name}" (${TYPE_LABELS[loc.type]})\n\nHành động này không thể hoàn tác.`);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/locations/${loc._id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                alert(`❌ Lỗi: ${data.error || 'Không thể xóa vị trí'}`);
                return;
            }

            fetchLocations();
        } catch (error) {
            alert('❌ Lỗi kết nối. Vui lòng thử lại.');
            console.error(error);
        }
    };

    const startEdit = (loc: Location) => {
        setEditingLoc(loc);
        setFormData({
            name: loc.name, nfcId: loc.nfcId, type: loc.type || 'room',
            parentId: typeof loc.parentId === 'object' ? loc.parentId._id : loc.parentId || '',
            color: loc.color || ''
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingLoc(null);
        setFormData({ name: '', nfcId: '', type: 'room', parentId: '', color: '' });
    };

    const getParentId = (loc: Location) => {
        if (!loc.parentId) return null;
        return typeof loc.parentId === 'object' ? loc.parentId._id : loc.parentId;
    };

    const renderLocationCard = (loc: Location, depth: number = 0) => {
        const Icon = TYPE_ICONS[loc.type] || Box;
        const colorClass = loc.color || TYPE_COLORS[loc.type] || TYPE_COLORS.shelf;
        const children = locations.filter(l => getParentId(l) === loc._id);
        const isDragging = draggedId === loc._id;
        const isRoot = depth === 0;

        return (
            <div
                key={loc._id}
                draggable
                onDragStart={(e) => handleDragStart(e, loc._id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, loc._id)}
                className={`transition-all min-w-0 ${isDragging ? 'opacity-40 scale-95' : ''} ${isRoot ? 'w-full' : 'flex-1 min-w-[200px] max-w-full'}`}
            >
                <div className={`p-3 rounded-2xl border shadow-sm ${colorClass} group relative flex flex-col h-full`}>
                    <div className="absolute left-1 top-4 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-40">
                        <GripVertical className="w-3 h-3" />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                            <Link href={`/location/${loc.nfcId}`} className="text-sm font-black truncate block hover:underline">
                                {loc.name}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                <span>{TYPE_LABELS[loc.type]}</span>
                                {loc.totalItemCount !== undefined && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-0.5">
                                            <Package className="w-2.5 h-2.5" />
                                            {loc.totalItemCount}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                            <Link href={`/locations/${loc._id}/print`} className="p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 text-zinc-600 dark:text-zinc-400">
                                <Printer className="w-3 h-3" />
                            </Link>
                            <button onClick={() => startEdit(loc)} className="p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 text-zinc-600 dark:text-zinc-400">
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDelete(loc)} className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {children.length > 0 && (
                        <div className="mt-3 p-2 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/50 dark:border-black/50 flex flex-wrap gap-2 items-stretch shadow-inner">
                            {children.map(child => renderLocationCard(child, depth + 1))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const rootLocations = locations.filter(loc => !getParentId(loc));

    if (loading) return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto space-y-3">
            <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
                <div className="w-40 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                <div className="w-20 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
            </div>
            {[1, 2, 3].map(i => (
                <div key={i} className="w-full h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800"></div>
            ))}
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
                        <h1 className="text-xl font-black">Bản đồ nhà <span className="text-xs font-bold px-2 py-0.5 ml-1 bg-emerald-100 text-emerald-700 rounded-lg">BETA</span></h1>
                        <p className="text-xs text-zinc-500 mt-0.5">Kéo thả để di chuyển hộp. Chạm để xem chi tiết.</p>
                    </div>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingLoc(null); }}
                    className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> Thêm
                </button>
            </header>

            {/* Map Grid */}
            <div
                className="grid grid-cols-1 gap-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, null)}
            >
                {rootLocations.map(loc => renderLocationCard(loc, 0))}

                {draggedId && (
                    <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, null)}
                        className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-center text-xs text-zinc-400"
                    >
                        Thả để đặt làm root
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black">{editingLoc ? 'Sửa vị trí' : 'Thêm vị trí'}</h2>
                            <button onClick={closeForm} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Tên *</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Phòng khách, Tủ lạnh..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">NFC ID *</label>
                                <input
                                    required
                                    disabled={!!editingLoc}
                                    value={formData.nfcId}
                                    onChange={e => setFormData({ ...formData, nfcId: e.target.value })}
                                    placeholder="LIVING_ROOM"
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-mono disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Loại</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(['room', 'cabinet', 'shelf', 'drawer', 'box', 'area', 'other'] as const).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`py-2 rounded-lg text-[10px] sm:text-xs font-medium border transition-all truncate px-1 ${formData.type === type
                                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent'
                                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                                                }`}
                                        >
                                            {TYPE_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block flex items-center justify-between">
                                    <span>Tùy chỉnh màu hộp (tùy chọn)</span>
                                    {formData.color && (
                                        <button type="button" onClick={() => setFormData({ ...formData, color: '' })} className="text-rose-500 hover:underline">Xóa màu</button>
                                    )}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.filter(c => c !== '').map(colorClass => (
                                        <button
                                            key={colorClass}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: colorClass })}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} ${formData.color === colorClass ? 'scale-125 ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-900' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Nằm trong</label>
                                <select
                                    value={formData.parentId}
                                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                >
                                    <option value="">— Root —</option>
                                    {locations.filter(l => l._id !== editingLoc?._id).map(loc => (
                                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={closeForm} className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                                    <Save className="w-4 h-4" /> Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
