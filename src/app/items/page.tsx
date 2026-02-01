'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    ExternalLink,
    MapPin,
    Calendar,
    Layers
} from 'lucide-react';
import Link from 'next/link';
import SemanticPath from '@/components/SemanticPath';

export default function ItemsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        async function fetchData() {
            try {
                const [itemsRes, locRes] = await Promise.all([
                    fetch('/api/items'),
                    fetch('/api/locations')
                ]);
                const itemsData = await itemsRes.json();
                const locData = await locRes.json();
                setItems(itemsData);
                setLocations(locData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesLocation = filterLocation === 'all' || item.location?._id === filterLocation;
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        return matchesSearch && matchesLocation && matchesCategory;
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa món đồ này?')) return;
        try {
            const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setItems(items.filter(i => i._id !== id));
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2">Toàn bộ <span className="gradient-text">Kho Đồ</span></h1>
                        <p className="text-zinc-500">Quản lý chi tiết từng món đồ trong nhà của bạn.</p>
                    </div>
                    <Link
                        href="/items/new"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-5 h-5" /> Thêm món mới
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm tên món đồ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-sm appearance-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                        >
                            <option value="all">Tất cả vị trí</option>
                            {locations.map(loc => (
                                <option key={loc._id} value={loc._id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-sm appearance-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="food">Đồ ăn</option>
                            <option value="electronics">Điện tử</option>
                            <option value="subscription">Dịch vụ</option>
                            <option value="general">Khác</option>
                        </select>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col group hover:shadow-xl transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${item.category === 'food' ? 'bg-emerald-50 text-emerald-600' :
                                        item.category === 'electronics' ? 'bg-blue-50 text-blue-600' :
                                            item.category === 'medical' ? 'bg-rose-50 text-rose-600' :
                                                item.category === 'tools' ? 'bg-amber-50 text-amber-600' :
                                                    item.category === 'clothing' ? 'bg-indigo-50 text-indigo-600' :
                                                        item.category === 'subscription' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-zinc-50 text-zinc-600'
                                        }`}>
                                        {item.category === 'food' ? '🍎' :
                                            item.category === 'electronics' ? '🔌' :
                                                item.category === 'medical' ? '💊' :
                                                    item.category === 'tools' ? '🛠️' :
                                                        item.category === 'clothing' ? '👕' :
                                                            item.category === 'subscription' ? '💳' : '📦'}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/items/${item._id}/edit`} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-indigo-500 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <Link href={`/items/${item._id}`}>
                                    <h3 className="text-xl font-black mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                                </Link>
                                <div className="space-y-1 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-indigo-500 font-black">{item.quantity} {item.unit}</span>
                                        {item.status !== 'in stock' && (
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${item.status === 'out of stock' ? 'bg-rose-100 text-rose-600' :
                                                item.status === 'critical' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-zinc-100 text-zinc-500'
                                                }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                    <SemanticPath segments={item.pathSegments?.slice(0, -1) || []} showIcon={false} className="opacity-70" />
                                </div>

                                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2">
                                    {item.expiryDate && (
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Hạn: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md">
                                        Min: {item.minStock}
                                    </span>
                                    {item.owner && (
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 px-2 py-1 rounded-md">
                                            {item.owner}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 font-medium">Không tìm thấy món đồ nào khớp với yêu cầu.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
