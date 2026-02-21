import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

const CATEGORIES_DATA = [
    {
        name: 'Thực phẩm',
        icon: '🍎',
        color: 'rose',
        category: 'food',
        defaultFields: [
            { fieldName: 'storage_type', label: 'Cách bảo quản', fieldType: 'select', options: ['Fridge', 'Freezer', 'Room'], required: true },
            { fieldName: 'opened_date', label: 'Ngày mở bao bì', fieldType: 'date', required: false },
            { fieldName: 'nutrition_info', label: 'Thông tin dinh dưỡng', fieldType: 'text', required: false },
            { fieldName: 'brand', label: 'Thương hiệu', fieldType: 'text', required: false },
            { fieldName: 'batch_number', label: 'Lô sản xuất', fieldType: 'text', required: false }
        ]
    },
    {
        name: 'Thuốc & Y tế',
        icon: '💊',
        color: 'emerald',
        category: 'medical',
        defaultFields: [
            { fieldName: 'dosage', label: 'Liều dùng', fieldType: 'text', required: false },
            { fieldName: 'frequency', label: 'Tần suất', fieldType: 'text', required: false },
            { fieldName: 'prescription_required', label: 'Cần toa bác sĩ', fieldType: 'boolean', required: false },
            { fieldName: 'doctor_name', label: 'Bác sĩ kê toa', fieldType: 'text', required: false },
            { fieldName: 'pharmacy', label: 'Nơi mua', fieldType: 'text', required: false },
            { fieldName: 'side_effects', label: 'Tác dụng phụ', fieldType: 'text', required: false },
            { fieldName: 'health_category', label: 'Loại bệnh', fieldType: 'select', options: ['Pain', 'Cold', 'Mental', 'Vitamins'], required: false }
        ]
    },
    {
        name: 'Xe cộ',
        icon: '🏍️',
        color: 'blue',
        category: 'vehicle',
        defaultFields: [
            { fieldName: 'brand', label: 'Hãng xe', fieldType: 'text', required: false },
            { fieldName: 'model', label: 'Model', fieldType: 'text', required: false },
            { fieldName: 'license_plate', label: 'Biển số', fieldType: 'text', required: false },
            { fieldName: 'engine_number', label: 'Số máy', fieldType: 'text', required: false },
            { fieldName: 'chassis_number', label: 'Số khung', fieldType: 'text', required: false },
            { fieldName: 'fuel_type', label: 'Loại nhiên liệu', fieldType: 'select', options: ['Gasoline', 'Electric'], required: false },
            { fieldName: 'insurance_expiry', label: 'Hết hạn bảo hiểm', fieldType: 'date', required: false },
            { fieldName: 'registration_expiry', label: 'Hết hạn đăng kiểm', fieldType: 'date', required: false },
            { fieldName: 'mileage', label: 'Số KM', fieldType: 'number', required: false, unit: 'km' },
            { fieldName: 'last_service_date', label: 'Bảo dưỡng gần nhất', fieldType: 'date', required: false }
        ]
    },
    {
        name: 'Điện tử',
        icon: '📱',
        color: 'indigo',
        category: 'electronics',
        defaultFields: [
            { fieldName: 'brand', label: 'Hãng', fieldType: 'text', required: false },
            { fieldName: 'model', label: 'Model', fieldType: 'text', required: false },
            { fieldName: 'serial_number', label: 'Số Serial', fieldType: 'text', required: false },
            { fieldName: 'storage_capacity', label: 'Dung lượng', fieldType: 'text', required: false },
            { fieldName: 'color', label: 'Màu sắc', fieldType: 'text', required: false },
            { fieldName: 'battery_health', label: 'Tình trạng pin', fieldType: 'number', unit: '%', required: false },
            { fieldName: 'os_version', label: 'Phiên bản OS', fieldType: 'text', required: false },
            { fieldName: 'purchase_store', label: 'Nơi mua', fieldType: 'text', required: false },
            { fieldName: 'warranty_type', label: 'Loại bảo hành', fieldType: 'select', options: ['Manufacturer', 'Store'], required: false }
        ]
    },
    {
        name: 'Quần áo',
        icon: '👕',
        color: 'amber',
        category: 'clothing',
        defaultFields: [
            { fieldName: 'size', label: 'Kích cỡ', fieldType: 'text', placeholder: 'S, M, L, 42...' },
            { fieldName: 'material', label: 'Chất liệu', fieldType: 'text' },
            { fieldName: 'color', label: 'Màu sắc', fieldType: 'text' },
            { fieldName: 'brand', label: 'Thương hiệu', fieldType: 'text' },
            { fieldName: 'season', label: 'Mùa', fieldType: 'select', options: ['Summer', 'Winter', 'All-year'] },
            { fieldName: 'last_worn_date', label: 'Lần mặc gần nhất', fieldType: 'date' },
            { fieldName: 'laundry_status', label: 'Tình trạng giặt', fieldType: 'select', options: ['Clean', 'Dirty'] }
        ]
    },
    {
        name: 'Dụng cụ',
        icon: '🔧',
        color: 'zinc',
        category: 'tools',
        defaultFields: [
            { fieldName: 'tool_type', label: 'Loại dụng cụ', fieldType: 'select', options: ['Electrical', 'Manual'] },
            { fieldName: 'brand', label: 'Hãng', fieldType: 'text' },
            { fieldName: 'power_source', label: 'Nguồn điện', fieldType: 'select', options: ['Battery', 'Plug'] },
            { fieldName: 'maintenance_cycle', label: 'Chu kỳ bảo dưỡng', fieldType: 'text' },
            { fieldName: 'last_maintenance', label: 'Lần bảo dưỡng cuối', fieldType: 'date' },
            { fieldName: 'safety_level', label: 'Mức độ an toàn', fieldType: 'select', options: ['Low', 'Medium', 'High'] }
        ]
    }
];

export async function POST() {
    try {
        await dbConnect();

        // Delete existing categories to prevent duplicates during seed
        await Category.deleteMany({});

        const created = await Category.insertMany(CATEGORIES_DATA);

        return NextResponse.json({
            message: 'Categories seeded successfully',
            count: created.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
