import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import Item from '@/models/Item';

export async function GET() {
    try {
        await dbConnect();
        const locations = await Location.find({}).populate('parentId').lean();
        const items = await Item.find({}).lean();

        // Calculate recursive counts and path segments
        const locationsWithMetadata = locations.map((loc: any) => {
            // Recursive count logic
            const getChildrenIds = (parentId: string): string[] => {
                const children = locations.filter((l: any) => (l.parentId?._id?.toString() || l.parentId?.toString()) === parentId);
                return children.reduce((acc: string[], child: any) => [...acc, child._id.toString(), ...getChildrenIds(child._id.toString())], [] as string[]);
            };

            const allSubLocationIds = [loc._id.toString(), ...getChildrenIds(loc._id.toString())];
            const totalItems = items.filter((item: any) => allSubLocationIds.includes(item.location.toString())).length;

            // Path segments logic
            const getSegments = (currentLoc: any): any[] => {
                const parent = locations.find(l => l._id.toString() === (currentLoc.parentId?._id?.toString() || currentLoc.parentId?.toString()));
                if (parent) {
                    return [...getSegments(parent), { name: currentLoc.name, id: currentLoc._id, type: 'location', nfcId: currentLoc.nfcId }];
                }
                return [{ name: currentLoc.name, id: currentLoc._id, type: 'location', nfcId: currentLoc.nfcId }];
            };

            return {
                ...loc,
                totalItemCount: totalItems,
                pathSegments: getSegments(loc)
            };
        });

        return NextResponse.json(locationsWithMetadata);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Calculate path if parentId is provided
        if (body.parentId) {
            const parent = await Location.findById(body.parentId);
            if (parent) {
                body.path = parent.path ? `${parent.path} > ${body.name}` : `${parent.name} > ${body.name}`;
            }
        } else {
            body.path = body.name;
        }

        const location = await Location.create(body);
        return NextResponse.json(location, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
