'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Camera, Barcode, MapPin, Plus, Minus, Calendar, DollarSign, User, Tag } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import CascadingLocationPicker from './CascadingLocationPicker';
import DynamicFieldsInput from './DynamicFieldsInput';

interface CustomFieldDef {
    fieldName: string;
    label: string;
    fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: string[];
    required: boolean;
    unit?: string;
    placeholder?: string;
}

interface CategoryOption {
    _id: string;
    name: string;
    icon: string;
    defaultFields: CustomFieldDef[];
}

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
        subcategory: initialData?.subcategory || '',
        owner: initialData?.owner || '',
        purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
        purchasePrice: initialData?.purchasePrice || initialData?.price || 0,
        currentValue: initialData?.currentValue || 0,
        condition: initialData?.condition || 'good',
        status: initialData?.status || 'active',
        note: initialData?.note || '',
        minStock: initialData?.minStock || 1,
        barcode: initialData?.barcode || '',
        imageUrls: initialData?.imageUrls || (initialData?.imageUrl ? [initialData.imageUrl] : []),
        expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
        warrantyDate: initialData?.warrantyDate ? new Date(initialData.warrantyDate).toISOString().split('T')[0] : '',
        serialNumber: initialData?.serialNumber || '',
        brand: initialData?.brand || '',
        modelNumber: initialData?.modelNumber || '',
        tags: initialData?.tags || []
    });

    const [showScanner, setShowScanner] = useState(false);
    const [isScanningStatus, setIsScanningStatus] = useState('');
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiStatus, setAiStatus] = useState('');
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(
        initialData?.customFields ? Object.fromEntries(initialData.customFields) : {}
    );
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dynamicAiFields, setDynamicAiFields] = useState<CustomFieldDef[]>([]);


    // Sync locations from props
    React.useEffect(() => {
        if (initialLocations.length > 0) {
            setLocations(initialLocations);
        }
    }, [initialLocations]);

    // Fetch categories
    useEffect(() => {
        fetch('/api/categories?flat=true')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error);
    }, []);

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
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? img.height * scaleSize : img.height;
                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

                    setFormData(prev => ({
                        ...prev,
                        imageUrls: [...prev.imageUrls, compressedBase64]
                    }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const runMagicAi = async () => {
        if (formData.imageUrls.length === 0) return;

        setIsAnalyzing(true);
        setAiStatus('Magic AI đang phân tích dữ liệu đa phương thức...');
        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: formData.imageUrls })
            });
            const data = await res.json();
            console.log('Magic AI Global Result:', data);

            if (data.success && data.analysis) {
                const { core, category_specific } = data.analysis;

                // Update Core Fields
                setFormData(prev => ({
                    ...prev,
                    name: prev.name || core.name,
                    category: core.category,
                    subcategory: core.subcategory,
                    unit: prev.unit === 'pcs' ? core.unit : prev.unit,
                    condition: core.condition,
                    status: core.status,
                    purchasePrice: prev.purchasePrice || core.purchase_price,
                    currentValue: prev.currentValue || core.current_value,
                    expiryDate: core.expiry_date || prev.expiryDate,
                    warrantyDate: core.warranty_expiry || prev.warrantyDate,
                    serialNumber: prev.serialNumber || core.serial_number,
                    tags: Array.from(new Set([...prev.tags, ...(core.tags || [])]))
                }));

                // Process extra fields from category specific
                if (category_specific && Object.keys(category_specific).length > 0) {
                    const newFields: CustomFieldDef[] = Object.keys(category_specific).map(key => ({
                        fieldName: `ai_${key}`,
                        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        fieldType: typeof category_specific[key] === 'number' ? 'number' : 'text',
                        required: false
                    }));
                    setDynamicAiFields(newFields);

                    const newValues: Record<string, any> = {};
                    Object.keys(category_specific).forEach(key => {
                        newValues[`ai_${key}`] = category_specific[key];
                    });
                    setCustomFieldValues(prev => ({ ...prev, ...newValues }));
                }
                setAiStatus('✨ AI đã khớp mọi thông tin!');
            }
        } catch (err) {
            console.error("AI Analysis failed", err);
            setAiStatus('AI bận rồi, hãy điền tay nhé.');
        } finally {
            setTimeout(() => { setIsAnalyzing(false); setAiStatus(''); }, 3000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Include customFields as a plain object
            await onSubmit({
                ...formData,
                customFields: customFieldValues
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBarcodeScan = async (code: string) => {
        setFormData(p => ({ ...p, barcode: code }));
        setShowScanner(false);
        setIsScanningStatus('Đang tìm thông tin mã vạch...');

        try {
            const res = await fetch(`/api/items/barcode?code=${code}`);
            if (res.ok) {
                const result = await res.json();
                if (result.found && result.data) {
                    const { name, category, unit, brand, imageUrl, note, price } = result.data;
                    setFormData(p => ({
                        ...p,
                        name: p.name || name || '',
                        category: (p.category === 'general' && category) ? category : p.category,
                        unit: (p.unit === 'pcs' && unit) ? unit : p.unit,
                        brand: p.brand || brand || '',
                        imageUrls: p.imageUrls.length === 0 && imageUrl ? [imageUrl] : p.imageUrls,
                        note: p.note || note || '',
                        purchasePrice: p.purchasePrice || price || 0
                    }));
                    setIsScanningStatus(`Sắp xếp tự động thành công (từ ${result.source === 'local' ? 'kho dữ liệu' : 'Internet'}).`);
                } else {
                    setIsScanningStatus('Mã mới, hãy điền tay nhé!');
                }
            } else {
                setIsScanningStatus('Mã vạch đã được lưu.');
            }
        } catch (e) {
            console.error(e);
            setIsScanningStatus('Mã vạch đã được lưu.');
        } finally {
            setTimeout(() => setIsScanningStatus(''), 5000);
        }
    };

    // Get current category's custom fields
    const selectedCategory = categories.find(c => c._id === formData.category);
    const currentFields = selectedCategory?.defaultFields || [];

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
                    {/* Multiple Image Gallery */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Hình ảnh ({formData.imageUrls.length})</label>
                            {formData.imageUrls.length > 0 && (
                                <button
                                    type="button"
                                    onClick={runMagicAi}
                                    disabled={isAnalyzing}
                                    className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:scale-105 transition-transform"
                                >
                                    <span className="text-sm">✨</span> MAGIC ANALYZE
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <label className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-400 transition-colors">
                                <Camera className="w-5 h-5 text-zinc-400" />
                                <span className="text-[10px] mt-1 font-bold text-zinc-500">THÊM ẢNH</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleImageCapture}
                                />
                            </label>
                            {formData.imageUrls.map((url: string, idx: number) => (
                                <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 group">
                                    <img src={url} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, imageUrls: p.imageUrls.filter((_: any, i: number) => i !== idx) }))}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence>
                            {aiStatus && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="mt-3 px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-500/20 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-xs font-bold">{aiStatus}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Name with Autocomplete */}
                    {/* Name & Subcategory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Tên món đồ *</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={(e) => {
                                    handleChange(e);
                                    const query = e.target.value;
                                    if (query.length >= 2) {
                                        fetch(`/api/items/suggest?q=${encodeURIComponent(query)}`)
                                            .then(res => res.json())
                                            .then((data: any[]) => setSuggestions(data))
                                            .catch(() => setSuggestions([]));
                                    } else {
                                        setSuggestions([]);
                                    }
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="VD: Sữa tươi TH True Milk"
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                                autoComplete="off"
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    <div className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                                        ⚠️ Đã có món đồ tương tự:
                                    </div>
                                    {suggestions.map((item: { _id: string; name: string; quantity: number; unit: string }) => (
                                        <button
                                            key={item._id}
                                            type="button"
                                            onClick={() => window.location.href = `/items/${item._id}`}
                                            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between items-center"
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-xs text-zinc-500">{item.quantity} {item.unit}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Phân loại phụ</label>
                            <input
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                placeholder="VD: Ít đường, 1L..."
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                        </div>
                    </div>


                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Số lượng</label>
                            <div className="flex items-stretch bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, quantity: Math.max(0, p.quantity - 1) }))}
                                    className="px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="flex-1 min-w-0 text-center bg-transparent border-none outline-none font-bold py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
                                    className="px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Đơn vị</label>
                            <input
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="cái, kg, lít..."
                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
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

                    {/* Professional Category & Core Fields */}
                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Danh mục chính</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                                >
                                    <option value="general">Khác / Chung</option>
                                    <option value="food">🍎 Thực phẩm</option>
                                    <option value="electronics">📱 Điện tử</option>
                                    <option value="medical">💊 Y tế / Thuốc</option>
                                    <option value="clothing">👕 Quần áo</option>
                                    <option value="tools">🔧 Dụng cụ</option>
                                    <option value="vehicle">🏍️ Xe cộ</option>
                                    <option value="collectible">🎨 Đồ sưu tầm</option>
                                    <option value="furniture">🛋️ Nội thất</option>
                                    <option value="books">📚 Sách</option>
                                    <option value="pet">🐾 Thú cưng</option>
                                    <option value="document">🧾 Giấy tờ</option>
                                    <option value="cosmetic">🧴 Mỹ phẩm</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Tình trạng</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                                >
                                    <option value="new">🆕 Mới 100%</option>
                                    <option value="good">✨ Còn tốt</option>
                                    <option value="used">🕒 Đã dùng</option>
                                    <option value="damaged">⚠️ Hư hỏng</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Giá mua (VNĐ)</label>
                                <input
                                    name="purchasePrice"
                                    type="number"
                                    value={formData.purchasePrice}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 px-1 mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm"
                                >
                                    <option value="active">🟢 Đang sử dụng</option>
                                    <option value="consumed">🔴 Đã hết / Dùng xong</option>
                                    <option value="lost">⚪ Thất lạc</option>
                                    <option value="sold">💰 Đã bán</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Custom Fields (Category + AI) */}
                    {(currentFields.length > 0 || dynamicAiFields.length > 0) && (
                        <DynamicFieldsInput
                            fields={[...currentFields, ...dynamicAiFields]}
                            values={customFieldValues}
                            onChange={(fieldName, value) =>
                                setCustomFieldValues(prev => ({ ...prev, [fieldName]: value }))
                            }
                        />
                    )}

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
                        {isScanningStatus && (
                            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                {isScanningStatus}
                            </p>
                        )}
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
                                        Giá mua (VNĐ)
                                    </label>
                                    <input
                                        name="purchasePrice"
                                        type="number"
                                        value={formData.purchasePrice}
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
                    onScan={handleBarcodeScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
