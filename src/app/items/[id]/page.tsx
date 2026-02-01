'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit3,
    Package,
    MapPin,
    Calendar,
    User,
    Tag,
    Layers,
    Info,
    CalendarDays,
    Clock,
    DollarSign,
    Box,
    Zap,
    RefreshCw,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SemanticPath from '@/components/SemanticPath';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ItemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/items/${id}`);
                const data = await res.json();
                setItem(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (!item) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
            <div className="text-center">
                <p className="text-zinc-500 mb-4">Không tìm thấy món đồ này.</p>
                <Link href="/items" className="text-indigo-500 font-bold">Quay lại danh sách</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6 md:p-12 max-w-6xl mx-auto space-y-12">
            <SemanticPath segments={item.pathSegments || []} className="mb-6" />

            <header className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <Link href="/items" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl hover:bg-zinc-200 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-5xl font-black tracking-tight">{item.name}</h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${item.status === 'in stock' ? 'bg-emerald-50 text-emerald-600' :
                            item.status === 'out of stock' ? 'bg-rose-50 text-rose-600' :
                                'bg-amber-50 text-amber-600'
                            }`}>
                            {item.status}
                        </span>
                        <span className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-xs font-black uppercase tracking-widest text-zinc-500">
                            {item.category}
                        </span>
                    </div>
                </div>

                <Link href={`/items/${id}/edit`} className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[32px] font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                    <Edit3 className="w-6 h-6" /> Chỉnh sửa
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Image & Quick Stats */}
                <div className="space-y-8">
                    <div className="aspect-square rounded-[48px] bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-2xl">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-24 h-24 text-zinc-300" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] text-center border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Số lượng</p>
                            <p className="text-3xl font-black text-indigo-500">{item.quantity} <span className="text-sm font-medium text-zinc-400">{item.unit}</span></p>
                        </div>
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] text-center border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Mức tối thiểu</p>
                            <p className="text-3xl font-black">{item.minStock}</p>
                        </div>
                    </div>
                </div>

                {/* Center & Right: Details */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Location Card */}
                    <Link href={`/location/${item.location?.nfcId}`} className="block group">
                        <div className="p-8 bg-indigo-50 dark:bg-zinc-900 rounded-[48px] border border-indigo-100 dark:border-zinc-800 transition-all hover:shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl text-indigo-500">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase text-indigo-400">Vị trí lưu trữ</p>
                                        <h3 className="text-2xl font-black group-hover:text-indigo-600 transition-colors mb-1">{item.location?.name}</h3>
                                        <SemanticPath segments={item.pathSegments?.slice(0, -1) || []} showIcon={false} />
                                    </div>
                                </div>
                                <ArrowLeft className="w-6 h-6 rotate-180 text-indigo-400 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">Chi tiết bổ sung</h4>
                            <div className="space-y-4">
                                <DetailItem
                                    icon={<User className="w-4 h-4" />}
                                    label="Chủ sở hữu"
                                    value={
                                        <Link href={`/items?owner=${item.owner}`} className="hover:text-indigo-500 transition-colors">
                                            {item.owner || 'Chung'}
                                        </Link>
                                    }
                                />
                                <DetailItem icon={<CalendarDays className="w-4 h-4" />} label="Ngày mua" value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('vi-VN') : 'N/A'} />
                                <DetailItem icon={<DollarSign className="w-4 h-4" />} label="Giá tiền" value={item.price ? `${item.price.toLocaleString('vi-VN')} đ` : 'Chưa rõ'} />
                                <DetailItem
                                    icon={<Tag className="w-4 h-4" />}
                                    label="Hạn sử dụng"
                                    value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'Không có'}
                                    color="text-rose-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">Hoạt động</h4>
                            <div className="space-y-4">
                                <DetailItem icon={<Clock className="w-4 h-4" />} label="Kiểm kê gần nhất" value={item.lastChecked ? new Date(item.lastChecked).toLocaleDateString('vi-VN') : 'Chưa rõ'} />
                                {item.category === 'electronics' && item.maintenanceFrequency && (
                                    <DetailItem
                                        icon={<Zap className="w-4 h-4" />}
                                        label="Chu kỳ bảo trì"
                                        value={`${item.maintenanceFrequency} ngày`}
                                        color="text-amber-500"
                                    />
                                )}
                                {item.category === 'subscription' && (
                                    <DetailItem
                                        icon={<RefreshCw className="w-4 h-4" />}
                                        label="Tự động gia hạn"
                                        value={item.autoRenew ? 'Có' : 'Không'}
                                        color={item.autoRenew ? 'text-emerald-500' : 'text-zinc-400'}
                                    />
                                )}
                                {item.note && (
                                    <div className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl">
                                        <Info className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">"{item.note}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Property Specs (Electronics / Subs) */}
                    {(item.brand || item.renewalDate || item.warrantyDate) && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black flex items-center gap-3">
                                {item.category === 'electronics' ? <Shield className="w-6 h-6 text-indigo-500" /> : <RefreshCw className="w-6 h-6 text-indigo-500" />}
                                {item.category === 'electronics' ? 'Thông tin kỹ thuật' : 'Thông tin đăng ký'}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {item.brand && (
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Thương hiệu</p>
                                        <p className="font-bold text-sm">{item.brand}</p>
                                    </div>
                                )}
                                {item.modelNumber && (
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Model</p>
                                        <p className="font-bold text-sm">{item.modelNumber}</p>
                                    </div>
                                )}
                                {item.warrantyDate && (
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Bảo hành tới</p>
                                        <p className="font-bold text-sm text-indigo-500">{new Date(item.warrantyDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                )}
                                {item.renewalDate && (
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Gia hạn tới</p>
                                        <p className="font-bold text-sm text-emerald-500">{new Date(item.renewalDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Batches Table */}
                    {item.batches && item.batches.length > 0 && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black flex items-center gap-3">
                                <Layers className="w-6 h-6 text-indigo-500" /> Lô sản phẩm (Batches)
                            </h4>
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-400">
                                            <th className="px-8 py-6">ID Lô</th>
                                            <th className="px-8 py-6">Số lượng</th>
                                            <th className="px-8 py-6">Hạn sử dụng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                                        {item.batches.map((batch: any, i: number) => (
                                            <tr key={i} className="hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                                                <td className="px-8 py-6 font-mono font-bold text-zinc-400">{batch.id || `BATCH-${i + 1}`}</td>
                                                <td className="px-8 py-6 font-black text-lg">{batch.quantity} {item.unit}</td>
                                                <td className="px-8 py-6 font-bold text-rose-500">{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'Bền lâu'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Technical Specs */}
                    {item.itemInfo && Object.keys(item.itemInfo).length > 0 && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black flex items-center gap-3">
                                <Box className="w-6 h-6 text-emerald-500" /> Thông số kỹ thuật
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(item.itemInfo).map(([key, value]: [string, any]) => (
                                    <div key={key} className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{key}</p>
                                        <p className="font-bold text-sm">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value, color }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                {icon} {label}
            </div>
            <div className={`font-black text-sm ${color || 'text-zinc-900 dark:text-white'}`}>{value}</div>
        </div>
    );
}
