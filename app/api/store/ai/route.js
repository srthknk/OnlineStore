import { genAI } from "@/configs/openai";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function main(base64Image, mimeType) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are a product listing assistant for an e-commerce store.
Your job is to analyze an image of a product and generate structured data.

Respond ONLY with raw JSON (no code block, no markdown, no explanation).
The JSON must strictly follow this schema:

{
  "name": string,
  "description": string
}

Analyze this product image and provide the name and description.
`;

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    console.log(text);

    // remove ```json or ``` wrappers if present
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("AI did not return valid JSON");
    }

    return parsed;
}


export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authSeller(userId);
        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }
        
        // Check if Gemini API key is configured
        if(!process.env.GEMINI_API_KEY){
            return NextResponse.json({ error: 'AI feature not available - Gemini API key not configured' }, { status: 503 })
        }
        
        const { base64Image, mimeType } = await request.json();
        const result = await main(base64Image, mimeType);
        return NextResponse.json({ ...result });
    } catch (error) {
        console.error(error);
        
        // Handle quota exceeded errors gracefully
        if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
            return NextResponse.json({ 
                error: 'AI service temporarily unavailable - quota exceeded. Please try again later or fill product details manually.',
                warning: true 
            }, { status: 503 });
        }
        
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}
