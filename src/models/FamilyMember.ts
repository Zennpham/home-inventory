import mongoose, { Schema, Document } from 'mongoose';

export interface IFamilyMember extends Document {
    name: string;           // "Mẹ", "Ba", "Em Trai"
    token: string;          // Secret token for URL-based auth
    permissions: {
        canAddItems: boolean;
        canEditItems: boolean;
        canDeleteItems: boolean;
        canManageLocations: boolean;
    };
    createdAt: Date;
}

const FamilyMemberSchema: Schema = new Schema({
    name: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    permissions: {
        canAddItems: { type: Boolean, default: true },
        canEditItems: { type: Boolean, default: false },
        canDeleteItems: { type: Boolean, default: false },
        canManageLocations: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);
