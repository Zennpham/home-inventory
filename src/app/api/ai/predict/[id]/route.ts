import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const item = await Item.findById(id).lean();

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (!item.quantityHistory || item.quantityHistory.length < 2) {
            return NextResponse.json({
                prediction: null,
                message: 'Chưa đủ dữ liệu lịch sử để dự báo. Hãy cập nhật số lượng thêm vài lần nữa nhé!'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const historyData = item.quantityHistory.map((h: any) => ({
            qty: h.qty,
            date: h.date,
            note: h.note
        }));

        const prompt = `Bạn là chuyên gia phân tích dữ liệu kho. Dựa trên lịch sử tiêu thụ của vật phẩm "${item.name}" (đơn vị: ${item.unit}):
        Lịch sử: ${JSON.stringify(historyData)}
        Số lượng hiện tại: ${item.quantity}
        Ngưỡng tối thiểu: ${item.minStock}

        Hãy dự báo:
        1. Tốc độ tiêu thụ trung bình (vật phẩm/ngày).
        2. Ngày dự kiến sẽ hết hàng hoặc chạm ngưỡng tối thiểu (YYYY-MM-DD).
        3. Lời khuyên ngắn gọn (ví dụ: "Nên mua thêm vào cuối tuần này").

        Trả về kết quả dưới dạng JSON:
        {
            "dailyUsage": number,
            "estimatedEmptyDate": "YYYY-MM-DD",
            "daysRemaining": number,
            "advice": "string"
        }
        Cố gắng tính toán logic dựa trên khoảng cách ngày giữa các lần "Lấy ra". Chỉ trả về JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI failed to provide JSON');

        const prediction = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ success: true, prediction });
    } catch (error: any) {
        console.error('AI Prediction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
