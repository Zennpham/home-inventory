'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit3,
    Package,
    MapPin,
    User,
    Tag,
    Layers,
    Info,
    CalendarDays,
    Clock,
    DollarSign,
    Zap,
    RefreshCw,
    Shield,
    ChevronRight,
    Home
} from 'lucide-react';
import Link from 'next/link';
import SemanticPath from '@/components/SemanticPath';

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
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!item) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-zinc-500 mb-4">Không tìm thấy món đồ này.</p>
                <Link href="/items" className="text-zinc-900 dark:text-white font-medium hover:underline">← Quay lại</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1200px] mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
                <SemanticPath segments={item.pathSegments || []} disableLinks={false} />
            </div>

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                            <Home className="w-5 h-5" />
                        </Link>
                        <Link href="/items" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">{item.name}</h1>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'in stock' ? 'bg-emerald-50 text-emerald-600' :
                                    item.status === 'out of stock' ? 'bg-rose-50 text-rose-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                    {item.status}
                                </span>
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full text-xs font-medium">
                                    {item.category}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/items/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:scale-105 transition-transform"
                    >
                        <Edit3 className="w-4 h-4" />
                        Sửa
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Image */}
                <div className="lg:col-span-4">
                    <div className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden mb-4">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-zinc-300" />
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                            <p className="text-xs text-zinc-500 mb-1">Số lượng</p>
                            <p className="text-2xl font-bold">{item.quantity} <span className="text-sm font-normal text-zinc-500">{item.unit}</span></p>
                        </div>
                        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                            <p className="text-xs text-zinc-500 mb-1">Tối thiểu</p>
                            <p className="text-2xl font-bold">{item.minStock}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Location */}
                    <div
                        onClick={() => router.push(`/location/${item.location?.nfcId}`)}
                        className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-white transition-colors cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Vị trí lưu trữ</p>
                                    <p className="font-semibold">{item.location?.name}</p>
                                    {item.location?.path && <p className="text-xs text-zinc-400 mt-0.5">{item.location.path}</p>}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-400" />
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                        <h3 className="text-sm font-semibold mb-4">Thông tin chi tiết</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow icon={<User className="w-4 h-4" />} label="Chủ sở hữu" value={item.owner || 'Chung'} />
                            <DetailRow icon={<CalendarDays className="w-4 h-4" />} label="Ngày mua" value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('vi-VN') : 'N/A'} />
                            <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Giá tiền" value={item.price ? `${item.price.toLocaleString('vi-VN')}đ` : 'N/A'} />
                            <DetailRow icon={<Tag className="w-4 h-4" />} label="Hạn sử dụng" value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'Không có'} />
                            <DetailRow icon={<Clock className="w-4 h-4" />} label="Kiểm tra cuối" value={item.lastChecked ? new Date(item.lastChecked).toLocaleDateString('vi-VN') : 'Chưa có'} />
                            {item.category === 'electronics' && item.maintenanceFrequency && (
                                <DetailRow icon={<Zap className="w-4 h-4" />} label="Bảo trì" value={`${item.maintenanceFrequency} ngày`} />
                            )}
                        </div>
                        {item.note && (
                            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <div className="flex gap-2">
                                    <Info className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">"{item.note}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Electronics Info */}
                    {(item.brand || item.warrantyDate) && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Thông tin kỹ thuật
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {item.brand && (
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">Thương hiệu</p>
                                        <p className="font-medium text-sm">{item.brand}</p>
                                    </div>
                                )}
                                {item.modelNumber && (
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">Model</p>
                                        <p className="font-medium text-sm">{item.modelNumber}</p>
                                    </div>
                                )}
                                {item.warrantyDate && (
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">Bảo hành tới</p>
                                        <p className="font-medium text-sm">{new Date(item.warrantyDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                )}
                                {item.renewalDate && (
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">Gia hạn tới</p>
                                        <p className="font-medium text-sm">{new Date(item.renewalDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Batches */}
                    {item.batches && item.batches.length > 0 && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Lô sản phẩm ({item.batches.length})
                            </h3>
                            <div className="space-y-2">
                                {item.batches.map((batch: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Lô #{i + 1}</p>
                                            <p className="text-xs text-zinc-500">{batch.id || `BATCH-${i + 1}`}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{batch.quantity} {item.unit}</p>
                                            <p className="text-xs text-zinc-500">
                                                {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'Bền lâu'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Specs */}
                    {item.itemInfo && Object.keys(item.itemInfo).length > 0 && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                            <h3 className="text-sm font-semibold mb-4">Thông số kỹ thuật</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(item.itemInfo).map(([key, value]: [string, any]) => (
                                    <div key={key} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                        <p className="text-xs text-zinc-500 mb-1">{key}</p>
                                        <p className="font-medium text-sm">{String(value)}</p>
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

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-medium text-sm">{value}</span>
        </div>
    );
}
