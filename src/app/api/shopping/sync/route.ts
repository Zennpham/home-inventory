import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import ShoppingItem from '@/models/ShoppingItem';

export async function POST() {
    try {
        await dbConnect();

        // Tìm tất cả các món đồ có số lượng <= minStock, HOẶC trạng thái critical/out of stock
        const criticalItems = await Item.find({
            $or: [
                { $expr: { $lte: ['$quantity', '$minStock'] } },
                { status: { $in: ['out of stock', 'critical'] } }
            ]
        }).lean();

        let syncedCount = 0;

        for (const item of criticalItems) {
            // Kiểm tra xem món đồ này đã có trong Shopping List và chưa được mua chưa
            const existingShoppingItem = await ShoppingItem.findOne({
                itemId: item._id,
                checked: false
            });

            if (!existingShoppingItem) {
                // Nếu chưa có, tạo mới
                await ShoppingItem.create({
                    name: item.name,
                    quantity: Math.max(1, (item.minStock || 1) * 2 - item.quantity), // Mua thêm bao nhiêu để đầy kho x2 min
                    unit: item.unit,
                    category: item.category,
                    checked: false,
                    notes: `Sync tự động vì sắp hết: Kho còn ${item.quantity} ${item.unit}. (Min: ${item.minStock})`,
                    itemId: item._id
                });
                syncedCount++;
            }
        }

        return NextResponse.json({ message: `Đã đồng bộ ${syncedCount} món đồ vào danh sách đi chợ.` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
