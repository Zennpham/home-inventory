import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET: List all family members (Admin only)
export async function GET() {
    try {
        await dbConnect();
        const members = await FamilyMember.find({}).select('-token').lean();

        // Safety check: ensure members is an array
        const result = Array.isArray(members) ? members : [];
        console.log('API GET /api/family - Returning array of length:', result.length);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('API GET /api/family - Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new family member
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, pin, permissions } = body;

        console.log('API POST /api/family - Received:', { name, pin });

        if (!name || !pin) {
            return NextResponse.json({ error: 'Tên và PIN là bắt buộc' }, { status: 400 });
        }

        // Auto-generate a secure token
        const token = crypto.randomBytes(16).toString('hex');

        // Create the document
        const member = new FamilyMember({
            name: name.trim(),
            pin: String(pin).trim(),
            permissions: permissions || {
                canAddItems: true,
                canEditItems: false,
                canDeleteItems: false,
                canManageLocations: false
            },
            token: token
        });

        const saved = await member.save();
        console.log('API POST /api/family - Saved successfully:', saved._id);

        return NextResponse.json({
            ...saved.toObject(),
            shareLink: `${process.env.NEXT_PUBLIC_BASE_URL || ''}?token=${token}`
        }, { status: 201 });
    } catch (error: any) {
        console.error('API POST /api/family - Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
