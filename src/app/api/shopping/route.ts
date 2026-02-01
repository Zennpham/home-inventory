import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ShoppingItem from '@/models/ShoppingItem';

export async function GET() {
    try {
        await dbConnect();
        const items = await ShoppingItem.find({}).sort({ createdAt: -1 });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const item = await ShoppingItem.create(body);
        return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
