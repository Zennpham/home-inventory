'use client';

import React from 'react';

interface CustomFieldDef {
    fieldName: string;
    label: string;
    fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: string[];
    required: boolean;
    unit?: string;
    placeholder?: string;
}

interface DynamicFieldsInputProps {
    fields: CustomFieldDef[];
    values: Record<string, any>;
    onChange: (fieldName: string, value: any) => void;
}

export default function DynamicFieldsInput({ fields, values, onChange }: DynamicFieldsInputProps) {
    if (!fields || fields.length === 0) return null;

    return (
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Thông tin chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fields.map(field => (
                    <div key={field.fieldName} className="space-y-1">
                        <label className="block text-[10px] font-bold text-zinc-500 px-1">
                            {field.label}
                            {field.required && <span className="text-rose-500 ml-1">*</span>}
                            {field.unit && <span className="text-zinc-400 ml-1">({field.unit})</span>}
                        </label>

                        {field.fieldType === 'text' && (
                            <input
                                type="text"
                                value={values[field.fieldName] || ''}
                                onChange={e => onChange(field.fieldName, e.target.value)}
                                placeholder={field.placeholder || '...'}
                                required={field.required}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                        )}

                        {field.fieldType === 'number' && (
                            <input
                                type="number"
                                value={values[field.fieldName] || ''}
                                onChange={e => onChange(field.fieldName, parseFloat(e.target.value) || 0)}
                                placeholder={field.placeholder || '0'}
                                required={field.required}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                        )}

                        {field.fieldType === 'date' && (
                            <input
                                type="date"
                                value={values[field.fieldName] ? new Date(values[field.fieldName]).toISOString().split('T')[0] : ''}
                                onChange={e => onChange(field.fieldName, e.target.value)}
                                required={field.required}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                            />
                        )}

                        {field.fieldType === 'select' && (
                            <select
                                value={values[field.fieldName] || ''}
                                onChange={e => onChange(field.fieldName, e.target.value)}
                                required={field.required}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                            >
                                <option value="">Chọn...</option>
                                {field.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}

                        {field.fieldType === 'boolean' && (
                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                                <input
                                    type="checkbox"
                                    checked={values[field.fieldName] || false}
                                    onChange={e => onChange(field.fieldName, e.target.checked)}
                                    className="w-4 h-4 rounded text-zinc-900"
                                />
                                <span className="text-xs font-medium">{field.placeholder || 'Đúng'}</span>
                            </label>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
