import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import Item from '@/models/Item';
import Subscription from '@/models/Subscription';

export async function GET() {
    try {
        await dbConnect();

        // Auto-generate notifications for low stock/expiry/renewal
        const items = await Item.find({}).lean();
        const subscriptions = await Subscription.find({ status: 'active' }).lean();
        const existingNotifications = await Notification.find({ read: false }).lean();

        const newNotifications = [];

        // 1. Physical Items
        for (const item of items) {
            if (item.quantity <= (item.minStock || 0)) {
                const alreadyNotified = existingNotifications.find(n => n.itemId?.toString() === item._id.toString() && n.type === 'low-stock');
                if (!alreadyNotified) {
                    newNotifications.push({
                        title: 'Low Stock Alert',
                        message: `${item.name} is running low (${item.quantity} ${item.unit} remaining)`,
                        type: 'low-stock',
                        itemId: item._id,
                    });
                }
            }

            if (item.expiryDate) {
                const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
                    const alreadyNotified = existingNotifications.find(n => n.itemId?.toString() === item._id.toString() && n.type === 'expiry');
                    if (!alreadyNotified) {
                        newNotifications.push({
                            title: 'Expiry Warning',
                            message: `${item.name} is expiring in ${daysUntilExpiry} days`,
                            type: 'expiry',
                            itemId: item._id,
                        });
                    }
                }
            }
        }

        // 2. Subscriptions
        for (const sub of subscriptions) {
            if (sub.renewalDate) {
                const daysUntilRenewal = Math.ceil((new Date(sub.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilRenewal <= 7 && daysUntilRenewal >= 0) {
                    const alreadyNotified = existingNotifications.find(n => n.message?.includes(sub.serviceName));
                    if (!alreadyNotified) {
                        newNotifications.push({
                            title: 'Subscription Renewal',
                            message: `${sub.serviceName} will renew in ${daysUntilRenewal} days`,
                            type: 'expiry',
                        });
                    }
                }
            }
        }

        if (newNotifications.length > 0) {
            await Notification.insertMany(newNotifications);
        }

        const notifications = await Notification.find({ read: false }).sort({ createdAt: -1 }).lean();
        return NextResponse.json(notifications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await dbConnect();
        const { ids } = await request.json();

        if (ids && Array.isArray(ids)) {
            await Notification.updateMany(
                { _id: { $in: ids } },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
