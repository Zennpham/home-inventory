import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';

// GET: Validate token and return user info
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            // No token = Guest mode (Admin if on localhost, otherwise read-only)
            return NextResponse.json({
                role: 'guest',
                name: 'Khách',
                permissions: {
                    canAddItems: false,
                    canEditItems: false,
                    canDeleteItems: false,
                    canManageLocations: false
                }
            });
        }

        if (token.startsWith('admin_')) {
            return NextResponse.json({
                role: 'admin',
                name: 'Hngan',
                permissions: {
                    canAddItems: true,
                    canEditItems: true,
                    canDeleteItems: true,
                    canManageLocations: true
                }
            });
        }

        await dbConnect();
        const member = await FamilyMember.findOne({ token }).lean();

        if (!member) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        return NextResponse.json({
            role: 'family',
            name: member.name,
            permissions: member.permissions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
