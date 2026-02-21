'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface RowData {
    name: string;
    quantity: string;
    unit: string;
    locationName: string;
    category: string;
    expiryDate: string;
    price: string;
    note: string;
}

const emptyRow: RowData = {
    name: '',
    quantity: '1',
    unit: 'cái',
    locationName: '',
    category: 'general',
    expiryDate: '',
    price: '',
    note: ''
};

const COLUMNS = [
    { key: 'name', label: 'Tên món đồ *', width: '200px' },
    { key: 'quantity', label: 'SL', width: '60px' },
    { key: 'unit', label: 'Đơn vị', width: '80px' },
    { key: 'locationName', label: 'Vị trí *', width: '140px' },
    { key: 'category', label: 'Danh mục', width: '120px' },
    { key: 'expiryDate', label: 'Hạn dùng', width: '120px' },
    { key: 'price', label: 'Giá (VND)', width: '100px' },
    { key: 'note', label: 'Ghi chú', width: '150px' },
];

const CATEGORIES = [
    { value: 'general', label: 'Đồ dùng chung' },
    { value: 'food', label: 'Thực phẩm' },
    { value: 'electronics', label: 'Điện tử' },
    { value: 'medical', label: 'Thuốc' },
    { value: 'clothing', label: 'Quần áo' },
    { value: 'tools', label: 'Dụng cụ' },
];

