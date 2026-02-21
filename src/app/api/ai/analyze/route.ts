import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Simulating AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // This is where you would normally call Gemini Pro Vision or GPT-4o
        // For now, we simulate intelligence based on some metadata or just return a mock response
        // To make it look "real" for the demo, we'll return a "Guess" based on common inventory items

        // Mock logic: randomly pick a plausible analysis result
        const mocks = [
            { name: 'Sữa tươi Tiệt trùng', category: 'food', unit: 'hộp', confidence: 0.95 },
            { name: 'Pin AA Alkaline', category: 'tools', unit: 'viên', confidence: 0.88 },
            { name: 'Mì tôm Hảo Hảo', category: 'food', unit: 'gói', confidence: 0.92 },
            { name: 'Nước xả vải Downy', category: 'general', unit: 'chai', confidence: 0.85 },
            { name: 'Bóng đèn LED', category: 'electronics', unit: 'cái', confidence: 0.91 }
        ];

        const result = mocks[Math.floor(Math.random() * mocks.length)];

        return NextResponse.json({
            success: true,
            analysis: {
                ...result,
                tags: ['ai-detected', result.category],
                description: `Tự động nhận diện từ hình ảnh (Độ tin cậy: ${Math.round(result.confidence * 100)}%)`
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
