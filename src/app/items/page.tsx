'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
        if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
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
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Tất cả đồ đạc</h1>
                    <p className="text-sm text-zinc-500">{filteredItems.length} món</p>
                </div>
                <Link
                    href="/items/new"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:scale-105 transition-transform"
                >
                    <Plus className="w-4 h-4" />
                    Thêm
                </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm"
                    />
                </div>
                <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="px-4 py-3 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-sm font-medium"
                >
                    <option value="all">Tất cả vị trí</option>
                    {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))}
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-sm font-medium"
                >
                    <option value="all">Tất cả danh mục</option>
                    <option value="food">Food</option>
                    <option value="electronics">Electronics</option>
                    <option value="general">General</option>
                    <option value="medical">Medical</option>
                    <option value="clothing">Clothing</option>
                    <option value="tools">Tools</option>
                </select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                    <div
                        key={item._id}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-900 dark:hover:border-white transition-colors group"
                    >
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-zinc-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/items/${item._id}`} className="block">
                                    <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                        {item.name}
                                    </h3>
                                </Link>
                                <p className="text-xs text-zinc-500 mb-2">{item.location?.name}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            item.status === 'in stock' ? 'bg-emerald-50 text-emerald-600' :
                                            item.status === 'out of stock' ? 'bg-rose-50 text-rose-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                            {item.quantity} {item.unit}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/items/${item._id}`}
                                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20">
                    <Package className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                    <p className="text-zinc-500 mb-4">Không tìm thấy món đồ nào</p>
                    <Link href="/items/new" className="text-zinc-900 dark:text-white font-medium hover:underline">
                        + Thêm món đầu tiên
                    </Link>
                </div>
            )}
        </div>
    );
}
