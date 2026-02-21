import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';

export async function GET() {
    try {
        await dbConnect();
        const members = await FamilyMember.find({}, 'name').lean();
        return NextResponse.json(members);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
