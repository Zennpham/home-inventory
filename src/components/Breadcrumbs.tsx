'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
    items: Array<{
        label: string;
        href?: string;
    }>;
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
            <Link href="/" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-indigo-500 transition-colors font-medium">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-bold text-zinc-900 dark:text-white">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
