import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image } = body; // base64 image

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json({ error: 'AI API Key not configured' }, { status: 500 });
        }

        // Initialize Gemini Vision model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Prepare the image data (remove the prefix 'data:image/jpeg;base64,')
        const base64Data = image.split(',')[1];
        const imageData = {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
            }
        };

        const prompt = `Analyze this image of a household item and return a JSON object with the following fields:
        {
            "name": "a concise, clear name (e.g., 'Sữa tươi TH True Milk 1L')",
            "category": "choose ONE of: 'food', 'electronics', 'medical', 'clothing', 'tools', 'general'",
            "unit": "the likely unit of measurement (e.g., 'hộp', 'cái', 'kg', 'lít')",
            "confidence": a number between 0 and 1 representing your certainty
        }
        Return ONLY the JSON object, absolutely no other text. Be accurate and helpful for a home inventory app. Language: Vietnamese if possible, or common English tech terms.`;

        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const text = response.text();

        // Clean up the response text just in case Gemini adds markdown code blocks
        const cleanedJson = text.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(cleanedJson);

        return NextResponse.json({
            success: true,
            analysis: {
                ...analysis,
                tags: ['ai-detected', analysis.category],
                description: `Tự động nhận diện bởi Gemini AI (Độ tin cậy: ${Math.round(analysis.confidence * 100)}%)`
            }
        });
    } catch (error: any) {
        console.error('Gemini AI Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
