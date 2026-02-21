import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    name: string;
    quantity: number;
    unit: string;
    location: mongoose.Types.ObjectId;
    categoryId?: mongoose.Types.ObjectId; // Reference to Category model
    category: 'food' | 'electronics' | 'general' | 'medical' | 'clothing' | 'tools'; // Legacy
    customFields?: Map<string, any>; // Dynamic fields from Category
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
    isPublic?: boolean;

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

    quantityHistory: Array<{
        qty: number;
        date: Date;
        note?: string;
    }>;
}

const ItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: 'pcs' },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    category: {
        type: String,
        enum: ['food', 'electronics', 'general', 'medical', 'clothing', 'tools'],
        default: 'general'
    },
    customFields: { type: Map, of: Schema.Types.Mixed },

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
    isPublic: { type: Boolean, default: false },

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
    }],

    quantityHistory: [{
        qty: { type: Number },
        date: { type: Date, default: Date.now },
        note: { type: String }
    }]
}, {
    timestamps: true,
});

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
