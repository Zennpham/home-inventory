import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { images } = body; // array of base64 images

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: 'No images provided' }, { status: 400 });
        }

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json({ error: 'AI API Key not configured' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imageParts = images.map(img => {
            const base64Data = img.includes(',') ? img.split(',')[1] : img;
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg'
                }
            };
        });

        const prompt = `Bạn là một chuyên gia quản lý kho đồ gia đình chuyên nghiệp (giống app Itemtopia). 
        Hãy phân tích các hình ảnh này và trả về kết quả dưới dạng JSON duy nhất. 
        Nếu thông tin không có trên bao bì, hãy sử dụng kiến thức nội tại của bạn để tìm kiếm thông tin về sản phẩm này/giống sản phẩm này (search/knowledge simulation) để điền vào.

        Cấu trúc JSON yêu cầu:
        {
            "core": {
                "name": "tên sản phẩm đầy đủ",
                "category": "chọn 1: food, electronics, general, medical, clothing, tools, vehicle, collectible, furniture, books, pet, document, cosmetic",
                "subcategory": "phân loại phụ chi tiết",
                "quantity": 1,
                "unit": "đơn vị (hộp, cái, chai...)",
                "condition": "chọn 1: new, good, used, damaged",
                "status": "chọn 1: active, consumed, lost, sold",
                "purchase_price": giá mua ước tính nếu không có trong ảnh,
                "current_value": giá trị hiện tại ước tính,
                "expiry_date": "YYYY-MM-DD" (nếu có),
                "warranty_expiry": "YYYY-MM-DD" (nếu có),
                "serial_number": "mã serial nếu thấy",
                "brand": "thương hiệu",
                "model": "model/mô hình",
                "tags": ["tag1", "tag2"]
            },
            "category_specific": {
                // Nếu là food: nutrition_info (JSON), storage_type (fridge/freezer/room)
                // Nếu là medical: dosage, frequency, prescription_required (bool)
                // Nếu là vehicle: license_plate, engine_number, fuel_type, mileage
                // Nếu là electronics: storage_capacity, color, os_version
                // Nếu là collectible: rarity, material, production_year
                // Nếu là clothing: size, material, color, season
                // Nếu là tools: tool_type, power_source
            },
            "confidence": mức độ tin cậy 0-1
        }

        Hãy trả về kết quả bằng tiếng Việt cho các label và nội dung description. CHỈ trả về JSON.`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini Raw Response:', text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI response was not in the expected format');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            analysis
        });
    } catch (error: any) {
        console.error('Gemini AI Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
