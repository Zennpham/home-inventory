'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Copy, Check, Users, X, Save } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface FamilyMember {
    _id: string;
    name: string;
    permissions: {
        canAddItems: boolean;
        canEditItems: boolean;
        canDeleteItems: boolean;
        canManageLocations: boolean;
    };
    shareLink?: string;
}

export default function FamilyPage() {
    const { role } = useUser();
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        permissions: { canAddItems: true, canEditItems: false, canDeleteItems: false, canManageLocations: false }
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchMembers(); }, []);

    async function fetchMembers() {
        try {
            const res = await fetch('/api/family');
            setMembers(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch('/api/family', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMember)
        });
        if (res.ok) {
            const data = await res.json();
            setMembers([...members, data]);
            setNewMember({ name: '', permissions: { canAddItems: true, canEditItems: false, canDeleteItems: false, canManageLocations: false } });
            setShowForm(false);
        }
    }

    function copyLink(link: string, id: string) {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                    <p className="text-sm text-zinc-500 mb-3">Chỉ Admin mới có quyền truy cập</p>
                    <Link href="/" className="text-xs text-blue-600 hover:underline">Quay về</Link>
                </div>
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
                        <h1 className="text-lg font-black">Quản lý Gia đình</h1>
                        <p className="text-xs text-zinc-500">{members.length} thành viên</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" /> Thêm
                </button>
            </header>

            {/* Members */}
            <div className="space-y-2">
                {loading ? (
                    <p className="text-center py-8 text-xs text-zinc-500">Đang tải...</p>
                ) : members.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                        <p className="text-xs text-zinc-500">Chưa có thành viên</p>
                    </div>
                ) : members.map(member => (
                    <div key={member._id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{member.name}</span>
                            <div className="flex items-center gap-1 text-[9px]">
                                {member.permissions.canAddItems && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">Thêm</span>}
                                {member.permissions.canEditItems && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Sửa</span>}
                                {member.permissions.canDeleteItems && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">Xóa</span>}
                            </div>
                        </div>
                        {member.shareLink && (
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    value={member.shareLink}
                                    readOnly
                                    className="flex-1 px-2 py-1.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded-lg font-mono"
                                />
                                <button onClick={() => copyLink(member.shareLink!, member._id)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                                    {copiedId === member._id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black">Thêm thành viên</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Tên *</label>
                                <input
                                    required
                                    value={newMember.name}
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                    placeholder="Mẹ, Ba, Em..."
                                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block">Quyền hạn</label>
                                <div className="space-y-2">
                                    {[
                                        { key: 'canAddItems', label: 'Thêm đồ' },
                                        { key: 'canEditItems', label: 'Sửa đồ' },
                                        { key: 'canDeleteItems', label: 'Xóa đồ' },
                                        { key: 'canManageLocations', label: 'Quản lý vị trí' }
                                    ].map(perm => (
                                        <label key={perm.key} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newMember.permissions[perm.key as keyof typeof newMember.permissions]}
                                                onChange={e => setNewMember({
                                                    ...newMember,
                                                    permissions: { ...newMember.permissions, [perm.key]: e.target.checked }
                                                })}
                                                className="rounded"
                                            />
                                            {perm.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                                    <Save className="w-4 h-4" /> Tạo & Lấy link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
