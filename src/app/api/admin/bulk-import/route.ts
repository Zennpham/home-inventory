import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Location from '@/models/Location';

/**
 * BULK IMPORT API
 * POST /api/admin/bulk-import
 * 
 * Body format:
 * {
 *   "items": [
 *     { "name": "Sữa tươi", "quantity": 5, "unit": "hộp", "locationName": "Tủ lạnh", "category": "food", "expiryDate": "2025-03-01" },
 *     { "name": "Nhớt xe", "quantity": 2, "unit": "chai", "locationName": "Ga-ra", "category": "tools" }
 *   ]
 * }
 * 
 * - locationName: Tìm theo tên vị trí (case-insensitive). Nếu không tìm thấy, tự tạo mới.
 * - Nếu item đã tồn tại (cùng tên + vị trí), sẽ cộng dồn số lượng.
 */
export async function POST(request: Request) {
    try {
        await dbConnect();
        const { items } = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'items phải là mảng không rỗng' }, { status: 400 });
        }

        const results = {
            created: 0,
            updated: 0,
            errors: [] as string[]
        };

        // Cache locations by name for efficiency
        const allLocations = await Location.find({}).lean();
        const locationMap = new Map(allLocations.map(l => [l.name.toLowerCase(), l]));

        for (const item of items) {
            try {
                // Find or create location
                let location = locationMap.get(item.locationName?.toLowerCase());
                if (!location && item.locationName) {
                    const newLoc = await Location.create({
                        name: item.locationName,
                        type: 'shelf',
                        nfcId: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                    });
                    location = newLoc.toObject();
                    locationMap.set(item.locationName.toLowerCase(), location);
                }

                if (!location) {
                    results.errors.push(`Bỏ qua "${item.name}": Thiếu locationName`);
                    continue;
                }

                // Check if item exists (same name + location)
                const existingItem = await Item.findOne({
                    name: { $regex: new RegExp(`^${item.name}$`, 'i') },
                    location: location._id
                });

                if (existingItem) {
                    // Update quantity (add)
                    existingItem.quantity += item.quantity || 0;
                    if (item.expiryDate) existingItem.expiryDate = new Date(item.expiryDate);
                    if (item.price) existingItem.price = item.price;
                    await existingItem.save();
                    results.updated++;
                } else {
                    // Create new item
                    await Item.create({
                        name: item.name,
                        quantity: item.quantity || 1,
                        unit: item.unit || 'cái',
                        location: location._id,
                        category: item.category || 'general',
                        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                        price: item.price || 0,
                        minStock: item.minStock || 1,
                        status: 'in stock',
                        note: item.note
                    });
                    results.created++;
                }
            } catch (err: any) {
                results.errors.push(`Lỗi "${item.name}": ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Import hoàn tất: ${results.created} mới, ${results.updated} cập nhật`,
            ...results
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/admin/bulk-import
 * Returns template/example for bulk import
 */
export async function GET() {
    return NextResponse.json({
        description: 'Bulk Import API - Nhập hàng loạt món đồ',
        method: 'POST',
        endpoint: '/api/admin/bulk-import',
        exampleBody: {
            items: [
                { name: "Sữa tươi Vinamilk", quantity: 5, unit: "hộp", locationName: "Tủ lạnh", category: "food", expiryDate: "2025-03-01" },
                { name: "Dầu gội Head & Shoulders", quantity: 2, unit: "chai", locationName: "Nhà tắm", category: "general" },
                { name: "Nhớt Castrol", quantity: 3, unit: "chai", locationName: "Ga-ra", category: "tools", price: 120000 }
            ]
        },
        notes: [
            "locationName: Tên vị trí (tự động tạo nếu chưa có)",
            "Nếu item đã tồn tại (cùng tên + vị trí), số lượng sẽ được cộng dồn",
            "category: food, electronics, general, medical, clothing, tools"
        ]
    });
}
