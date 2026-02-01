import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import Item from '@/models/Item';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ nfcId: string }> }
) {
    try {
        const { nfcId } = await params;
        await dbConnect();

        // Find location by its NFC ID
        const location = await Location.findOne({ nfcId });

        if (!location) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        // Find all items associated with this location
        const items = await Item.find({ location: location._id });

        return NextResponse.json({
            location,
            items
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
