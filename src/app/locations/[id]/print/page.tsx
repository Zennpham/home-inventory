'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Layers, Package, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function LocationPrintPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [targetLoc, setTargetLoc] = useState<any>(null);
    const [subLocations, setSubLocations] = useState<any[]>([]);
    const [containedItems, setContainedItems] = useState<any[]>([]);
    const [printSettings, setPrintSettings] = useState({
        showLocationSelf: true,
        showSubLocations: true,
        showItems: true,
        labelSize: 'medium' // small, medium, large
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locsRes, itemsRes] = await Promise.all([
                    fetch('/api/locations'),
                    fetch('/api/items')
                ]);
                const allLocs = await locsRes.json();
                const allItems = await itemsRes.json();

                const rootLoc = allLocs.find((l: any) => l._id === id);
                if (!rootLoc) {
                    setLoading(false);
                    return;
                }

                // Find all sub-locations recursively
                const getSubs = (parentId: string): any[] => {
                    const children = allLocs.filter((l: any) =>
                        (typeof l.parentId === 'object' ? l.parentId?._id : l.parentId) === parentId
                    );
                    let result = [...children];
                    for (const child of children) {
                        result = [...result, ...getSubs(child._id)];
                    }
                    return result;
                };

                const subs = getSubs(id as string);

                // Filter items that have this loc or its subs in their pathSegments
                const itemsInLoc = allItems.filter((item: any) =>
                    item.pathSegments && item.pathSegments.some((seg: any) => seg.id === id)
                );

                setTargetLoc(rootLoc);
                setSubLocations(subs);
                setContainedItems(itemsInLoc);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center print:hidden">
            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!targetLoc) return (
        <div className="min-h-screen flex items-center justify-center print:hidden p-4">
            <p className="text-zinc-500">Không tìm thấy vị trí.</p>
        </div>
    );

    const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const renderLabel = (title: string, subtitle: string, url: string, type: 'location' | 'item', icon: any) => {
        const encodeUrl = encodeURIComponent(url);
        const qrSize = printSettings.labelSize === 'small' ? '80x80' :
            printSettings.labelSize === 'medium' ? '120x120' : '150x150';

        const sizeClasses = {
            small: 'w-32 h-20',
            medium: 'w-48 h-28',
            large: 'w-64 h-36'
        };

        const IconComponent = icon;

        if (type === 'location') {
            return (
                <div className={`border-[1.5px] border-solid border-zinc-800 rounded-md bg-white flex flex-row items-stretch overflow-hidden shrink-0 ${sizeClasses[printSettings.labelSize as keyof typeof sizeClasses]} break-inside-avoid print:border-black`} style={{ pageBreakInside: 'avoid' }}>
                    <div className="w-5 md:w-6 bg-zinc-800 print:bg-black text-white flex items-center justify-center shrink-0">
                        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="uppercase font-black text-[7px] md:text-[8px] tracking-widest flex items-center gap-1">
                            {/* <IconComponent className="w-2.5 h-2.5 mb-1 text-white print:text-white" /> */}
                            KHU VỰC
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center p-2 min-w-0">
                        <div className={`font-black tracking-tight text-zinc-900 leading-tight line-clamp-3 break-words ${printSettings.labelSize === 'small' ? 'text-[11px]' : printSettings.labelSize === 'medium' ? 'text-sm' : 'text-base'}`}>
                            {title}
                        </div>
                    </div>
                    <div className="p-1 h-full shrink-0 flex items-center">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeUrl}`}
                            alt="QR Khu vực"
                            className="h-full aspect-square object-contain mix-blend-multiply"
                        />
                    </div>
                </div>
            );
        }

        // ITEM LAYOUT
        return (
            <div className={`border border-dashed border-zinc-400 p-1.5 md:p-2 rounded-lg bg-white flex flex-row items-center overflow-hidden shrink-0 ${sizeClasses[printSettings.labelSize as keyof typeof sizeClasses]} break-inside-avoid print:border-black`} style={{ pageBreakInside: 'avoid' }}>
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeUrl}`}
                    alt="QR Vật dụng"
                    className="h-full aspect-square object-contain shrink-0 mix-blend-multiply"
                />
                <div className="flex flex-col justify-start pl-2 min-w-0 flex-1 h-full pt-0.5">
                    <div className="flex items-center gap-1 text-zinc-500 mb-0.5 shrink-0">
                        <Package className="w-2.5 h-2.5 print:text-black shrink-0" />
                        <span className="text-[7px] uppercase font-bold print:text-black truncate">VẬT DỤNG</span>
                    </div>
                    <div className={`font-black tracking-tight text-zinc-900 leading-tight line-clamp-3 break-words ${printSettings.labelSize === 'small' ? 'text-[9px]' : printSettings.labelSize === 'medium' ? 'text-xs' : 'text-sm'}`}>
                        {title}
                    </div>
                    {subtitle && (
                        <div className={`text-zinc-600 font-medium line-clamp-2 break-words leading-tight mt-auto pt-0.5 print:text-zinc-800 border-t border-dashed border-zinc-200 print:border-zinc-400 ${printSettings.labelSize === 'small' ? 'text-[7px]' : 'text-[9px]'}`}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 print:bg-white print:p-0">
            {/* Control Panel - Hidden in print */}
            <div className="max-w-4xl mx-auto p-4 md:p-8 print:hidden">
                <header className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black">In mã QR quản lý</h1>
                            <p className="text-xs text-zinc-500">Khu vực: <span className="font-bold text-zinc-900">{targetLoc.name}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        <Printer className="w-4 h-4" /> In tất cả
                    </button>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8 space-y-6">
                    <div>
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2 border-b pb-2">
                            Tùy chọn hiển thị thẻ <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full font-medium">Bấm để chỉnh</span>
                        </h2>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <input type="checkbox" checked={printSettings.showLocationSelf} onChange={e => setPrintSettings({ ...printSettings, showLocationSelf: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                                <span className="group-hover:text-zinc-600">Thẻ vị trí gốc ({targetLoc.name})</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <input type="checkbox" checked={printSettings.showSubLocations} onChange={e => setPrintSettings({ ...printSettings, showSubLocations: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                                <span className="group-hover:text-zinc-600">Thẻ các vị trí con ({subLocations.length})</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer group">
                                <input type="checkbox" checked={printSettings.showItems} onChange={e => setPrintSettings({ ...printSettings, showItems: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                                <span className="group-hover:text-zinc-600">Thẻ các món đồ ({containedItems.length})</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold mb-3 border-b pb-2">Kích thước nhãn dán (Label Size)</h2>
                        <div className="flex gap-3">
                            {(['small', 'medium', 'large'] as const).map(size => (
                                <button
                                    key={size}
                                    onClick={() => setPrintSettings({ ...printSettings, labelSize: size })}
                                    className={`px-4 py-2 flex-1 rounded-xl text-xs font-bold capitalize transition-all border ${printSettings.labelSize === size ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                                >
                                    {size === 'small' ? 'Nhỏ (1.5x1 inch)' : size === 'medium' ? 'Vừa (2x1.5 inch)' : 'Lớn (3x2 inch)'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Area - Shown strictly during printing and preview */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 pb-24 print:max-w-none print:w-[210mm] print:mx-auto print:px-0 print:pb-0 font-sans">

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { margin: 10mm; size: A4; }
                        body { background: white; -webkit-print-color-adjust: exact; }
                        .print-grid { display: grid; gap: 4mm; grid-template-columns: repeat(auto-fill, minmax(40mm, 1fr)); align-content: start;}
                    }
                `}} />

                <div className="print-grid flex flex-wrap gap-4 print:gap-2 content-start items-start">

                    {printSettings.showLocationSelf && (
                        renderLabel(
                            targetLoc.name,
                            targetLoc.nfcId,
                            `${originUrl}/location/${targetLoc.nfcId}`,
                            'location',
                            MapPin
                        )
                    )}

                    {printSettings.showSubLocations && subLocations.map(loc => (
                        <React.Fragment key={loc._id}>
                            {renderLabel(
                                loc.name,
                                loc.nfcId,
                                `${originUrl}/location/${loc.nfcId}`,
                                'location',
                                Layers
                            )}
                        </React.Fragment>
                    ))}

                    {printSettings.showItems && containedItems.map(item => (
                        <React.Fragment key={item._id}>
                            {renderLabel(
                                item.name,
                                `${item.quantity} ${item.unit} ${item.location?.name ? `• ${item.location.name}` : ''}`,
                                item.isPublic ? `${originUrl}/public/item/${item._id}` : `${originUrl}/items/${item._id}`,
                                'item',
                                Package
                            )}
                        </React.Fragment>
                    ))}

                </div>
            </div>
        </div>
    );
}
