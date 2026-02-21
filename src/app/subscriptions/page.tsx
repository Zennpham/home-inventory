'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Calendar, Trash2, DollarSign, RefreshCw, ArrowLeft, X, Save } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        serviceName: '', provider: '', renewalDate: '', frequency: 'monthly', price: '', autoRenew: true
    });

    useEffect(() => {
        fetch('/api/subscriptions')
            .then(res => res.json())
            .then(setSubscriptions)
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/subscriptions', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setSubscriptions([...subscriptions, await res.json()]);
            setShowForm(false);
            setFormData({ serviceName: '', provider: '', renewalDate: '', frequency: 'monthly', price: '', autoRenew: true });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa đăng ký này?')) return;
        const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
        if (res.ok) setSubscriptions(subscriptions.filter(s => s._id !== id));
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
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
                        <h1 className="text-lg font-black">Dịch vụ & Đăng ký</h1>
                        <p className="text-xs text-zinc-500">{subscriptions.length} đăng ký</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> Thêm
                </button>
            </header>

            {/* Cards */}
            <div className="space-y-2">
                {subscriptions.map(sub => (
                    <div key={sub._id} className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 group">
                        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{sub.serviceName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span>{sub.price?.toLocaleString('vi-VN')}đ/{sub.frequency === 'monthly' ? 'tháng' : sub.frequency === 'yearly' ? 'năm' : 'quý'}</span>
                                {sub.renewalDate && (
                                    <>
                                        <span>•</span>
                                        <span>{new Date(sub.renewalDate).toLocaleDateString('vi-VN')}</span>
                                    </>
                                )}
                                {sub.autoRenew && (
                                    <>
                                        <span>•</span>
                                        <RefreshCw className="w-2.5 h-2.5 text-emerald-500" />
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(sub._id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {subscriptions.length === 0 && (
                <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    <p className="text-xs text-zinc-500">Chưa có đăng ký nào</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black">Thêm đăng ký</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Tên dịch vụ *</label>
                                <input
                                    required
                                    value={formData.serviceName}
                                    onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                                    placeholder="Netflix, Spotify..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Giá</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Tần suất</label>
                                    <select
                                        value={formData.frequency}
                                        onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                    >
                                        <option value="monthly">Tháng</option>
                                        <option value="yearly">Năm</option>
                                        <option value="quarterly">Quý</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Ngày gia hạn</label>
                                <input
                                    type="date"
                                    value={formData.renewalDate}
                                    onChange={e => setFormData({ ...formData, renewalDate: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.autoRenew}
                                    onChange={e => setFormData({ ...formData, autoRenew: e.target.checked })}
                                    className="rounded"
                                />
                                Tự động gia hạn
                            </label>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm">
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
