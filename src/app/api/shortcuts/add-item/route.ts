import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Location from '@/models/Location';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { name, quantity, unit, locationName, category } = await request.json();

        // Find location by name (easier for voice input)
        let location = await Location.findOne({ name: new RegExp(locationName, 'i') });

        if (!location) {
            // If not found, maybe look by nfcId if that was provided instead
            location = await Location.findOne({ nfcId: locationName });
        }

        if (!location) {
            return NextResponse.json({ error: `Location '${locationName}' not found.` }, { status: 404 });
        }

        const item = await Item.create({
            name,
            quantity: quantity || 1,
            unit: unit || 'pcs',
            location: location._id,
            category: category || 'general'
        });

        return NextResponse.json({
            message: `Successfully added ${item.quantity} ${item.unit} of ${item.name} to ${location.name}.`,
            item
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
