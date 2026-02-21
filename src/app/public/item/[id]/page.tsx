'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Package, MapPin, User, Tag, Layers, Info,
    CalendarDays, Clock, DollarSign, Zap, Shield, ChevronRight
} from 'lucide-react';
import SemanticPath from '@/components/SemanticPath';

export default function PublicItemPage() {
    const { id } = useParams();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/items/${id}`)
            .then(res => res.json())
            .then(setItem)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!item || !item.isPublic) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Shield className="w-8 h-8 text-zinc-300" />
            </div>
            <h1 className="text-xl font-black text-center mb-2">Không tìm thấy thông tin</h1>
            <p className="text-sm text-zinc-500 text-center max-w-sm">
                Món đồ này không tồn tại hoặc chủ sở hữu đã thiết lập quyền riêng tư.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-3 md:p-6 py-8">
            <div className="max-w-md mx-auto">
                {/* Branding */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Home Inventory</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none">Thông tin đồ vật</p>
                    </div>
                </div>

                {/* Path Segment */}
                {item.pathSegments && <div className="mb-4 bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800"><SemanticPath segments={item.pathSegments} disableLinks={true} /></div>}

                {/* Main Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-4">
                    {/* Image */}
                    <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-zinc-300" />
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 flex gap-1.5">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${item.status === 'in stock' ? 'bg-emerald-500/90 text-white' : item.status === 'out of stock' ? 'bg-rose-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                                {item.status}
                            </span>
                        </div>
                    </div>

                    {/* Header Info */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h1 className="text-xl font-black mb-1">{item.name}</h1>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5"><Tag className="w-3 h-3" /> {item.category}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="p-4 text-center">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Số lượng</p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{item.quantity}<span className="text-xs font-normal text-zinc-400 ml-1">{item.unit}</span></p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Vị trí</p>
                            <p className="text-sm font-bold truncate flex items-center justify-center gap-1 mt-1.5"><MapPin className="w-4 h-4 text-blue-500" /> {item.location?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-4 mb-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3">Thông tin chi tiết</p>
                    <div className="space-y-3">
                        {item.owner && <DetailRow icon={<User className="w-4 h-4" />} label="Chủ sở hữu" value={item.owner} />}
                        {item.purchaseDate && <DetailRow icon={<CalendarDays className="w-4 h-4" />} label="Ngày mua" value={new Date(item.purchaseDate).toLocaleDateString('vi-VN')} />}
                        {item.expiryDate && <DetailRow icon={<Clock className="w-4 h-4 text-rose-500" />} label="Hạn sử dụng" value={new Date(item.expiryDate).toLocaleDateString('vi-VN')} />}
                        {item.maintenanceFrequency > 0 && <DetailRow icon={<Zap className="w-4 h-4 text-amber-500" />} label="Bảo trì định kỳ" value={`${item.maintenanceFrequency} ngày`} />}
                    </div>
                    {item.note && (
                        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50 flex gap-2">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">"{item.note}"</p>
                        </div>
                    )}
                </div>

                {/* Technical / Specs */}
                {(item.brand || item.modelNumber || (item.itemInfo && Object.keys(item.itemInfo).length > 0)) && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-4 mb-4">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3">Thông số kỹ thuật</p>
                        <div className="grid grid-cols-2 gap-2">
                            {item.brand && <InfoBox label="Thương hiệu" value={item.brand} />}
                            {item.modelNumber && <InfoBox label="Model" value={item.modelNumber} />}
                            {item.warrantyDate && <InfoBox label="Hạn bảo hành" value={new Date(item.warrantyDate).toLocaleDateString('vi-VN')} />}
                            {item.itemInfo && Object.entries(item.itemInfo).map(([key, value]: [string, any]) => (
                                <InfoBox key={key} label={key} value={String(value)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Batches */}
                {item.batches?.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-4">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-1"><Layers className="w-3 h-3" /> Chi tiết từng lô ({item.batches.length})</p>
                        <div className="space-y-2">
                            {item.batches.map((batch: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                                    <div>
                                        <p className="text-xs font-black">Lô #{i + 1}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{batch.id || `BATCH-${i + 1}`}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{batch.quantity} <span className="text-[10px] text-zinc-400 font-normal">{item.unit}</span></p>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between pb-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-zinc-500">{icon}<span className="text-xs font-bold">{label}</span></div>
            <span className="text-sm font-black text-right">{value}</span>
        </div>
    );
}

function InfoBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-xs font-black truncate">{value}</p>
        </div>
    );
}
