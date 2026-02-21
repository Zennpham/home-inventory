import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

export async function GET() {
    try {
        await dbConnect();

        // Fetch all items with price and value info
        const items = await Item.find({}).lean();

        const stats = {
            totalPurchaseValue: 0,
            totalCurrentValue: 0,
            byOwner: {} as Record<string, { purchase: number, current: number, count: number }>,
            byCategory: {} as Record<string, { purchase: number, current: number, count: number }>,
            topValueItems: [] as any[]
        };

        items.forEach((item: any) => {
            const purchase = (item.purchasePrice || 0) * (item.quantity || 1);
            const current = (item.currentValue || item.purchasePrice || 0) * (item.quantity || 1);
            const owner = item.owner || 'Chung';
            const category = item.category || 'general';

            stats.totalPurchaseValue += purchase;
            stats.totalCurrentValue += current;

            // Group by Owner
            if (!stats.byOwner[owner]) stats.byOwner[owner] = { purchase: 0, current: 0, count: 0 };
            stats.byOwner[owner].purchase += purchase;
            stats.byOwner[owner].current += current;
            stats.byOwner[owner].count += 1;

            // Group by Category
            if (!stats.byCategory[category]) stats.byCategory[category] = { purchase: 0, current: 0, count: 0 };
            stats.byCategory[category].purchase += purchase;
            stats.byCategory[category].current += current;
            stats.byCategory[category].count += 1;
        });

        // Get Top 5 most valuable items
        stats.topValueItems = items
            .map((i: any) => ({
                name: i.name,
                value: (i.currentValue || i.purchasePrice || 0) * (i.quantity || 1),
                _id: i._id
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return NextResponse.json({ success: true, stats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
