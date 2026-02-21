import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
    name: string;
    nfcId: string;
    description?: string;
    type: 'room' | 'cabinet' | 'shelf' | 'drawer' | 'box' | 'area' | 'other';
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string; // Tùy chọn màu sắc
    parentId?: mongoose.Types.ObjectId;
    path?: string; // Example: "Bếp > Tủ lạnh > Ngăn mát"
}

const LocationSchema: Schema = new Schema({
    name: { type: String, required: true },
    nfcId: { type: String, required: true, unique: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['room', 'cabinet', 'shelf', 'box', 'drawer', 'area', 'other'],
        default: 'other'
    },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
    color: { type: String }, // Tailwind color class or hex
    parentId: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
    path: { type: String }
}, {
    timestamps: true,
});

export default mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);
