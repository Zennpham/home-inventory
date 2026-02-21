'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, Edit, Save, X } from 'lucide-react';
import { usePermission } from '@/contexts/UserContext';

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
    children?: Category[];
}

const colorOptions = ['zinc', 'emerald', 'blue', 'rose', 'amber', 'purple', 'pink', 'indigo'];

export default function CategoriesPage() {
    const canManage = usePermission('canManageLocations');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [showForm, setShowForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', color: 'zinc' });

    useEffect(() => { fetchCategories(); }, []);

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories');
            setCategories(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function seedCategories() {
        await fetch('/api/categories/seed', { method: 'POST' });
        fetchCategories();
    }

    async function handleAddCategory(e: React.FormEvent) {
        e.preventDefault();
        await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCategory)
        });
        setNewCategory({ name: '', icon: '📦', color: 'zinc' });
        setShowForm(false);
        fetchCategories();
    }

    function toggleExpand(id: string) {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function renderCategory(cat: Category, depth = 0) {
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expandedIds.has(cat._id);

        return (
            <div key={cat._id} style={{ marginLeft: depth * 12 }}>
                <div className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group">
                    {hasChildren ? (
                        <button onClick={() => toggleExpand(cat._id)} className="p-0.5">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                    ) : <div className="w-4" />}
                    <span className="text-base">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{cat.name}</span>
                        {cat.defaultFields.length > 0 && (
                            <span className="ml-1.5 text-[10px] text-zinc-500">{cat.defaultFields.length} trường</span>
                        )}
                    </div>
                    <Link href={`/categories/${cat._id}`} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">
                        <Edit className="w-3.5 h-3.5" />
                    </Link>
                </div>
                {hasChildren && isExpanded && (
                    <div className="mt-0.5">{cat.children!.map(child => renderCategory(child, depth + 1))}</div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black">Danh mục</h1>
                        <p className="text-xs text-zinc-500">{categories.length} danh mục</p>
                    </div>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Thêm
                    </button>
                )}
            </header>

            {/* Categories */}
            {loading ? (
                <p className="text-center py-8 text-xs text-zinc-500">Đang tải...</p>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-3">Chưa có danh mục nào</p>
                    <button onClick={seedCategories} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                        Tạo mặc định
                    </button>
                </div>
            ) : (
                <div className="space-y-1">{categories.map(cat => renderCategory(cat))}</div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black">Thêm danh mục</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    value={newCategory.icon}
                                    onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                                    className="w-12 text-center text-lg px-2 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800"
                                    placeholder="📦"
                                />
                                <input
                                    required
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                    placeholder="Tên danh mục..."
                                />
                            </div>
                            <select
                                value={newCategory.color}
                                onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                            >
                                {colorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
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
