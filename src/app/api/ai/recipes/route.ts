import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function GET() {
    try {
        await dbConnect();

        // Fetch all food items that still have quantity
        const foodItems = await Item.find({
            $or: [
                { category: 'food' },
                { tags: { $in: ['thực phẩm', 'food', 'đồ ăn'] } }
            ],
            quantity: { $gt: 0 }
        }).lean();

        if (foodItems.length === 0) {
            return NextResponse.json({
                recipes: [],
                message: 'Tủ lạnh trống trơn rồi! Hãy đi chợ và thêm đồ vào kho nhé.'
            });
        }

        const ingredients = foodItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Bạn là đầu bếp AI thông minh (Kitchen AI). Dựa trên các nguyên liệu đang có trong tủ lạnh:
        Nguyên liệu: ${ingredients}

        Hãy gợi ý 3 món ăn ngon nhất có thể nấu được (hoặc gợi ý mua thêm 1-2 thứ rẻ tiền để hoàn thành món).
        Ưu tiên các món ăn Việt Nam. Mỗi món ăn cần có:
        - Tên món
        - Độ khó (Dễ/Vừa/Khó)
        - Thời gian nấu
        - Các nguyên liệu đang có sẽ sử dụng
        - Nguyên liệu cần mua thêm (nếu có)
        - Một câu giới thiệu hấp dẫn.

        Trả về kết quả dưới dạng JSON:
        {
            "recipes": [
                {
                    "title": "Tên món",
                    "difficulty": "Dễ",
                    "time": "20 phút",
                    "ingredientsUsed": ["A", "B"],
                    "toBuy": ["C"],
                    "description": "..."
                }
            ]
        }
        Chỉ trả về JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to provide JSON');

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ success: true, recipes: data.recipes });
    } catch (error: any) {
        console.error('AI Recipe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
