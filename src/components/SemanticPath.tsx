'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Package } from 'lucide-react';

export interface PathSegment {
    name: string;
    id: string;
    type: 'location' | 'item';
    nfcId?: string;
}

interface SemanticPathProps {
    segments: PathSegment[];
    className?: string;
    showIcon?: boolean;
    disableLinks?: boolean;
}

export default function SemanticPath({ segments, className = '', showIcon = true, disableLinks = false }: SemanticPathProps) {
    return (
        <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 ${className}`}>
            {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                const linkHref = segment.type === 'item'
                    ? `/items/${segment.id}`
                    : `/location/${segment.nfcId || segment.id}`;

                const content = (
                    <>
                        {showIcon && index === 0 && (
                            <MapPin className="w-2.5 h-2.5 opacity-50" />
                        )}
                        {showIcon && isLast && segment.type === 'item' && (
                            <Package className="w-2.5 h-2.5" />
                        )}
                        {segment.name}
                    </>
                );

                const baseClasses = `flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-all
                    ${isLast
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md'
                        : disableLinks ? 'text-zinc-500' : 'text-zinc-500 hover:text-indigo-500 hover:scale-105 active:scale-95'
                    }`;

                return (
                    <div key={`${segment.id}-${index}`} className="flex items-center gap-1.5 flex-shrink-0">
                        {index > 0 && (
                            <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
                        )}

                        {disableLinks ? (
                            <span className={baseClasses}>
                                {content}
                            </span>
                        ) : (
                            <Link href={linkHref} className={baseClasses}>
                                {content}
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Utility to convert flat location string and ID into a simple link if full segments aren't available.
 * Use for quick updates before API overhaul is complete.
 */
export function SimplePath({ name, path, id, nfcId, type = 'location' }: { name: string, path?: string, id: string, nfcId?: string, type?: 'location' | 'item' }) {
    if (!path) {
        return <SemanticPath segments={[{ name, id, nfcId, type }]} />;
    }

    // Rough parsing if API segments aren't ready
    const parts = path.split(' > ');
    const segments: PathSegment[] = parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        return {
            name: part,
            id: isLast ? id : '', // We don't have parent IDs in the string, but clicking the last one works
            nfcId: isLast ? nfcId : '',
            type: (isLast && type === 'item') ? 'item' : 'location'
        };
    });

    return <SemanticPath segments={segments} />;
}
