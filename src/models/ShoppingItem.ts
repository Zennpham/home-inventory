import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingItem extends Document {
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
    category?: string;
    notes?: string;
    itemId?: mongoose.Types.ObjectId; // Optional link to a permanent inventory item
}

const ShoppingItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'pcs' },
    checked: { type: Boolean, default: false },
    category: { type: String, default: 'general' },
    notes: { type: String },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' }
}, {
    timestamps: true
});

export default mongoose.models.ShoppingItem || mongoose.model<IShoppingItem>('ShoppingItem', ShoppingItemSchema);
