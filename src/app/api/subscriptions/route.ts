import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function GET() {
    try {
        await dbConnect();
        const subscriptions = await Subscription.find({}).sort({ renewalDate: 1 });
        return NextResponse.json(subscriptions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const subscription = await Subscription.create(body);
        return NextResponse.json(subscription, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
