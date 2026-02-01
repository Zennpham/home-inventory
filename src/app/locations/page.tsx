'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    ChevronRight,
    ChevronDown,
    MapPin,
    Trash2,
    Edit2,
    X,
    Save,
    Layout,
    Box,
    Archive,
    Home
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function LocationManager() {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingLoc, setEditingLoc] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        nfcId: '',
        description: '',
        type: 'room',
        parentId: ''
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const res = await fetch('/api/locations');
        const data = await res.json();
        setLocations(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingLoc ? `/api/locations/${editingLoc._id}` : '/api/locations';
        const method = editingLoc ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            fetchLocations();
            setEditingLoc(null);
            setIsAdding(false);
            setFormData({ name: '', nfcId: '', description: '', type: 'room', parentId: '' });
        } else {
            const err = await res.json();
            alert(err.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa vị trí này?')) return;
        const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchLocations();
        } else {
            const err = await res.json();
            alert(err.error);
        }
    };

    const startEdit = (loc: any) => {
        setEditingLoc(loc);
        setFormData({
            name: loc.name,
            nfcId: loc.nfcId,
            description: loc.description || '',
            type: loc.type || 'room',
            parentId: loc.parentId?._id || loc.parentId || ''
        });
        setIsAdding(true);
    };

    const renderTree = (parentId: string | null = null, depth = 0) => {
        const children = locations.filter(loc => (loc.parentId?._id || loc.parentId) === parentId);
        if (children.length === 0 && parentId !== null) return null;

        return (
            <div className={`space-y-4 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4' : ''}`}>
                {children.map(loc => (
                    <motion.div
                        key={loc._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group"
                    >
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${loc.type === 'room' ? 'bg-indigo-50 text-indigo-500' :
                                        loc.type === 'cabinet' ? 'bg-emerald-50 text-emerald-500' :
                                            'bg-amber-50 text-amber-500'
                                    }`}>
                                    {loc.type === 'room' ? <Home className="w-5 h-5" /> :
                                        loc.type === 'cabinet' ? <Layout className="w-5 h-5" /> :
                                            <Box className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight">{loc.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{loc.nfcId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(loc)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(loc._id)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        {renderTree(loc._id, depth + 1)}
                    </motion.div>
                ))}
            </div>
        );
    };

    if (loading) return null;

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-12">
            <Breadcrumbs items={[{ label: 'Quản lý Vị trí' }]} />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Quản lý <span className="gradient-text">Cấu trúc Kho</span></h1>
                    <p className="text-zinc-500 font-medium">Xây dựng và tổ chức cây thư mục lưu trữ của bạn.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingLoc(null); }}
                    className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[32px] font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                >
                    <Plus className="w-6 h-6" /> Thêm cấp mới
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {renderTree(null)}
                </div>

                <aside className="relative">
                    <AnimatePresence>
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="glass-card p-8 sticky top-12"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black">{editingLoc ? 'Sửa vị trí' : 'Tạo vị trí mới'}</h3>
                                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Tên vị trí</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                            placeholder="Phòng Khách, Tủ lạnh..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">NFC ID (Mã định danh)</label>
                                        <input
                                            required
                                            disabled={!!editingLoc}
                                            value={formData.nfcId}
                                            onChange={(e) => setFormData({ ...formData, nfcId: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="VD: LOC_KITCH_001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Vị trí cha (Parent)</label>
                                        <select
                                            value={formData.parentId}
                                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none"
                                        >
                                            <option value="">Không có (Gốc)</option>
                                            {locations.filter(l => l._id !== editingLoc?._id).map(loc => (
                                                <option key={loc._id} value={loc._id}>{loc.path || loc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Loại không gian</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['room', 'cabinet', 'shelf'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type })}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.type === type
                                                            ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg'
                                                            : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'
                                                        }`}
                                                >
                                                    {type === 'room' ? 'Phòng' : type === 'cabinet' ? 'Tủ' : 'Kệ/Hộp'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                        <Save className="w-6 h-6" /> {editingLoc ? 'Lưu thay đổi' : 'Tạo ngay'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>
            </div>
        </div>
    );
}