export default function BulkImportPage() {
    const [rows, setRows] = useState<RowData[]>([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [locationOptions, setLocationOptions] = useState<string[]>([]);

    // Fetch existing locations for autocomplete
    useEffect(() => {
        fetch('/api/locations')
            .then(res => res.json())
            .then(data => {
                const names = data.map((loc: any) => loc.name);
                setLocationOptions(names);
            })
            .catch(console.error);
    }, []);


    // Handle paste from Excel/Google Sheets
    const handlePaste = (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData.getData('text');
        if (!clipboardData) return;

        // Split by newlines and tabs
        const pastedRows = clipboardData.split('\n').filter(row => row.trim());

        if (pastedRows.length > 0) {
            e.preventDefault();
            const newRows: RowData[] = pastedRows.map(row => {
                const cells = row.split('\t');
                return {
                    name: cells[0]?.trim() || '',
                    quantity: cells[1]?.trim() || '1',
                    unit: cells[2]?.trim() || 'cái',
                    locationName: cells[3]?.trim() || '',
                    category: cells[4]?.trim() || 'general',
                    expiryDate: cells[5]?.trim() || '',
                    price: cells[6]?.trim() || '',
                    note: cells[7]?.trim() || ''
                };
            });
            setRows(newRows);
            setResult(null);
        }
    };

    const updateRow = (index: number, field: keyof RowData, value: string) => {
        setRows(prev => prev.map((row, i) =>
            i === index ? { ...row, [field]: value } : row
        ));
    };

    const addRow = () => {
        setRows(prev => [...prev, { ...emptyRow }]);
    };

    const removeRow = (index: number) => {
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleImport = async () => {
        // Filter out empty rows
        const validRows = rows.filter(row => row.name.trim() && row.locationName.trim());

        if (validRows.length === 0) {
            setResult({ success: false, message: 'Không có dữ liệu hợp lệ (cần ít nhất Tên + Vị trí)' });
            return;
        }

        setImporting(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: validRows.map(row => ({
                        name: row.name,
                        quantity: parseFloat(row.quantity) || 1,
                        unit: row.unit,
                        locationName: row.locationName,
                        category: row.category,
                        expiryDate: row.expiryDate || undefined,
                        price: parseFloat(row.price) || 0,
                        note: row.note || undefined
                    }))
                })
            });

            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, message: data.message });
                // Clear rows after successful import
                setRows([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
            } else {
                setResult({ success: false, message: data.error });
            }
        } catch (err: any) {
            setResult({ success: false, message: err.message });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <header className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Nhập liệu hàng loạt</h1>
                        <p className="text-sm text-zinc-500">Paste từ Excel/Google Sheets hoặc nhập trực tiếp</p>
                    </div>
                    <button
                        onClick={handleImport}
                        disabled={importing}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <Upload className="w-5 h-5" />
                        {importing ? 'Đang import...' : `Import ${rows.filter(r => r.name && r.locationName).length} dòng`}
                    </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-sm">
                    <strong>💡 Mẹo:</strong> Copy từ Excel/Sheets theo thứ tự cột:
                    <span className="font-mono ml-2">Tên | SL | Đơn vị | Vị trí | Danh mục | Hạn dùng | Giá | Ghi chú</span>
                    <br />
                    Rồi paste vào bảng bên dưới (Ctrl+V / Cmd+V)
                </div>
            </header>

            {/* Result Message */}
            {result && (
                <div className={`max-w-7xl mx-auto mb-4 p-4 rounded-lg flex items-center gap-3 ${result.success
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                    {result.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {result.message}
                </div>
            )}

            {/* Data Table */}
            <div className="max-w-7xl mx-auto overflow-x-auto">
                <table
                    className="w-full border-collapse text-sm"
                    onPaste={handlePaste}
                >
                    <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-900">
                            <th className="p-2 text-left w-8">#</th>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    className="p-2 text-left font-medium"
                                    style={{ minWidth: col.width }}
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="p-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <td className="p-2 text-zinc-400">{idx + 1}</td>

                                {/* Name */}
                                <td className="p-1">
                                    <input
                                        type="text"
                                        value={row.name}
                                        onChange={e => updateRow(idx, 'name', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none"
                                        placeholder="Tên..."
                                    />
                                </td>

                                {/* Quantity */}
                                <td className="p-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.quantity}
                                        onChange={e => updateRow(idx, 'quantity', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none text-center"
                                    />
                                </td>

                                {/* Unit */}
                                <td className="p-1">
                                    <input
                                        type="text"
                                        value={row.unit}
                                        onChange={e => updateRow(idx, 'unit', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none"
                                        placeholder="cái"
                                    />
                                </td>

                                {/* Location with autocomplete */}
                                <td className="p-1">
                                    <input
                                        type="text"
                                        list="location-options"
                                        value={row.locationName}
                                        onChange={e => updateRow(idx, 'locationName', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none"
                                        placeholder="Chọn hoặc nhập mới..."
                                    />
                                </td>


                                {/* Category */}
                                <td className="p-1">
                                    <select
                                        value={row.category}
                                        onChange={e => updateRow(idx, 'category', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </td>

                                {/* Expiry */}
                                <td className="p-1">
                                    <input
                                        type="date"
                                        value={row.expiryDate}
                                        onChange={e => updateRow(idx, 'expiryDate', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none"
                                    />
                                </td>

                                {/* Price */}
                                <td className="p-1">
                                    <input
                                        type="number"
                                        value={row.price}
                                        onChange={e => updateRow(idx, 'price', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none text-right"
                                        placeholder="0"
                                    />
                                </td>

                                {/* Note */}
                                <td className="p-1">
                                    <input
                                        type="text"
                                        value={row.note}
                                        onChange={e => updateRow(idx, 'note', e.target.value)}
                                        className="w-full px-2 py-1.5 border border-transparent hover:border-zinc-300 focus:border-zinc-500 rounded bg-transparent outline-none"
                                        placeholder="Ghi chú..."
                                    />
                                </td>

                                {/* Delete */}
                                <td className="p-1">
                                    <button
                                        onClick={() => removeRow(idx)}
                                        className="p-1 text-zinc-400 hover:text-rose-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Add Row */}
                <button
                    onClick={addRow}
                    className="mt-2 flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Thêm dòng
                </button>
            </div>

            {/* Location autocomplete options */}
            <datalist id="location-options">
                {locationOptions.map(name => (
                    <option key={name} value={name} />
                ))}
            </datalist>
        </div>
    );
}

