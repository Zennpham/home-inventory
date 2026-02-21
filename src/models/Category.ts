import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomFieldDef {
    fieldName: string;      // "mileage", "dosage", "freezeDate"
    label: string;          // "Số Km", "Liều dùng", "Ngày đông lạnh"
    fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: string[];     // For 'select' type: ["Option 1", "Option 2"]
    required: boolean;
    unit?: string;          // "km", "mg", "viên"
    placeholder?: string;
}

export interface ICategory extends Document {
    name: string;
    icon: string;           // Emoji or Lucide icon name
    color: string;          // Tailwind color class
    parentId?: mongoose.Types.ObjectId;
    defaultFields: ICustomFieldDef[];
    createdAt: Date;
}

const CustomFieldDefSchema = new Schema({
    fieldName: { type: String, required: true },
    label: { type: String, required: true },
    fieldType: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'boolean'],
        default: 'text'
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    unit: { type: String },
    placeholder: { type: String }
}, { _id: false });

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true },
    icon: { type: String, default: '📦' },
    color: { type: String, default: 'zinc' },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
    defaultFields: [CustomFieldDefSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
