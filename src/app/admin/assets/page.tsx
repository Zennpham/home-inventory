'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, PieChart, BarChart3, TrendingUp, DollarSign,
    User, Package, ChevronRight, ShieldCheck, Info,
    Target, Wallet, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

export default function AssetStatsPage() {
    const { role } = useUser();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (role !== 'admin') {
            router.push('/');
            return;
        }

        fetch('/api/admin/stats/assets')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.stats);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [role, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!data) return null;

    const formatVND = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8 max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-600" /> Thống kê Tài sản
                    </h1>
                    <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mt-1">Hệ thống quản lý giá trị kho</p>
                </div>
            </div>

            {/* Total Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-3xl shadow-xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 -rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase opacity-60 mb-1">Tổng giá trị hiện tại</p>
                        <h2 className="text-3xl font-black mb-1">{formatVND(data.totalCurrentValue)}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">+12% vs tháng trước</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Briefcase className="w-24 h-24 -rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Tổng vốn đầu tư (Giá mua)</p>
                        <h2 className="text-3xl font-black mb-1">{formatVND(data.totalPurchaseValue)}</h2>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">Dựa trên {data.totalCount || 'tất cả'} vật phẩm</p>
                    </div>
                </motion.div>
            </div>

            {/* Breakdown by Owner */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phân bổ theo Chủ sở hữu</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {Object.entries(data.byOwner).map(([owner, stats]: [string, any], idx: number) => (
                        <motion.div
                            key={owner}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-black text-indigo-600">
                                    {owner.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-black">{owner}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold">{stats.count} vật phẩm</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black">{formatVND(stats.current)}</p>
                                <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${(stats.current / data.totalCurrentValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Top Valuable Items */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <PieChart className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Top 5 Vật phẩm giá trị nhất</h3>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                    {data.topValueItems.map((item: any, idx: number) => (
                        <Link key={item._id} href={`/items/${item._id}`} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-zinc-300">#0{idx + 1}</span>
                                <p className="text-sm font-bold truncate max-w-[150px] md:max-w-[200px]">{item.name}</p>
                            </div>
                            <p className="text-sm font-black text-indigo-600">{formatVND(item.value)}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Admin Advice Card */}
            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl flex gap-4">
                <div className="w-12 h-12 bg-white dark:bg-indigo-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-indigo-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                        Lời khuyên của AI
                    </h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400/80 leading-relaxed italic">
                        "Tổng tài sản trong kho của bạn đang tập trung 65% vào thiết bị điện tử. Hãy đảm bảo bạn đã lưu lại Số Serial và chụp ảnh hóa đơn để phục vụ bảo hành hoặc bảo hiểm khi cần thiết."
                    </p>
                </div>
            </div>

            {/* Security Note */}
            <div className="mt-8 text-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center justify-center gap-1.5 tracking-tighter">
                    <ShieldCheck className="w-3 h-3" /> Tài liệu bảo mật dành riêng cho Admin
                </p>
            </div>
        </div>
    );
}
