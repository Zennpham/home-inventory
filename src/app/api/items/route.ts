import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Activity from '@/models/Activity';
import Location from '@/models/Location';

export async function GET() {
    try {
        await dbConnect();
        const items = await Item.find({}).populate('location').lean();
        const locations = await Location.find({}).lean();

        // Calculate path segments for each item
        const itemsWithMetadata = items.map((item: any) => {
            const getSegments = (locId: string): any[] => {
                const loc = locations.find(l => l._id.toString() === locId.toString());
                if (!loc) return [];

                const parent = locations.find(l => l._id.toString() === (loc.parentId?._id?.toString() || loc.parentId?.toString()));
                const currentSegment = { name: loc.name, id: loc._id, type: 'location', nfcId: loc.nfcId };

                if (parent) {
                    return [...getSegments(parent._id.toString()), currentSegment];
                }
                return [currentSegment];
            };

            const locSegments = item.location ? getSegments(item.location._id || item.location) : [];

            return {
                ...item,
                pathSegments: [...locSegments, { name: item.name, id: item._id, type: 'item' }]
            };
        });

        return NextResponse.json(itemsWithMetadata);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const item = await Item.create(body);

        // Log activity
        await Activity.create({
            itemId: item._id,
            type: 'add',
            amount: item.quantity,
            user: body.performedBy || 'Admin',
            timestamp: new Date()
        });

        const populatedItem = await item.populate('location');
        return NextResponse.json(populatedItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
