import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Activity from '@/models/Activity';
import Location from '@/models/Location';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const item = await Item.findById(id).populate('location').lean();
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const locations = await Location.find({}).lean();

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
        const itemWithSegments = {
            ...item,
            pathSegments: [...locSegments, { name: item.name, id: item._id, type: 'item' }]
        };

        return NextResponse.json(itemWithSegments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = await request.json();

        // Find existing item to compare quantity
        const existingItem = await Item.findById(id);
        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // Log activity if quantity changed
        if (body.quantity !== undefined && body.quantity !== existingItem.quantity) {
            // Push to quantityHistory for charting
            body.$push = {
                quantityHistory: { qty: body.quantity, date: new Date(), note: body.historyNote || undefined }
            };
            await Activity.create({
                itemId: id,
                type: body.quantity > existingItem.quantity ? 'add' : 'remove',
                amount: Math.abs(body.quantity - existingItem.quantity),
                user: body.performedBy || 'Admin',
                timestamp: new Date()
            });
        } else {
            // General update activity
            await Activity.create({
                itemId: id,
                type: 'update',
                amount: 0,
                user: body.performedBy || 'Admin',
                timestamp: new Date()
            });
        }

        // Remove extra keys before update
        delete body.historyNote;
        const item = await Item.findByIdAndUpdate(id, body, { new: true }).populate('location');

        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const item = await Item.findByIdAndDelete(id);

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
