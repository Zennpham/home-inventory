'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    X,
    Camera,
    Barcode,
    Calendar,
    MapPin,
    Tag,
    Package,
    Plus,
    Minus,
    AlertCircle,
    Info,
    User,
    CreditCard,
    DollarSign,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BarcodeScanner from './BarcodeScanner';

interface ItemFormProps {
    initialData?: any;
    locations: any[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function ItemForm({ initialData, locations, onSubmit, onCancel }: ItemFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        quantity: initialData?.quantity || 1,
        unit: initialData?.unit || 'pcs',
        location: initialData?.location?._id || initialData?.location || '',
        category: initialData?.category || 'general',
        owner: initialData?.owner || '',
        purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
        price: initialData?.price || 0,
        status: initialData?.status || 'in stock',
        note: initialData?.note || '',
        itemInfo: initialData?.itemInfo ? JSON.stringify(initialData.itemInfo, null, 2) : '',
        minStock: initialData?.minStock || 1,
        barcode: initialData?.barcode || '',
        imageUrl: initialData?.imageUrl || '',
        batches: initialData?.batches || [],
        brand: initialData?.brand || '',
        modelNumber: initialData?.modelNumber || '',
        warrantyDate: initialData?.warrantyDate ? new Date(initialData.warrantyDate).toISOString().split('T')[0] : '',
        maintenanceFrequency: initialData?.maintenanceFrequency || 0
    });

    const [showScanner, setShowScanner] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'batches' | 'advanced'>('basic');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const addBatch = () => {
        setFormData(prev => ({
            ...prev,
            batches: [...prev.batches, { id: Math.random().toString(36).substr(2, 9), quantity: 1, expiryDate: '', lastChecked: new Date() }]
        }));
    };

    const updateBatch = (index: number, field: string, value: any) => {
        const newBatches = [...formData.batches];
        newBatches[index] = { ...newBatches[index], [field]: value };
        setFormData(prev => ({ ...prev, batches: newBatches }));
    };

    const removeBatch = (index: number) => {
        setFormData(prev => ({ ...prev, batches: prev.batches.filter((_: any, i: number) => i !== index) }));
    };

