'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Edit3, Package, MapPin, User, Tag, Layers, Info,
    CalendarDays, Clock, DollarSign, Zap, Shield, ChevronRight,
    Globe, Share2, Minus, Plus, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import SemanticPath from '@/components/SemanticPath';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ItemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    const togglePublish = async () => {
        setIsPublishing(true);
        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: !item.isPublic })
            });
            if (res.ok) {
                setItem({ ...item, isPublic: !item.isPublic });
            }
        } catch (e) { console.error(e) }
        finally { setIsPublishing(false) }
    };

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/item/${id}` : '';
    const qrUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}` : '';

    useEffect(() => {
        fetch(`/api/items/${id}`)
            .then(res => res.json())
            .then(setItem)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const [isAdjusting, setIsAdjusting] = useState(false);

    const adjustQuantity = async (delta: number) => {
        if (!item || isAdjusting) return;
        setIsAdjusting(true);
        const newQty = Math.max(0, item.quantity + delta);
        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty, historyNote: delta > 0 ? 'Thêm' : 'Lấy ra' })
            });
            if (res.ok) {
                const updated = await res.json();
                setItem(updated);
            }
        } catch (e) { console.error(e) } finally { setIsAdjusting(false) }
    };

    if (loading) return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                    <div className="w-48 h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="w-32 h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="w-16 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                <div className="col-span-2 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />)}
                </div>
            </div>
            {[1, 2, 3].map(i => <div key={i} className="w-full h-24 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />)}
        </div>
    );

    if (!item) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                <p className="text-xs text-zinc-500 mb-2">Không tìm thấy</p>
                <Link href="/items" className="text-xs text-blue-600 hover:underline">← Quay lại</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
            {/* Breadcrumb */}
            {item.pathSegments && <div className="mb-3"><SemanticPath segments={item.pathSegments} disableLinks={false} /></div>}

            {/* Header */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Link href="/items" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black">{item.name}</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.status === 'in stock' ? 'bg-emerald-100 text-emerald-600' : item.status === 'out of stock' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                }`}>{item.status}</span>
                            <span className="text-[10px] text-zinc-500">{item.category}</span>
                        </div>
                    </div>
                </div>
                <Link href={`/items/${id}/edit`} className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Sửa
                </Link>
            </header>

            {/* Image & Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden col-span-1">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-zinc-300" /></div>
                    )}
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                    {/* Quantity with inline adjust */}
                    <div className="col-span-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] text-zinc-500 mb-1">Số lượng hiện tại</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => adjustQuantity(-1)}
                                disabled={isAdjusting || item.quantity <= 0}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 disabled:opacity-40 transition-colors shrink-0"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <p className="text-2xl font-black flex-1 text-center">{item.quantity}<span className="text-sm font-normal text-zinc-400 ml-1">{item.unit}</span></p>
                            <button
                                onClick={() => adjustQuantity(1)}
                                disabled={isAdjusting}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 disabled:opacity-40 transition-colors shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                        <p className="text-[10px] text-zinc-500">Tối thiểu</p>
                        <p className="text-xl font-black">{item.minStock}</p>
                    </div>
                    <div className={`p-3 rounded-xl border text-center ${item.quantity <= item.minStock ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'}`}>
                        <p className="text-[10px] text-zinc-500">Trạng thái</p>
                        <p className={`text-xs font-black mt-0.5 ${item.quantity <= item.minStock ? 'text-red-600' : 'text-emerald-600'}`}>{item.quantity <= item.minStock ? '⚠ Sắp hết' : '✓ Đủ hàng'}</p>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div
                onClick={() => router.push(`/location/${item.location?.nfcId}`)}
                className="p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl mb-4 flex items-center gap-2 cursor-pointer"
            >
                <MapPin className="w-4 h-4 text-blue-600" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.location?.name}</p>
                    {item.location?.path && <p className="text-[10px] text-blue-600/70 truncate">{item.location.path}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
            </div>

            {/* Publish & QR Code Section */}
            <section className={`p-3 rounded-xl border mb-4 transition-colors ${item.isPublic ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1 ${item.isPublic ? 'text-emerald-600' : 'text-zinc-500'}`}>
                            {item.isPublic ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {item.isPublic ? 'Đang công khai' : 'Riêng tư'}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {item.isPublic ? 'Bất kỳ ai quét mã QR cũng có thể xem.' : 'Món đồ này chỉ hiển thị với người trong gia đình.'}
                        </p>
                    </div>
                    <button
                        onClick={togglePublish}
                        disabled={isPublishing}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${item.isPublic ? 'bg-white dark:bg-emerald-900/50 text-rose-500 border border-emerald-100 dark:border-emerald-800' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    >
                        {isPublishing ? 'Đang lưu...' : (item.isPublic ? 'Ẩn đi' : <><Share2 className="w-3.5 h-3.5" /> Publish QR</>)}
                    </button>
                </div>

                {item.isPublic && qrUrl && (
                    <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
                            <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
                        </div>
                        <p className="text-[10px] text-zinc-500 text-center mb-2">In mã QR này và dán lên món đồ của bạn.</p>
                        <div className="flex items-center gap-4 mt-2">
                            <a href={qrUrl} target="_blank" download="qr-code.png" rel="noopener noreferrer" className="text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
                                Lưu QR
                            </a>
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                Xem trước public <ChevronRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}
            </section>

            {/* Details */}
            <section className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4">
                <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Chi tiết</p>
                <div className="space-y-2">
                    <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Chủ sở hữu" value={item.owner || 'Chung'} />
                    <DetailRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Ngày mua" value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('vi-VN') : '—'} />
                    <DetailRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Giá" value={item.price ? `${item.price.toLocaleString('vi-VN')}đ` : '—'} />
                    <DetailRow icon={<Tag className="w-3.5 h-3.5" />} label="Hạn sử dụng" value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '—'} />
                    <DetailRow icon={<Clock className="w-3.5 h-3.5" />} label="Kiểm tra cuối" value={item.lastChecked ? new Date(item.lastChecked).toLocaleDateString('vi-VN') : '—'} />
                    {item.maintenanceFrequency && <DetailRow icon={<Zap className="w-3.5 h-3.5" />} label="Bảo trì" value={`${item.maintenanceFrequency} ngày`} />}
                </div>
                {item.note && (
                    <div className="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex gap-2">
                        <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">"{item.note}"</p>
                    </div>
                )}
            </section>

            {/* Technical Info */}
            {(item.brand || item.warrantyDate) && (
                <section className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Kỹ thuật</p>
                    <div className="grid grid-cols-2 gap-2">
                        {item.brand && <InfoBox label="Thương hiệu" value={item.brand} />}
                        {item.modelNumber && <InfoBox label="Model" value={item.modelNumber} />}
                        {item.warrantyDate && <InfoBox label="Bảo hành" value={new Date(item.warrantyDate).toLocaleDateString('vi-VN')} />}
                        {item.renewalDate && <InfoBox label="Gia hạn" value={new Date(item.renewalDate).toLocaleDateString('vi-VN')} />}
                    </div>
                </section>
            )}

            {/* Batches */}
            {item.batches?.length > 0 && (
                <section className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1"><Layers className="w-3 h-3" /> Lô ({item.batches.length})</p>
                    <div className="space-y-1.5">
                        {item.batches.map((batch: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                <div>
                                    <p className="text-xs font-medium">Lô #{i + 1}</p>
                                    <p className="text-[10px] text-zinc-500">{batch.id || `BATCH-${i + 1}`}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{batch.quantity} {item.unit}</p>
                                    <p className="text-[10px] text-zinc-500">{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'Bền lâu'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Custom Fields */}
            {item.itemInfo && Object.keys(item.itemInfo).length > 0 && (
                <section className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Thông số</p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(item.itemInfo).map(([key, value]: [string, any]) => (
                            <InfoBox key={key} label={key} value={String(value)} />
                        ))}
                    </div>
                </section>
            )}
            {/* Quantity History Chart */}
            {item.quantityHistory?.length > 1 && (
                <section className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Biểu đồ tiêu thụ
                        <span className="ml-auto text-zinc-400 font-normal normal-case">{item.quantityHistory.length} lần cập nhật</span>
                    </p>
                    <ResponsiveContainer width="100%" height={140}>
                        <LineChart data={item.quantityHistory.slice(-20).map((h: any) => ({
                            qty: h.qty,
                            date: new Date(h.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#a1a1aa' }} />
                            <YAxis tick={{ fontSize: 9, fill: '#a1a1aa' }} width={28} />
                            <Tooltip
                                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e4e4e7', padding: '4px 8px' }}
                                labelStyle={{ fontWeight: 700 }}
                                itemStyle={{ color: '#18181b' }}
                            />
                            <ReferenceLine y={item.minStock} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Min', fill: '#ef4444', fontSize: 9, position: 'right' }} />
                            <Line
                                type="monotone"
                                dataKey="qty"
                                name="Số lượng"
                                stroke="#18181b"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#18181b', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#18181b' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            )}

        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">{icon}<span>{label}</span></div>
            <span className="text-xs font-medium">{value}</span>
        </div>
    );
}

function InfoBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-[10px] text-zinc-500">{label}</p>
            <p className="text-xs font-medium truncate">{value}</p>
        </div>
    );
}
