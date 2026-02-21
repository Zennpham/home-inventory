import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pin, name } = body;

        if (!pin) {
            return NextResponse.json({ error: 'Thiếu PIN' }, { status: 400 });
        }

        // Check Admin PIN from env (if name is Admin or not provided)
        if (!name || name === 'Admin') {
            const adminPin = process.env.ADMIN_PIN || '0000';
            if (pin === adminPin) {
                const adminToken = 'admin_' + crypto.randomBytes(16).toString('hex');
                return NextResponse.json({
                    role: 'admin',
                    name: 'Admin',
                    token: adminToken,
                    permissions: {
                        canAddItems: true,
                        canEditItems: true,
                        canDeleteItems: true,
                        canManageLocations: true
                    }
                });
            }
        }

        // Check family member PINs from DB
        await dbConnect();
        const query = name ? { name, pin } : { pin };
        const member = await FamilyMember.findOne(query).lean() as any;

        if (!member) {
            return NextResponse.json({ error: 'PIN hoặc Tài khoản không đúng.' }, { status: 401 });
        }

        return NextResponse.json({
            role: 'family',
            name: member.name,
            token: member.token,
            permissions: member.permissions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
