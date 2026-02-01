'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit2, X, Save, Home, Layout, Box, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
        if (!confirm('Xóa vị trí này?')) return;
        const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchLocations();
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
            <div className={depth > 0 ? 'ml-6 mt-2' : ''}>
                {children.map(loc => (
                    <div key={loc._id} className="mb-2">
                        <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-900 dark:hover:border-white transition-colors group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Link href={`/location/${loc.nfcId}`} className="flex items-center gap-3 flex-1 min-w-0 group-hover:opacity-80 transition-opacity">
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {loc.type === 'room' ? <Home className="w-4 h-4" /> :
                                            loc.type === 'cabinet' ? <Layout className="w-4 h-4" /> :
                                                <Box className="w-4 h-4" />}
                                    </div>
                                    <div className="truncate">
                                        <p className="font-medium text-sm truncate">{loc.name}</p>
                                        <p className="text-xs text-zinc-500 truncate">{loc.nfcId}</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(loc)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(loc._id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {renderTree(loc._id, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Quản lý vị trí</h1>
                        <p className="text-sm text-zinc-500">{locations.length} vị trí</p>
                    </div>
                </div>
                <button
                    onClick={() => { setIsAdding(!isAdding); setEditingLoc(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:scale-105 transition-transform"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Đóng' : 'Thêm'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {renderTree(null)}
                </div>

                {isAdding && (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                        <h3 className="text-lg font-bold mb-4">{editingLoc ? 'Sửa vị trí' : 'Thêm vị trí'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên *</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Phòng khách, Tủ lạnh..."
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">NFC ID *</label>
                                <input
                                    required
                                    disabled={!!editingLoc}
                                    value={formData.nfcId}
                                    onChange={(e) => setFormData({ ...formData, nfcId: e.target.value })}
                                    placeholder="ROOM_LIVING"
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent font-mono text-sm disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Vị trí cha</label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                >
                                    <option value="">Không có (Root)</option>
                                    {locations.filter(l => l._id !== editingLoc?._id).map(loc => (
                                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Loại</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['room', 'cabinet', 'shelf'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`py-2 rounded-lg text-xs font-medium border transition-colors ${formData.type === type
                                                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black'
                                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white'
                                                }`}
                                        >
                                            {type === 'room' ? 'Phòng' : type === 'cabinet' ? 'Tủ' : 'Kệ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
