import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import Item from '@/models/Item';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = await request.json();

        // Convert empty parentId string to null
        if (body.parentId === '') {
            body.parentId = null;
        }

        const existingLocation = await Location.findById(id);
        if (!existingLocation) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        // Recalculate path if name or parentId changes
        if (body.name || body.parentId !== undefined) {
            const name = body.name || existingLocation.name;
            const parentId = body.parentId !== undefined ? body.parentId : existingLocation.parentId;

            if (parentId) {
                const parent = await Location.findById(parentId);
                if (parent) {
                    body.path = parent.path ? `${parent.path} > ${name}` : `${parent.name} > ${name}`;
                }
            } else {
                body.path = name;
            }
        }

        const location = await Location.findByIdAndUpdate(id, body, { new: true }).populate('parentId');
        return NextResponse.json(location);
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

        // Check if location has items
        const itemsInLocation = await Item.countDocuments({ location: id });
        if (itemsInLocation > 0) {
            return NextResponse.json({
                error: `Cannot delete location. It contains ${itemsInLocation} item(s). Please move or delete items first.`
            }, { status: 400 });
        }

        // Check if location has children
        const children = await Location.findOne({ parentId: id });
        if (children) {
            return NextResponse.json({
                error: 'Cannot delete location with child locations. Please delete or move children first.'
            }, { status: 400 });
        }

        const location = await Location.findByIdAndDelete(id);
        if (!location) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Location deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
