'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ItemForm from '@/components/ItemForm';

export default function EditItemPage() {
    const router = useRouter();
    const { id } = useParams();
    const [locations, setLocations] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [locRes, itemRes] = await Promise.all([
                    fetch('/api/locations'),
                    fetch(`/api/items/${id}`)
                ]);
                const locData = await locRes.json();
                const itemData = await itemRes.json();
                setLocations(locData);
                setInitialData(itemData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleSubmit = async (formData: any) => {
        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                router.push('/items');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <ItemForm
            initialData={initialData}
            locations={locations}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
        />
    );
}
