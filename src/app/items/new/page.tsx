'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItemForm from '@/components/ItemForm';

export default function NewItemPage() {
    const router = useRouter();
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        fetch('/api/locations')
            .then(res => res.json())
            .then(data => setLocations(data));
    }, []);

    const handleSubmit = async (formData: any) => {
        try {
            const res = await fetch('/api/items', {
                method: 'POST',
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

    return (
        <ItemForm
            locations={locations}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
        />
    );
}
