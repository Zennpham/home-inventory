'use client';

import React, { useState } from 'react';
import { Save, X, Camera, Barcode, MapPin, Plus, Minus, Calendar, DollarSign, User, Tag } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import CascadingLocationPicker from './CascadingLocationPicker';

interface ItemFormProps {
    initialData?: any;
    locations: any[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function ItemForm({ initialData, locations: initialLocations, onSubmit, onCancel }: ItemFormProps) {
    const [locations, setLocations] = useState(initialLocations);
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
        minStock: initialData?.minStock || 1,
        barcode: initialData?.barcode || '',
        imageUrl: initialData?.imageUrl || '',
        expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
        batches: initialData?.batches || [],
        brand: initialData?.brand || '',
        modelNumber: initialData?.modelNumber || '',
        warrantyDate: initialData?.warrantyDate ? new Date(initialData.warrantyDate).toISOString().split('T')[0] : '',
        maintenanceFrequency: initialData?.maintenanceFrequency || 0
    });

    const [showScanner, setShowScanner] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync locations from props
    React.useEffect(() => {
        if (initialLocations.length > 0) {
            setLocations(initialLocations);
        }
    }, [initialLocations]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleAddLocation = async (parentId: string | null, name: string, type: string) => {
        try {
            // Auto-generate a simple NFC ID for manual entries
            const nfcId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

            const res = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    parentId,
                    nfcId
                })
            });

            if (res.ok) {
                const newLoc = await res.json();
                setLocations(prev => [...prev, newLoc]);
                // Automatically select the new location if it was created at the current level?
                // Or just let the user continue. 
                // The picker will update because 'locations' state changed.
            }
        } catch (err) {
            console.error("Failed to add location", err);
        }
    };

    const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Compress image using Canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Max dimension (e.g. 800px)
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;

                    ctx?.drawImage(img, 0, 0, width, height);

                    // Convert to Base64 with quality 0.6
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                    setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">
                        {initialData ? 'Sửa món đồ' : 'Thêm món đồ'}
                    </h1>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Info */}
                <div className="space-y-6">
                    {/* Image URL or Camera */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Hình ảnh</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-3">
                                {/* Option 1: URL Input */}
                                <input
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="Dán URL ảnh hoặc chụp..."
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent text-sm"
                                />

                                {/* Option 2: Camera/Upload Button */}
                                <div className="flex gap-2">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors">
                                        <Camera className="w-4 h-4" />
                                        Chụp / Chọn ảnh
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment" // Prefer rear camera on mobile
                                            className="hidden"
                                            onChange={handleImageCapture}
                                        />
                                    </label>
                                    {formData.imageUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))}
                                            className="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Xóa ảnh
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="w-24 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                ) : (
                                    <Camera className="w-8 h-8 text-zinc-300" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên món đồ *</label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="VD: Sữa tươi TH True Milk"
                            className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                        />
                    </div>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Số lượng</label>
                            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, quantity: Math.max(0, p.quantity - 1) }))}
                                    className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="flex-1 text-center bg-transparent border-none outline-none font-bold text-lg"
                                    min="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
                                    className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Đơn vị</label>
                            <input
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="pcs, kg, lít..."
                                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Location with Cascading Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Vị trí lưu trữ *</label>
                        {showLocationPicker ? (
                            <div className="space-y-2">
                                <CascadingLocationPicker
                                    locations={locations}
                                    selectedId={formData.location}
                                    onSelect={(id) => setFormData(p => ({ ...p, location: id }))}
                                    onAddLocation={handleAddLocation}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLocationPicker(false)}
                                    className="text-sm text-indigo-500 font-bold hover:underline"
                                >
                                    Thu gọn
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowLocationPicker(true)}
                                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-900 dark:hover:border-white transition-colors text-left flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50"
                            >
                                <MapPin className="w-5 h-5 text-zinc-400" />
                                <span className="font-medium">
                                    {locations.find(l => l._id === formData.location)?.name || 'Chọn vị trí...'}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Danh mục</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 appearance-none border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                >
                                    <option value="general">General</option>
                                    <option value="food">Food</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="medical">Medical</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="tools">Tools</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M1 1L5 5L9 1" /></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Trạng thái</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 appearance-none border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                >
                                    <option value="in stock">In Stock</option>
                                    <option value="out of stock">Out of Stock</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M1 1L5 5L9 1" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barcode */}
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Barcode className="w-4 h-4" />
                            Mã vạch (tùy chọn)
                        </label>
                        <div className="flex gap-2">
                            <input
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                placeholder="Quét hoặc nhập mã..."
                                className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform"
                            >
                                Quét
                            </button>
                        </div>
                    </div>

                    {/* Expiry Date (for food) */}
                    {formData.category === 'food' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Hạn sử dụng <span className="text-rose-500">*</span></label>
                            <input
                                required
                                name="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                            />
                        </div>
                    )}

                    {/* Electronics Fields */}
                    {formData.category === 'electronics' && (
                        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Thương hiệu</label>
                                    <input
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="Samsung, Apple..."
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Model</label>
                                    <input
                                        name="modelNumber"
                                        value={formData.modelNumber}
                                        onChange={handleChange}
                                        placeholder="S24 Ultra..."
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Hạn bảo hành</label>
                                <input
                                    name="warrantyDate"
                                    type="date"
                                    value={formData.warrantyDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Additional Details - Collapsible */}
                    <details className="border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <summary className="px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium">
                            Thông tin bổ sung (tùy chọn)
                        </summary>
                        <div className="p-4 space-y-4 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Chủ sở hữu
                                    </label>
                                    <input
                                        name="owner"
                                        value={formData.owner}
                                        onChange={handleChange}
                                        placeholder="Ngân, Chung..."
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <DollarSign className="w-4 h-4 inline mr-1" />
                                        Giá (VNĐ)
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Ngày mua
                                    </label>
                                    <input
                                        name="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tối thiểu</label>
                                    <input
                                        name="minStock"
                                        type="number"
                                        value={formData.minStock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Thông tin thêm..."
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-transparent resize-none"
                                />
                            </div>
                        </div>
                    </details>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
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
