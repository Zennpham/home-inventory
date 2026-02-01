import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    name: string;
    quantity: number;
    unit: string;
    location: mongoose.Types.ObjectId;
    category: 'food' | 'electronics' | 'general' | 'medical' | 'clothing' | 'tools';
    owner?: string;
    purchaseDate?: Date;
    price?: number;
    expiryDate?: Date;
    maintenanceDate?: Date;
    lastChecked?: Date;
    minStock: number;
    status: 'in stock' | 'out of stock' | 'reserved' | 'critical' | 'damaged';
    note?: string;
    itemInfo?: any;
    imageUrl?: string;
    barcode?: string;

    // Electronics / Physical specs
    brand?: string;
    modelNumber?: string;
    warrantyDate?: Date;
    maintenanceFrequency?: number; // In days

    batches: Array<{
        id?: string;
        quantity: number;
        expiryDate?: Date;
        lastChecked: Date;
    }>;
}

const ItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: 'pcs' },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    category: {
        type: String,
        enum: ['food', 'electronics', 'general', 'medical', 'clothing', 'tools'],
        default: 'general'
    },
    owner: { type: String },
    purchaseDate: { type: Date },
    price: { type: Number, default: 0 },
    expiryDate: { type: Date },
    maintenanceDate: { type: Date },
    lastChecked: { type: Date },
    minStock: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['in stock', 'out of stock', 'reserved', 'critical', 'damaged'],
        default: 'in stock'
    },
    note: { type: String },
    itemInfo: { type: Schema.Types.Mixed },
    imageUrl: { type: String },
    barcode: { type: String },

    // Sub-category fields (Electronics)
    brand: { type: String },
    modelNumber: { type: String },
    warrantyDate: { type: Date },
    maintenanceFrequency: { type: Number },

    batches: [{
        id: { type: String },
        quantity: { type: Number, required: true },
        expiryDate: { type: Date },
        lastChecked: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
