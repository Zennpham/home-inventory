import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Missing barcode' }, { status: 400 });
        }

        await dbConnect();

        // 1. Check local DB first
        const localItem = await Item.findOne({ barcode: code }).lean();
        if (localItem) {
            return NextResponse.json({
                found: true,
                source: 'local',
                data: {
                    name: localItem.name,
                    category: localItem.category,
                    unit: localItem.unit,
                    brand: localItem.brand || '',
                    imageUrl: localItem.imageUrl || '',
                    note: localItem.note || ''
                }
            });
        }

        // 2. If not found locally, try Open Food Facts API (works well for supermarkets)
        const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        const offData = await offRes.json();

        if (offData.status === 1 && offData.product) {
            const product = offData.product;
            return NextResponse.json({
                found: true,
                source: 'openfoodfacts',
                data: {
                    name: product.product_name || product.product_name_en || product.generic_name || '',
                    brand: product.brands ? product.brands.split(',')[0] : '',
                    imageUrl: product.image_url || product.image_front_url || '',
                    category: 'food', // Defaulting to food for OFF
                    unit: product.quantity ? (product.quantity.includes('g') || product.quantity.includes('l') ? product.quantity : 'pcs') : 'pcs'
                }
            });
        }

        // TODO: Could also try UPCitemdb API here if OFF fails, but OFF is good for food.

        return NextResponse.json({ found: false });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
