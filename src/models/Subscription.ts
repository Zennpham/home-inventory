import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    serviceName: string;
    provider?: string;
    startDate?: Date;
    endDate?: Date;
    renewalDate?: Date;
    frequency: 'monthly' | 'yearly' | 'other';
    status: 'active' | 'inactive' | 'cancelled';
    autoRenew: boolean;
    paymentMethod?: string;
    owner?: string;
    note?: string;
    price?: number;
    category: string; // Hardcoded or default to 'subscription'
}

const SubscriptionSchema: Schema = new Schema({
    serviceName: { type: String, required: true },
    provider: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    renewalDate: { type: Date },
    frequency: {
        type: String,
        enum: ['monthly', 'yearly', 'other'],
        default: 'monthly'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active'
    },
    autoRenew: { type: Boolean, default: false },
    paymentMethod: { type: String },
    owner: { type: String },
    note: { type: String },
    price: { type: Number, default: 0 },
    category: { type: String, default: 'subscription' }
}, {
    timestamps: true,
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
