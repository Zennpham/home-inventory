import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

/**
 * GET /api/items/suggest?q=xxx
 * Returns items with similar names for autocomplete / duplicate prevention
 */
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (query.length < 2) {
            return NextResponse.json([]);
        }

        // Find items with similar names (fuzzy search)
        const items = await Item.find({
            name: { $regex: query, $options: 'i' }
        })
            .populate('location', 'name')
            .select('name quantity unit location')
            .limit(10)
            .lean();

        return NextResponse.json(items.map(item => ({
            _id: item._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            locationName: (item.location as any)?.name || 'Unknown'
        })));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
