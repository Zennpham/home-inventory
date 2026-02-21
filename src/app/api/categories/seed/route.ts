import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

// Seed default categories with custom fields
export async function POST() {
    try {
        await dbConnect();

        const defaultCategories = [
            {
                name: 'Thực phẩm',
                icon: '🍎',
                color: 'emerald',
                defaultFields: [
                    { fieldName: 'storageType', label: 'Loại bảo quản', fieldType: 'select', options: ['Tươi', 'Đông lạnh', 'Khô'], required: false },
                ]
            },
            {
                name: 'Thuốc & Y tế',
                icon: '💊',
                color: 'rose',
                defaultFields: [
                    { fieldName: 'dosage', label: 'Liều dùng', fieldType: 'text', placeholder: 'VD: 2 viên/ngày', required: false },
                    { fieldName: 'prescribedBy', label: 'Bác sĩ kê', fieldType: 'text', required: false },
                    { fieldName: 'contraindications', label: 'Chống chỉ định', fieldType: 'text', required: false },
                ]
            },
            {
                name: 'Xe cộ',
                icon: '🏍️',
                color: 'amber',
                defaultFields: [
                    { fieldName: 'mileage', label: 'Số Km', fieldType: 'number', unit: 'km', required: false },
                    { fieldName: 'licensePlate', label: 'Biển số', fieldType: 'text', required: false },
                    { fieldName: 'lastOilChange', label: 'Thay nhớt lần cuối', fieldType: 'date', required: false },
                    { fieldName: 'fuelType', label: 'Loại nhiên liệu', fieldType: 'select', options: ['Xăng', 'Dầu', 'Điện'], required: false },
                ]
            },
            {
                name: 'Điện tử',
                icon: '📱',
                color: 'blue',
                defaultFields: [
                    { fieldName: 'serialNumber', label: 'Số serial', fieldType: 'text', required: false },
                    { fieldName: 'purchaseStore', label: 'Nơi mua', fieldType: 'text', required: false },
                ]
            },
            {
                name: 'Đồ sưu tầm',
                icon: '🎨',
                color: 'purple',
                defaultFields: [
                    { fieldName: 'rarity', label: 'Độ hiếm', fieldType: 'select', options: ['Phổ thông', 'Hiếm', 'Cực hiếm', 'Giới hạn'], required: false },
                    { fieldName: 'currentValue', label: 'Giá trị hiện tại', fieldType: 'number', unit: 'VND', required: false },
                    { fieldName: 'condition', label: 'Tình trạng', fieldType: 'select', options: ['Mint', 'Near Mint', 'Good', 'Fair', 'Poor'], required: false },
                ]
            },
            {
                name: 'Quần áo',
                icon: '👕',
                color: 'pink',
                defaultFields: [
                    { fieldName: 'size', label: 'Size', fieldType: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: false },
                    { fieldName: 'material', label: 'Chất liệu', fieldType: 'text', required: false },
                ]
            },
            {
                name: 'Dụng cụ',
                icon: '🔧',
                color: 'zinc',
                defaultFields: []
            },
        ];

        // Use upsert to avoid duplicates
        for (const cat of defaultCategories) {
            await Category.findOneAndUpdate(
                { name: cat.name },
                cat,
                { upsert: true, new: true }
            );
        }

        const categories = await Category.find({}).lean();
        return NextResponse.json({ message: 'Seeded categories', count: categories.length, categories });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
