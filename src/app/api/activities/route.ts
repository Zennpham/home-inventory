import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';

export async function GET() {
    try {
        await dbConnect();
        const activities = await Activity.find({}).sort({ timestamp: -1 }).limit(10).populate('itemId');
        return NextResponse.json(activities);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
