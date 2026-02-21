import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    name: string;
    quantity: number;
    unit: string;
    location: mongoose.Types.ObjectId;
    categoryId?: mongoose.Types.ObjectId;
    category: 'food' | 'electronics' | 'general' | 'medical' | 'clothing' | 'tools' | 'vehicle' | 'collectible' | 'furniture' | 'books' | 'pet' | 'document' | 'cosmetic';
    subcategory?: string;
    customFields?: Map<string, any>;

    // Core Fields
    owner?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    currentValue?: number;
    condition: 'new' | 'good' | 'used' | 'damaged';
    status: 'active' | 'consumed' | 'lost' | 'sold' | 'borrowed';

    borrowedInfo?: {
        borrower: string;
        dateBorrowed: Date;
        dueDate?: Date;
        returnedDate?: Date;
        note?: string;
    };

    expiryDate?: Date;
    warrantyDate?: Date;
    serialNumber?: string;
    barcode?: string;
    note?: string;
    imageUrls: string[]; // Support multiple images
    tags: string[];

    // Legacy/Extra Info
    brand?: string;
    modelNumber?: string;
    maintenanceFrequency?: number;

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
        performedBy?: string;
    }>;
    lastUpdatedBy?: string;
}

const ItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: 'pcs' },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    category: {
        type: String,
        enum: ['food', 'electronics', 'general', 'medical', 'clothing', 'tools', 'vehicle', 'collectible', 'furniture', 'books', 'pet', 'document', 'cosmetic'],
        default: 'general'
    },
    subcategory: { type: String },
    customFields: { type: Map, of: Schema.Types.Mixed },

    // Core Fields
    owner: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    condition: {
        type: String,
        enum: ['new', 'good', 'used', 'damaged'],
        default: 'good'
    },
    status: {
        type: String,
        enum: ['active', 'consumed', 'lost', 'sold', 'borrowed'],
        default: 'active'
    },
    borrowedInfo: {
        borrower: String,
        dateBorrowed: Date,
        dueDate: Date,
        returnedDate: Date,
        note: String
    },

    expiryDate: { type: Date },
    warrantyDate: { type: Date },
    serialNumber: { type: String },
    barcode: { type: String },
    note: { type: String },
    imageUrls: [{ type: String }],
    tags: [{ type: String }],

    // Extra
    brand: { type: String },
    modelNumber: { type: String },
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
        note: { type: String },
        performedBy: { type: String }
    }],
    lastUpdatedBy: { type: String }
}, {
    timestamps: true,
});

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
