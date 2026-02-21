'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, X, Info, Settings, Type, Hash, Calendar, List, CheckSquare } from 'lucide-react';
import Link from 'next/link';

interface CustomField {
    fieldName: string;
    label: string;
    fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: string[];
    required: boolean;
}

interface Category {
    _id: string;
    name: string;
    icon: string;
    color: string;
    defaultFields: CustomField[];
    parentId?: string;
}

const FIELD_TYPES = [
    { type: 'text', icon: Type, label: 'Văn bản' },
    { type: 'number', icon: Hash, label: 'Số' },
    { type: 'date', icon: Calendar, label: 'Ngày tháng' },
    { type: 'select', icon: List, label: 'Danh sách' },
    { type: 'boolean', icon: CheckSquare, label: 'Đúng/Sai' },
];

export default function CategoryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategory();
    }, [id]);

    async function fetchCategory() {
        try {
            const res = await fetch(`/api/categories/${id}`);
            setCategory(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    const handleSave = async () => {
        if (!category) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                    defaultFields: category.defaultFields
                })
            });
            if (res.ok) fetchCategory();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const addField = () => {
        if (!category) return;
        const newField: CustomField = {
            fieldName: `field_${Date.now()}`,
            label: 'Trường mới',
            fieldType: 'text',
            required: false
        };
        setCategory({ ...category, defaultFields: [...category.defaultFields, newField] });
    };

    const removeField = (index: number) => {
        if (!category) return;
        const newFields = [...category.defaultFields];
        newFields.splice(index, 1);
        setCategory({ ...category, defaultFields: newFields });
    };

    const updateField = (index: number, updates: Partial<CustomField>) => {
        if (!category) return;
        const newFields = [...category.defaultFields];
        newFields[index] = { ...newFields[index], ...updates };
        setCategory({ ...category, defaultFields: newFields });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div></div>;
    if (!category) return <div className="text-center py-20"><p className="text-zinc-500">Không tìm thấy danh mục</p></div>;

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Link href="/categories" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black">Cài đặt danh mục</h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{category.name}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </header>

            <div className="space-y-4">
                {/* Basic Info */}
                <section className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-xs font-black uppercase text-zinc-400 mb-3 flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" /> Thông tin cơ bản
                    </h2>
                    <div className="flex gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500">Icon</label>
                            <input
                                value={category.icon}
                                onChange={e => setCategory({ ...category, icon: e.target.value })}
                                className="w-12 h-12 text-2xl text-center bg-zinc-50 dark:bg-zinc-800 rounded-xl"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500">Tên danh mục</label>
                            <input
                                value={category.name}
                                onChange={e => setCategory({ ...category, name: e.target.value })}
                                className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* Custom Fields */}
                <section className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> Trường tùy chỉnh
                        </h2>
                        <button onClick={addField} className="text-[10px] font-black text-blue-600 uppercase hover:underline">
                            + Thêm trường
                        </button>
                    </div>

                    <div className="space-y-3">
                        {category.defaultFields.map((field, idx) => (
                            <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50 relative group">
                                <button
                                    onClick={() => removeField(idx)}
                                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>

                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase">Nhãn hiển thị</label>
                                        <input
                                            value={field.label}
                                            onChange={e => updateField(idx, { label: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg text-xs font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase">Loại dữ liệu</label>
                                        <select
                                            value={field.fieldType}
                                            onChange={e => updateField(idx, { fieldType: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg text-xs font-bold"
                                        >
                                            {FIELD_TYPES.map(f => <option key={f.type} value={f.type}>{f.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={e => updateField(idx, { required: e.target.checked })}
                                            className="rounded"
                                        />
                                        Bắt buộc nhập
                                    </label>
                                    <div className="flex-1">
                                        <input
                                            placeholder="Tên biến (key...)"
                                            value={field.fieldName}
                                            onChange={e => updateField(idx, { fieldName: e.target.value })}
                                            className="w-full px-2 py-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {category.defaultFields.length === 0 && (
                            <div className="text-center py-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                                <Info className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Chưa có trường tùy chỉnh nào</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <footer className="mt-8 text-center">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    Mọi thay đổi sẽ áp dụng cho tất cả đồ vật thuộc danh mục này
                </p>
            </footer>
        </div>
    );
}
