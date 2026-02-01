'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, MapPin, Plus, Check, FolderOpen, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
    _id: string;
    name: string;
    type: string;
    parentId?: string | null;
    children?: Location[];
}

interface CascadingLocationPickerProps {
    locations: Location[];
    selectedId: string;
    onSelect: (id: string) => void;
    onAddLocation?: (parentId: string | null, name: string, type: string) => Promise<void>;
}

export default function CascadingLocationPicker({
    locations,
    selectedId,
    onSelect,
    onAddLocation
}: CascadingLocationPickerProps) {
    // 1. Reconstruct Tree Logic on client for reactivity
    const tree = useMemo(() => {
        const map = new Map<string, Location & { children: Location[] }>();
        locations.forEach(l => map.set(l._id, { ...l, children: [] }));

        const roots: Location[] = [];
        locations.forEach(l => {
            const node = map.get(l._id)!;
            // Handle parentId whether it's a string or populated object
            const parentId = typeof l.parentId === 'object' && l.parentId !== null
                ? (l.parentId as any)._id
                : l.parentId;

            if (parentId && map.has(parentId)) {
                map.get(parentId)!.children.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    }, [locations]);

    // 2. State for Columns (Path Logic)
    const [path, setPath] = useState<string[]>([]); // Array of Location IDs
    const [showAddModal, setShowAddModal] = useState<{ step: number, parentId: string | null } | null>(null);
    const [newLocName, setNewLocName] = useState('');
    const [newLocType, setNewLocType] = useState('shelf');

    // Auto-expand path based on selectedId
    useEffect(() => {
        if (!selectedId) return;

        const findPath = (nodes: any[], targetId: string, currentPath: string[]): string[] | null => {
            for (const node of nodes) {
                if (node._id === targetId) return [...currentPath, node._id];
                if (node.children?.length > 0) {
                    const res = findPath(node.children, targetId, [...currentPath, node._id]);
                    if (res) return res;
                }
            }
            return null;
        };

        const calculatedPath = findPath(tree, selectedId, []);
        if (calculatedPath) {
            // Keep the last item in path to show its siblings, but selecting it implies it's the active one
            // Actually, we want to show the columns leading UP TO the selected item, 
            // and the selected item's children in the next column (if any)
            setPath(calculatedPath);
        }
    }, [selectedId, tree]);

    // 3. Helper to get items for a specific column index
    const getColumnItems = (colIndex: number) => {
        if (colIndex === 0) return tree; // Root level
        const parentId = path[colIndex - 1];
        if (!parentId) return [];

        // Find parent in the whole list (easier than traversing tree sometimes)
        // But with tree memo, we can traverse
        const findNode = (nodes: any[], id: string): any => {
            for (const node of nodes) {
                if (node._id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const parent = findNode(tree, parentId);
        return parent ? parent.children : [];
    };

    const handleSelect = (node: any, level: number) => {
        // Update path: cut off anything after current level, add new selection
        const newPath = path.slice(0, level);
        newPath.push(node._id);
        setPath(newPath);
        onSelect(node._id);
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onAddLocation || !showAddModal) return;

        await onAddLocation(showAddModal.parentId, newLocName, newLocType);
        setShowAddModal(null);
        setNewLocName('');
    };

    // Render Columns
    // Determine how many columns to show: Path length + 1 (for next potential children)
    // We cap it at say 4 columns for UI sanity, or scroll horizontal
    const columnsCount = path.length + 1;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {Array.from({ length: columnsCount }).map((_, colIndex) => {
                    const items = getColumnItems(colIndex);
                    // If existing path [A, B], 
                    // Col 0: Roots. Selected: A.
                    // Col 1: Children of A. Selected: B.
                    // Col 2: Children of B. (Empty or not).

                    // Don't render empty columns if we are deep and there are no children, 
                    // UNLESS it's the first column (always empty list is sad) or we want to allow adding
                    if (colIndex > 0 && items.length === 0 && path.length < colIndex) return null;

                    const activeId = path[colIndex];
                    const parentId = colIndex === 0 ? null : path[colIndex - 1];

                    return (
                        <div key={colIndex} className="min-w-[200px] w-[200px] flex-shrink-0 flex flex-col h-64 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden snap-center">
                            <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50 text-xs font-bold uppercase text-zinc-400 flex justify-between items-center">
                                <span>Level {colIndex + 1}</span>
                                {onAddLocation && (
                                    <button
                                        onClick={() => setShowAddModal({ step: colIndex, parentId })}
                                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"
                                        title="Thêm vị trí mới tại đây"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {items.map((node: any) => {
                                    const isActive = activeId === node._id;
                                    return (
                                        <button
                                            key={node._id}
                                            onClick={() => handleSelect(node, colIndex)}
                                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${isActive
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            {node.type === 'room' ? <FolderOpen className="w-4 h-4 flex-shrink-0" /> : <Box className="w-4 h-4 flex-shrink-0" />}
                                            <span className="truncate flex-1 text-left font-medium">{node.name}</span>
                                            {node.children && node.children.length > 0 && (
                                                <ChevronRight className={`w-3 h-3 ${isActive ? 'text-indigo-200' : 'text-zinc-400'}`} />
                                            )}
                                        </button>
                                    );
                                })}
                                {items.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50">
                                        <p className="text-xs">Chưa có mục nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Add Popover/Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-4"
                        >
                            <h3 className="text-lg font-bold">Thêm vị trí mới</h3>
                            <form onSubmit={handleQuickAdd} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-zinc-400">Tên</label>
                                    <input
                                        autoFocus
                                        value={newLocName}
                                        onChange={e => setNewLocName(e.target.value)}
                                        className="w-full mt-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl font-bold border-none outline-none focus:ring-2 ring-indigo-500"
                                        placeholder="VD: Ngăn tủ 1..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-zinc-400">Loại</label>
                                    <select
                                        value={newLocType}
                                        onChange={e => setNewLocType(e.target.value)}
                                        className="w-full mt-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl font-bold border-none outline-none"
                                    >
                                        <option value="room">Phòng</option>
                                        <option value="cabinet">Tủ / Kệ</option>
                                        <option value="shelf">Ngăn</option>
                                        <option value="box">Hộp</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(null)}
                                        className="flex-1 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 p-3 rounded-xl bg-indigo-600 text-white font-bold"
                                    >
                                        Tạo ngay
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {path.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <MapPin className="w-3 h-3" />
                    Đã chọn: <span className="font-bold text-zinc-900 dark:text-white">
                        {locations.find(l => l._id === selectedId)?.name}
                    </span>
                </div>
            )}
        </div>
    );
}
