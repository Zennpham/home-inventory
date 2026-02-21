import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const itemId = searchParams.get('itemId');

        const query: any = {};
        if (itemId) {
            query.itemId = itemId;
        }

        const activities = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('itemId', 'name imageUrl category unit')
            .lean();

        return NextResponse.json(activities);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
