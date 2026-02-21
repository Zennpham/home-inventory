'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Users, X, Save, KeyRound, Eye, EyeOff, Trash2, RefreshCw, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyMember {
    _id: string;
    name: string;
    pin?: string;
    permissions: {
        canAddItems: boolean;
        canEditItems: boolean;
        canDeleteItems: boolean;
        canManageLocations: boolean;
    };
}

const PERMS = [
    { key: 'canAddItems', label: 'Thêm đồ', color: 'emerald' },
    { key: 'canEditItems', label: 'Sửa đồ', color: 'blue' },
    { key: 'canDeleteItems', label: 'Xóa đồ', color: 'rose' },
    { key: 'canManageLocations', label: 'Quản lý vị trí', color: 'violet' },
];

function generatePin() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

export default function FamilyPage() {
    const { role } = useUser();
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newMember, setNewMember] = useState({
        name: '',
        pin: generatePin(),
        permissions: { canAddItems: true, canEditItems: false, canDeleteItems: false, canManageLocations: false }
    });
    const [editingPinId, setEditingPinId] = useState<string | null>(null);
    const [newPin, setNewPin] = useState('');
    const [showPins, setShowPins] = useState<Record<string, boolean>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => { fetchMembers(); }, []);

    async function fetchMembers() {
        setLoading(true);
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
            await fetchMembers();
            setNewMember({ name: '', pin: generatePin(), permissions: { canAddItems: true, canEditItems: false, canDeleteItems: false, canManageLocations: false } });
            setShowForm(false);
        }
    }

    async function handleUpdatePin(memberId: string) {
        if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) return;
        setSavingId(memberId);
        try {
            await fetch(`/api/family/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: newPin })
            });
            setMembers(ms => ms.map(m => m._id === memberId ? { ...m, pin: newPin } : m));
            setEditingPinId(null);
            setNewPin('');
        } catch (err) { console.error(err); }
        finally { setSavingId(null); }
    }

    async function handleDelete(memberId: string) {
        if (!confirm('Xóa thành viên này?')) return;
        await fetch(`/api/family/${memberId}`, { method: 'DELETE' });
        setMembers(ms => ms.filter(m => m._id !== memberId));
    }

    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                    <p className="text-sm text-zinc-500 mb-3">Chỉ Admin mới có quyền truy cập</p>
                    <Link href="/" className="text-xs text-blue-600 hover:underline">Quay về</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black">Quản lý thành viên</h1>
                        <p className="text-xs text-zinc-500">{members.length} thành viên — quản lý PIN đăng nhập</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Thêm
                </button>
            </header>

            {/* Admin PIN section */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">PIN Admin</p>
                </div>
                <p className="text-xs text-indigo-600/70 dark:text-indigo-400">Đặt biến môi trường <code className="font-mono bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">ADMIN_PIN</code> trên Vercel để thay đổi PIN Admin. Mặc định: <code className="font-mono bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">0000</code></p>
            </div>

            {/* Members list */}
            <div className="space-y-3">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />)
                ) : members.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <Users className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
                        <p className="text-sm font-medium text-zinc-500">Chưa có thành viên</p>
                        <p className="text-xs text-zinc-400 mt-1">Tạo PIN cho từng người trong gia đình</p>
                    </div>
                ) : members.map(member => (
                    <motion.div
                        key={member._id}
                        layout
                        className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-black">{member.name}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {PERMS.filter(p => member.permissions[p.key as keyof typeof member.permissions]).map(p => (
                                        <span key={p.key} className={`px-1.5 py-0.5 text-[9px] font-bold rounded bg-${p.color}-100 text-${p.color}-700 dark:bg-${p.color}-950/40 dark:text-${p.color}-400`}>{p.label}</span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(member._id)} className="p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* PIN section */}
                        <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="text-[10px] uppercase font-bold text-zinc-500">PIN đăng nhập</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {member.pin && (
                                        <button
                                            onClick={() => setShowPins(s => ({ ...s, [member._id]: !s[member._id] }))}
                                            className="p-1 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showPins[member._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setEditingPinId(member._id); setNewPin(''); }}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Đổi PIN
                                    </button>
                                </div>
                            </div>

                            {member.pin && (
                                <div className="mt-2">
                                    {showPins[member._id] ? (
                                        <div className="flex gap-2">
                                            {member.pin.split('').map((d, i) => (
                                                <div key={i} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl text-lg font-black shadow-sm">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl">
                                                    <div className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-500 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {editingPinId === member._id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]{4}"
                                        maxLength={4}
                                        value={newPin}
                                        onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="Nhập PIN mới (4 số)"
                                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleUpdatePin(member._id)}
                                        disabled={newPin.length !== 4 || savingId === member._id}
                                        className="px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {savingId === member._id ? '...' : 'Lưu'}
                                    </button>
                                    <button onClick={() => setEditingPinId(null)} className="p-2 text-zinc-400 hover:text-zinc-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {!member.pin && editingPinId !== member._id && (
                                <p className="text-[10px] text-zinc-400 mt-2 italic">Chưa có PIN — bấm Đổi PIN để tạo</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black">Thêm thành viên</h2>
                                <button onClick={() => setShowForm(false)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1.5 block">Tên *</label>
                                    <input
                                        required
                                        value={newMember.name}
                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                        placeholder="Mẹ, Ba, Em Gái..."
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1.5 block">PIN đăng nhập (4 số)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={newMember.pin}
                                            onChange={e => setNewMember({ ...newMember, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                            className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewMember({ ...newMember, pin: generatePin() })}
                                            className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl"
                                            title="Tạo ngẫu nhiên"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block">Quyền hạn</label>
                                    <div className="space-y-2">
                                        {PERMS.map(perm => (
                                            <label key={perm.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newMember.permissions[perm.key as keyof typeof newMember.permissions]}
                                                    onChange={e => setNewMember({
                                                        ...newMember,
                                                        permissions: { ...newMember.permissions, [perm.key]: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded"
                                                />
                                                {perm.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm">
                                        Hủy
                                    </button>
                                    <button type="submit" className="flex-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                                        <Save className="w-4 h-4" /> Tạo thành viên
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
