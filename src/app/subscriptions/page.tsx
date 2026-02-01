'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Calendar, Trash2, DollarSign, RefreshCw } from 'lucide-react';

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

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa đăng ký này?')) return;
        const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setSubscriptions(prev => prev.filter(s => s._id !== id));
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1000px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Dịch vụ & Đăng ký</h1>
                    <p className="text-sm text-zinc-500">{subscriptions.length} đăng ký</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:scale-105 transition-transform"
                >
                    <Plus className="w-4 h-4" />
                    Thêm
                </button>
            </div>

            {showForm && (
                <div className="mb-8 p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên dịch vụ *</label>
                                <input
                                    required
                                    name="serviceName"
                                    value={formData.serviceName}
                                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                                    placeholder="Netflix, Spotify..."
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Nhà cung cấp</label>
                                <input
                                    name="provider"
                                    value={formData.provider}
                                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                                    placeholder="Netflix Inc."
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Ngày gia hạn</label>
                                <input
                                    type="date"
                                    name="renewalDate"
                                    value={formData.renewalDate}
                                    onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Tần suất</label>
                                <select
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                >
                                    <option value="monthly">Hàng tháng</option>
                                    <option value="yearly">Hàng năm</option>
                                    <option value="quarterly">Hàng quý</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Giá (VNĐ)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoRenew"
                                checked={formData.autoRenew}
                                onChange={(e) => setFormData({...formData, autoRenew: e.target.checked})}
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="autoRenew" className="text-sm font-medium">Tự động gia hạn</label>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {subscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptions.map(sub => (
                        <div
                            key={sub._id}
                            className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-white transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{sub.serviceName}</h3>
                                        <p className="text-xs text-zinc-500">{sub.provider}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(sub._id)}
                                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{sub.price?.toLocaleString('vi-VN')}đ / {sub.frequency === 'monthly' ? 'tháng' : sub.frequency === 'yearly' ? 'năm' : 'quý'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Gia hạn: {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString('vi-VN') : 'Chưa rõ'}</span>
                                </div>
                                {sub.autoRenew && (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Tự động gia hạn</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                    <p className="text-zinc-500">Chưa có đăng ký nào</p>
                </div>
            )}
        </div>
    );
}
