'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    CreditCard,
    Calendar,
    RefreshCw,
    MoreVertical,
    X,
    Save,
    Trash2,
    DollarSign,
    Zap
} from 'lucide-react';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        serviceName: '',
        provider: '',
        renewalDate: '',
        frequency: 'monthly',
        price: '',
        autoRenew: true
    });

    useEffect(() => {
        const fetchSubs = async () => {
            try {
                const res = await fetch('/api/subscriptions');
                const data = await res.json();
                setSubscriptions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubs();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const newSub = await res.json();
                setSubscriptions(prev => [...prev, newSub]);
                setShowForm(false);
                setFormData({ serviceName: '', provider: '', renewalDate: '', frequency: 'monthly', price: '', autoRenew: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6 md:p-12 max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl hover:bg-zinc-200 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-5xl font-black tracking-tight tracking-tighter">Dịch vụ <span className="gradient-text">Số</span></h1>
                    </div>
                    <p className="text-zinc-500 text-lg font-medium">Quản lý gia hạn và các gói đăng ký định kỳ.</p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-[32px] font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
                >
                    <Plus className="w-6 h-6" /> Thêm dịch vụ
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subscriptions.map(sub => (
                        <motion.div
                            key={sub._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-[48px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-4 bg-indigo-50 dark:bg-zinc-800 text-indigo-500 rounded-3xl">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors opacity-0 group-hover:opacity-100">
                                    <MoreVertical className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-1 mb-8 relative z-10">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{sub.serviceName}</h3>
                                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{sub.provider || 'Định kỳ'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                                    <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Gia hạn tới</p>
                                    <p className="font-bold text-sm text-indigo-500">
                                        {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                                    <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Giá tiền</p>
                                    <p className="font-bold text-sm">
                                        {sub.price ? `${sub.price.toLocaleString('vi-VN')} đ` : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                    <p className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        {sub.status}
                                    </p>
                                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-wider text-zinc-400">
                                        {sub.frequency}
                                    </span>
                                </div>
                                {sub.autoRenew && (
                                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                                )}
                            </div>

                            <RefreshCw className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-50 dark:text-zinc-800 opacity-30 pointer-events-none group-hover:rotate-180 transition-transform duration-1000" />
                        </motion.div>
                    ))}

                    {subscriptions.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900 rounded-[48px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <CreditCard className="w-16 h-16 mx-auto mb-6 opacity-10 text-zinc-500" />
                            <h2 className="text-2xl font-black text-zinc-400">Chưa có dịch vụ nào</h2>
                            <p className="text-zinc-500 mt-2">Thêm Netflix, iCloud hoặc các gói đăng ký khác tại đây.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 max-w-xl w-full shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black">Thêm <span className="text-indigo-500">Dịch vụ</span></h2>
                                <button onClick={() => setShowForm(false)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-zinc-400">Tên dịch vụ</label>
                                    <input
                                        required
                                        name="serviceName"
                                        value={formData.serviceName}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 font-bold"
                                        placeholder="Netflix, Youtube Premium..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-zinc-400">Ngày gia hạn</label>
                                        <input
                                            name="renewalDate"
                                            type="date"
                                            value={formData.renewalDate}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-zinc-400">Chu kỳ</label>
                                        <select
                                            name="frequency"
                                            value={formData.frequency}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 font-bold"
                                        >
                                            <option value="monthly">Hàng tháng</option>
                                            <option value="yearly">Hàng năm</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-zinc-400">Giá tiền (VNĐ)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 font-bold"
                                        placeholder="199000"
                                    />
                                </div>

                                <label className="flex items-center gap-4 p-5 bg-zinc-50 dark:bg-zinc-800 rounded-3xl cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700">
                                    <input
                                        type="checkbox"
                                        name="autoRenew"
                                        checked={formData.autoRenew}
                                        onChange={handleChange}
                                        className="w-6 h-6 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-black text-sm">Tự động gia hạn</p>
                                        <p className="text-[10px] text-zinc-400 font-medium">Hệ thống sẽ nhắc bạn 7 ngày trước khi trừ tiền.</p>
                                    </div>
                                </label>

                                <button type="submit" className="w-full bg-zinc-950 dark:bg-white text-white dark:text-black py-6 rounded-[32px] font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
                                    <Save className="w-6 h-6" /> Lưu dịch vụ
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
