import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function GET() {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.error('GOOGLE_AI_API_KEY is missing');
            return NextResponse.json({ error: 'AI không khả dụng (thiếu API Key)' }, { status: 500 });
        }

        await dbConnect();
        // ... (rest of the fetching logic)
        const foodItems = await Item.find({
            $or: [
                { category: 'food' },
                { tags: { $in: ['thực phẩm', 'food', 'đồ ăn'] } }
            ],
            quantity: { $gt: 0 }
        }).lean();

        if (foodItems.length === 0) {
            return NextResponse.json({
                success: true,
                recipes: [],
                message: 'Tủ lạnh trống trơn rồi! Hãy đi chợ và thêm đồ vào kho nhé.'
            });
        }

        const ingredients = foodItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là đầu bếp AI thông minh (Kitchen AI). Dựa trên các nguyên liệu đang có trong tủ lạnh:
        Nguyên liệu: ${ingredients}
        Hãy gợi ý 3 món ăn ngon nhất có thể nấu được. Trả về JSON chuẩn.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('AI failed to provide JSON');

            const data = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ success: true, recipes: data.recipes || [] });
        } catch (aiErr: any) {
            console.error('Inner AI Error:', aiErr);
            return NextResponse.json({
                success: false,
                error: 'AI đang bận, vui lòng thử lại sau.',
                recipes: []
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('AI Recipe Route Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
