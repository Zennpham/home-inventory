import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import Item from '@/models/Item';

export async function GET() {
    try {
        await dbConnect();

        // Clear existing data
        await Location.deleteMany({});
        await Item.deleteMany({});

        // Create Locations with hierarchy
        const kitchen = await Location.create({
            name: 'Phòng Bếp',
            nfcId: 'ROOM_KITCHEN',
            type: 'room',
            description: 'Khu vực nấu nướng'
        });

        const livingRoom = await Location.create({
            name: 'Phòng Khách',
            nfcId: 'ROOM_LIVING',
            type: 'room',
            description: 'Khu vực sinh hoạt chung'
        });

        const fridge = await Location.create({
            name: 'Tủ lạnh',
            nfcId: 'UNIT_FRIDGE',
            type: 'cabinet',
            parentId: kitchen._id
        });

        const shelf = await Location.create({
            name: 'Kệ gia vị',
            nfcId: 'UNIT_SPICES',
            type: 'shelf',
            parentId: kitchen._id
        });

        const medicineCabinet = await Location.create({
            name: 'Tủ thuốc',
            nfcId: 'UNIT_MEDICINE',
            type: 'cabinet',
            parentId: livingRoom._id
        });

        // Create Items
        await Item.create([
            {
                name: 'Sữa tươi',
                quantity: 2,
                unit: 'hộp',
                location: fridge._id,
                category: 'food',
                expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                minStock: 3
            },
            {
                name: 'Tương ớt',
                quantity: 1,
                unit: 'chai',
                location: shelf._id,
                category: 'food',
                minStock: 1
            },
            {
                name: 'Pin AA',
                quantity: 0,
                unit: 'viên',
                location: medicineCabinet._id,
                category: 'electronics',
                minStock: 4
            }
        ]);

        return NextResponse.json({ message: 'Database seeded successfully!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
