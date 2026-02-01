import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    itemId: mongoose.Types.ObjectId;
    type: 'add' | 'remove' | 'update' | 'audit';
    amount: number;
    timestamp: Date;
    user?: string;
}

const ActivitySchema: Schema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    type: {
        type: String,
        enum: ['add', 'remove', 'update', 'audit'],
        required: true
    },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    user: { type: String },
}, {
    timestamps: true,
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
