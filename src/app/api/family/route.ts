import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';
import crypto from 'crypto';

// GET: List all family members (Admin only)
export async function GET() {
    try {
        await dbConnect();
        const members = await FamilyMember.find({}).select('-token').lean(); // token hidden, pin visible for admin
        return NextResponse.json(members);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new family member
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Auto-generate a secure token
        const token = crypto.randomBytes(16).toString('hex');

        const member = await FamilyMember.create({
            ...body,
            token
        });

        return NextResponse.json({
            ...member.toObject(),
            shareLink: `${process.env.NEXT_PUBLIC_BASE_URL || ''}?token=${token}`
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
