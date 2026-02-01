'use client';

import React, { useState, useEffect } from 'react';
import { Check, Plus, Minus, Save, MapPin, Package } from 'lucide-react';

export default function AuditMode() {
    const [locations, setLocations] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [auditState, setAuditState] = useState<Record<string, { qty: number, checked: boolean }>>({});

    useEffect(() => {
        async function fetchData() {
            const [locRes, itemRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/items')
            ]);
            const locData = await locRes.json();
            const itemData = await itemRes.json();
            setLocations(locData);
            setItems(itemData);

            const initialState: Record<string, { qty: number, checked: boolean }> = {};
            itemData.forEach((item: any) => {
                initialState[item._id] = { qty: item.quantity, checked: false };
            });
            setAuditState(initialState);
            setLoading(false);
        }
        fetchData();
    }, []);

    const updateQty = (itemId: string, delta: number) => {
        setAuditState(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], qty: Math.max(0, prev[itemId].qty + delta), checked: true }
        }));
    };

    const saveAudit = async () => {
        const checkedItems = Object.entries(auditState)
            .filter(([_, state]) => state.checked)
            .map(([id, state]) => ({ id, quantity: state.qty }));

        if (checkedItems.length === 0) {
            alert('Chưa có thay đổi nào');
            return;
        }

        setLoading(true);
        await Promise.all(checkedItems.map(item =>
            fetch(`/api/items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: item.quantity, lastChecked: new Date() })
            })
        ));

        window.location.reload();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const filteredItems = items.filter(item =>
        !selectedLocation || (item.location?._id || item.location) === selectedLocation
    );

    const progress = Math.round((Object.values(auditState).filter(s => s.checked).length / items.length) * 100);

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1000px] mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Kiểm kê kho</h1>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-zinc-500">Tiến độ: {progress}%</p>
                    <div className="flex-1 max-w-xs h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-900 dark:bg-white transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={selectedLocation || ''}
                    onChange={(e) => setSelectedLocation(e.target.value || null)}
                    className="px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                >
                    <option value="">Tất cả vị trí</option>
                    {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))}
                </select>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6">
                {filteredItems.map(item => (
                    <div
                        key={item._id}
                        className={`p-4 border rounded-xl transition-all ${
                            auditState[item._id]?.checked
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                                : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-zinc-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{item.name}</p>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {item.location?.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQty(item._id, -1)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-bold">
                                    {auditState[item._id]?.qty}
                                </span>
                                <button
                                    onClick={() => updateQty(item._id, 1)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {auditState[item._id]?.checked && (
                                <Check className="w-5 h-5 text-emerald-600" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="sticky bottom-4">
                <button
                    onClick={saveAudit}
                    disabled={Object.values(auditState).every(s => !s.checked)}
                    className="w-full px-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 font-bold shadow-lg"
                >
                    <Save className="w-5 h-5" />
                    Lưu kiểm kê ({Object.values(auditState).filter(s => s.checked).length} món)
                </button>
            </div>
        </div>
    );
}
