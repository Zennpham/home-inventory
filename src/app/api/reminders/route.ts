import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import { addDays, isBefore, isSameDay } from 'date-fns';

export async function GET() {
    try {
        await dbConnect();
        const items = await Item.find({}).populate('location');
        const now = new Date();
        const threeDaysFromNow = addDays(now, 3);

        const alerts = items.map((item: any) => {
            const activeAlerts = [];

            // 1. Check Expiry
            if (item.expiryDate) {
                if (isBefore(item.expiryDate, now)) {
                    activeAlerts.push({ type: 'expiry', priority: 'high', message: `${item.name} đã hết hạn!` });
                } else if (isBefore(item.expiryDate, threeDaysFromNow)) {
                    activeAlerts.push({ type: 'expiry', priority: 'medium', message: `${item.name} sắp hết hạn trong 3 ngày.` });
                }
            }

            // 2. Check Low Stock
            if (item.quantity <= item.minStock && item.quantity > 0) {
                activeAlerts.push({ type: 'low-stock', priority: 'medium', message: `${item.name} sắp hết (còn ${item.quantity} ${item.unit}).` });
            } else if (item.quantity === 0) {
                activeAlerts.push({ type: 'low-stock', priority: 'high', message: `${item.name} đã hết sạch!` });
            }

            // 3. Check Maintenance
            if (item.maintenanceDate) {
                if (isBefore(item.maintenanceDate, now) || isSameDay(item.maintenanceDate, now)) {
                    activeAlerts.push({ type: 'maintenance', priority: 'medium', message: `${item.name} cần bảo trì/vệ sinh.` });
                }
            }

            // 4. Check Subscriptions
            if (item.category === 'subscription' && item.subscriptionDate) {
                if (isBefore(item.subscriptionDate, threeDaysFromNow)) {
                    activeAlerts.push({ type: 'subscription', priority: 'high', message: `Đến hạn thanh toán ${item.name} (${item.subscriptionAmount?.toLocaleString()}đ).` });
                }
            }

            return activeAlerts.length > 0 ? { item, alerts: activeAlerts } : null;
        }).filter(Boolean);

        // Flatten for easy display
        const flatAlerts = alerts.flatMap((a: any) =>
            a.alerts.map((alert: any) => ({
                ...alert,
                itemId: a.item._id,
                itemName: a.item.name,
                locationName: a.item.location?.name
            }))
        );

        return NextResponse.json({
            summary: {
                totalAlerts: flatAlerts.length,
                highPriority: flatAlerts.filter((a: any) => a.priority === 'high').length
            },
            alerts: flatAlerts
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
