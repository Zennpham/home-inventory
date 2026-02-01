'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MapPin, Check } from 'lucide-react';

interface Location {
    _id: string;
    name: string;
    nfcId: string;
    type: string;
    path?: string;
    pathSegments?: any[];
    parent?: string;
}

interface LocationTreeSelectorProps {
    locations: Location[];
    selectedId: string;
    onSelect: (locationId: string) => void;
    className?: string;
}

export default function LocationTreeSelector({ 
    locations, 
    selectedId, 
    onSelect,
    className = ''
}: LocationTreeSelectorProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Build tree structure
    const buildTree = () => {
        const locationMap = new Map(locations.map(loc => [loc._id, { ...loc, children: [] as any[] }]));
        const roots: any[] = [];

        locations.forEach(loc => {
            const node = locationMap.get(loc._id);
            if (!node) return;

            if (loc.parent && locationMap.has(loc.parent)) {
                const parent = locationMap.get(loc.parent);
                parent!.children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    const tree = buildTree();

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };

    const renderNode = (node: any, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expanded.has(node._id);
        const isSelected = selectedId === node._id;

        return (
            <div key={node._id}>
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' 
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={() => onSelect(node._id)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node._id);
                            }}
                            className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-4" />}
                    
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children.map((child: any) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 max-h-80 overflow-y-auto ${className}`}>
            {tree.length > 0 ? (
                tree.map(node => renderNode(node))
            ) : (
                <p className="text-center text-sm text-zinc-500 py-8">Không có vị trí nào</p>
            )}
        </div>
    );
}
