import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Activity from '@/models/Activity';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { itemIds, targetLocationId } = await request.json();

        if (!itemIds || !Array.isArray(itemIds) || !targetLocationId) {
            return NextResponse.json({ error: 'Missing itemIds or targetLocationId' }, { status: 400 });
        }

        // Perform bulk update
        const result = await Item.updateMany(
            { _id: { $in: itemIds } },
            { $set: { location: targetLocationId } }
        );

        // Log activities for each item
        const logPromises = itemIds.map(id =>
            Activity.create({
                itemId: id,
                type: 'update',
                amount: 0,
                timestamp: new Date(),
                note: `Bulk move to location ${targetLocationId}`
            })
        );
        await Promise.all(logPromises);

        return NextResponse.json({
            message: 'Bulk move successful',
            count: result.modifiedCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
