'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Trash2, ChevronRight, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'food', label: 'Thực phẩm' },
    { value: 'electronics', label: 'Điện tử' },
    { value: 'general', label: 'Đồ dùng' },
    { value: 'medical', label: 'Thuốc' },
    { value: 'clothing', label: 'Quần áo' },
    { value: 'tools', label: 'Dụng cụ' },
    { value: 'vehicle', label: 'Xe cộ' },
    { value: 'collectible', label: 'Sưu tầm' },
    { value: 'furniture', label: 'Nội thất' },
];

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
                setItems(await itemsRes.json());
                setLocations(await locRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const removeAccents = (str: string) => {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterSort, setFilterSort] = useState('newest'); // newest, alpha-asc, alpha-desc, qty-asc, qty-desc
    const [filterExpiry, setFilterExpiry] = useState(false); // only expiring

    // Derived filteredItems update...
    const filteredItems = items.filter(item => {
        const normalizedSearch = removeAccents(search.toLowerCase());
        const matchesSearch = removeAccents(item.name.toLowerCase()).includes(normalizedSearch);
        const matchesLocation = filterLocation === 'all' || item.location?._id === filterLocation;
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesExpiry = !filterExpiry || (item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        return matchesSearch && matchesLocation && matchesCategory && matchesExpiry;
    }).sort((a, b) => {
        if (filterSort === 'alpha-asc') return a.name.localeCompare(b.name);
        if (filterSort === 'alpha-desc') return b.name.localeCompare(a.name);
        if (filterSort === 'qty-asc') return a.quantity - b.quantity;
        if (filterSort === 'qty-desc') return b.quantity - a.quantity;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const activeFilterCount = (filterLocation !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0) + (filterExpiry ? 1 : 0) + (filterSort !== 'newest' ? 1 : 0);

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa món đồ này?')) return;
        try {
            const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
            if (res.ok) setItems(items.filter(i => i._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
                <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                <div className="w-20 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
            </div>
            <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse mb-6"></div>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-full h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse"></div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto overflow-hidden relative">
            {/* Header */}
            <header className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black">Kho của tôi</h1>
                        <p className="text-xs text-zinc-500">{filteredItems.length} món</p>
                    </div>
                </div>
                <Link
                    href="/items/new"
                    className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Thêm
                </Link>
            </header>

            {/* Main Search & Filter Toggle */}
            <div className="flex gap-2 mb-4 relative z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm đồ đạc..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
                    />
                </div>
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className={`px-3 py-2.5 rounded-xl border flex gap-1.5 items-center justify-center transition-all ${activeFilterCount > 0 ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                >
                    <span className="text-sm font-bold">Lọc</span>
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white rounded-full text-[10px] font-black">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* Slide-out Drawer Filter */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-zinc-950 shadow-2xl z-50 flex flex-col border-l border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <h2 className="text-lg font-black">Bộ lọc nâng cao</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Sắp xếp theo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(
                                            [
                                                { id: 'newest', title: 'Mới nhất' },
                                                { id: 'alpha-asc', title: 'Tên A-Z' },
                                                { id: 'alpha-desc', title: 'Tên Z-A' },
                                                { id: 'qty-asc', title: 'Slg Tăng dần' },
                                                { id: 'qty-desc', title: 'Slg Giảm dần' }
                                            ]
                                        ).map(sort => (
                                            <button
                                                key={sort.id}
                                                onClick={() => setFilterSort(sort.id)}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${filterSort === sort.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'}`}
                                            >
                                                {sort.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Chỉ hiển thị</label>
                                    <button
                                        onClick={() => setFilterExpiry(!filterExpiry)}
                                        className={`w-full py-2.5 px-3 text-sm font-bold flex justify-between items-center rounded-xl transition-all border ${filterExpiry ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-700' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}
                                    >
                                        <span>Đồ sắp hết hạn ({'<'} 1 tháng)</span>
                                        {filterExpiry && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                                    </button>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Khu vực / Tủ kệ</label>
                                    <select
                                        value={filterLocation}
                                        onChange={(e) => setFilterLocation(e.target.value)}
                                        className="w-full px-3 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm font-medium border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    >
                                        <option value="all">Mọi vị trí</option>
                                        {locations.map(loc => (
                                            <option key={loc._id} value={loc._id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Danh mục</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.value}
                                                onClick={() => setFilterCategory(cat.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filterCategory === cat.value ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-white dark:bg-zinc-900 text-zinc-600 border-zinc-200 dark:border-zinc-700'}`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                                <button
                                    onClick={() => {
                                        setFilterLocation('all');
                                        setFilterCategory('all');
                                        setFilterSort('newest');
                                        setFilterExpiry(false);
                                    }}
                                    className="flex-1 py-3 text-sm font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                                >
                                    Xóa lọc
                                </button>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl"
                                >
                                    Đóng ({filteredItems.length})
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Items List */}
            <div className="space-y-2 relative z-10 pb-20">
                {filteredItems.map(item => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        key={item._id}
                        className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:shadow-md transition-shadow"
                    >
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 relative">
                            {(item.displayImage || item.imageUrl) ? (
                                <img src={item.displayImage || item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                            ) : (
                                <Package className="w-full h-full p-2.5 text-zinc-400 mix-blend-multiply opacity-50 block mx-auto" />
                            )}
                            {item.quantity <= item.minStock && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <Link href={`/items/${item._id}`} className="text-[13px] md:text-sm font-black truncate block hover:text-blue-500 transition-colors leading-tight mb-0.5">
                                {item.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-zinc-500 font-medium">
                                <span className={item.quantity <= item.minStock ? 'text-amber-600 font-bold' : ''}>
                                    {item.quantity}/{item.minStock} {item.unit}
                                </span>
                                {item.location?.name && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate">{item.location.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/items/${item._id}`} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </Link>
                            <button
                                onClick={() => handleDelete(item._id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-zinc-400 hover:text-rose-600 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    <p className="text-xs text-zinc-500 mb-2">Không tìm thấy</p>
                    <Link href="/items/new" className="text-xs font-bold text-zinc-900 dark:text-white hover:underline">
                        + Thêm món đầu tiên
                    </Link>
                </div>
            )}
        </div>
    );
}