    const handleQuantityChange = (delta: number) => {
        setFormData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity + delta) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                itemInfo: formData.itemInfo ? JSON.parse(formData.itemInfo) : {}
            };
            await onSubmit(submissionData);
        } catch (err) {
            console.error('Invalid JSON in itemInfo');
            // fallback if JSON fails
            await onSubmit({ ...formData, itemInfo: {} });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-screen">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black">{initialData ? 'Chỉnh sửa' : 'Thêm mới'} <span className="gradient-text">Món đồ</span></h2>
                        <p className="text-zinc-500 font-medium">Hệ thống kho gia đình thông minh.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl hover:bg-zinc-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
                    {(['basic', 'batches', 'advanced'] as const).map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-zinc-800 shadow-md text-indigo-500' : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            {tab === 'basic' ? 'Cơ bản' : tab === 'batches' ? 'Lô sản phẩm' : 'Nâng cao'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'basic' && (
                        <motion.div
                            key="basic"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            {/* Visuals */}
                            <div className="space-y-8">
                                <div className="aspect-square rounded-[48px] bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden group">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-8">
                                            <Camera className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                            <p className="text-sm font-black text-zinc-400">Chưa có ảnh</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" className="px-8 py-3 bg-white text-black rounded-2xl font-black text-sm">Chỉnh sửa ảnh</button>
                                    </div>
                                </div>

                                <div className="glass-card p-8 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                            <Barcode className="w-4 h-4" /> Mã vạch sản phẩm
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowScanner(true)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md"
                                        >
                                            Quét mã
                                        </button>
                                    </div>
                                    <input
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        placeholder="Nhập thủ công hoặc quét..."
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Tên món đồ</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full text-2xl font-black bg-zinc-50 dark:bg-zinc-900 border-none rounded-[28px] py-5 px-8 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Tên sản phẩm..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Số lượng hiện tại</label>
                                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-1">
                                            <button type="button" onClick={() => handleQuantityChange(-1)} className="p-4 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all"><Minus className="w-5 h-5" /></button>
                                            <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full text-center bg-transparent border-none font-black text-2xl outline-none" />
                                            <button type="button" onClick={() => handleQuantityChange(1)} className="p-4 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all"><Plus className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Đơn vị</label>
                                        <input name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Vị trí lưu trữ</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
                                        <select
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none"
                                        >
                                            <option value="">Chọn vị trí...</option>
                                            {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.path || loc.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Danh mục & Trạng thái</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={(e) => {
                                                handleChange(e);
                                                // Reset sub-category fields when category changes for clean state
                                                if (e.target.value !== 'electronics') {
                                                    setFormData(prev => ({ ...prev, brand: '', modelNumber: '', warrantyDate: '', maintenanceFrequency: 0 }));
                                                }
                                            }}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                        >
                                            {['food', 'electronics', 'general', 'medical', 'clothing', 'tools'].map(cat => (
                                                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold">
                                            {['in stock', 'out of stock', 'reserved', 'critical', 'damaged'].map(st => (
                                                <option key={st} value={st}>{st.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Conditional Electronics Section */}
                                {formData.category === 'electronics' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400">Thương hiệu</label>
                                                <input name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-3 px-4 font-bold" placeholder="Samsung, Apple..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400">Model</label>
                                                <input name="modelNumber" value={formData.modelNumber} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-3 px-4 font-bold" placeholder="S24 Ultra..." />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400">Hạn bảo hành</label>
                                                <input name="warrantyDate" type="date" value={formData.warrantyDate} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-3 px-4 font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400">Bảo trì (ngày)</label>
                                                <input name="maintenanceFrequency" type="number" value={formData.maintenanceFrequency} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-3 px-4 font-bold" placeholder="365" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'batches' && (
                        <motion.div
                            key="batches"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black">Các lô sản phẩm <span className="text-indigo-500">(Batches)</span></h3>
                                <button type="button" onClick={addBatch} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Plus className="w-6 h-6" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.batches.map((batch: any, index: number) => (
                                    <div key={batch.id || index} className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 space-y-4 relative group">
                                        <button type="button" onClick={() => removeBatch(index)} className="absolute top-6 right-6 p-2 bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"><X className="w-5 h-5" /></button>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Layers className="w-6 h-6 text-indigo-500" />
                                            <span className="font-black text-sm uppercase tracking-widest text-zinc-400">Lô #{index + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400">Số lượng</label>
                                                <input type="number" value={batch.quantity} onChange={(e) => updateBatch(index, 'quantity', e.target.value)} className="w-full bg-white dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 font-black text-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-zinc-400">Hạn sử dụng</label>
                                                <input type="date" value={batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => updateBatch(index, 'expiryDate', e.target.value)} className="w-full bg-white dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-xs font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {formData.batches.length === 0 && (
                                    <div className="col-span-full py-20 bg-zinc-50 dark:bg-zinc-900 rounded-[48px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-500">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">Đồ vật này chưa được chia lô.</p>
                                        <p className="text-xs">Nếu mỗi đợt mua có hạn dùng khác nhau, hãy thêm lô để quản lý.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'advanced' && (
                        <motion.div
                            key="advanced"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><User className="w-4 h-4" /> Chủ sở hữu (Owner)</label>
                                        <input name="owner" value={formData.owner} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Tên người quản lý..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày mua</label>
                                            <input name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-4 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Giá (VNĐ)</label>
                                            <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-4 font-bold" placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Cảnh báo tối thiểu (Min stock)</label>
                                        <input name="minStock" type="number" value={formData.minStock} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 outline-none font-black text-xl" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Info className="w-4 h-4" /> Ghi chú</label>
                                        <textarea name="note" value={formData.note} onChange={handleChange} rows={4} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-3xl py-4 px-6 outline-none font-medium text-sm" placeholder="Mọi thông tin bổ sung khác..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Layers className="w-4 h-4" /> Thông số kỹ thuật (JSON)</label>
                                        <textarea
                                            name="itemInfo"
                                            value={formData.itemInfo}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-3xl py-4 px-6 outline-none font-mono text-[10px]"
                                            placeholder='{"color": "white", "voltage": "220V"}'
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="flex flex-col md:flex-row gap-4 pt-12 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-zinc-950 dark:bg-white text-white dark:text-black py-7 rounded-[32px] font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                        {isSubmitting ? 'Đang lưu...' : <><Save className="w-8 h-8" /> Xác nhận & Lưu kho</>}
                    </button>
                    <button type="button" onClick={onCancel} className="md:w-64 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 py-7 rounded-[32px] font-bold hover:bg-zinc-200 transition-all">Quay lại</button>
                </div>
            </form>

            {showScanner && (
                <BarcodeScanner
                    onScan={(code) => {
                        setFormData(p => ({ ...p, barcode: code }));
                        setShowScanner(false);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
