import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

// GET: List all categories (with optional tree structure)
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const flat = searchParams.get('flat') === 'true';

        const categories = await Category.find({}).lean();

        if (flat) {
            return NextResponse.json(categories);
        }

        // Build tree structure
        const categoryMap = new Map();
        categories.forEach(cat => categoryMap.set(cat._id.toString(), { ...cat, children: [] }));

        const tree: any[] = [];
        categories.forEach(cat => {
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId.toString());
                if (parent) {
                    parent.children.push(categoryMap.get(cat._id.toString()));
                }
            } else {
                tree.push(categoryMap.get(cat._id.toString()));
            }
        });

        return NextResponse.json(tree);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new category
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const category = await Category.create(body);
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
