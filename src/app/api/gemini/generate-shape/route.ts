import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not found" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        points: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.NUMBER }, // [x, y, z]
                                description: "Point [x, y, z]"
                            }
                        }
                    }
                }
            }
        });

        const result = await model.generateContent(`Generate a 3D point cloud for: "${prompt}". 
      Return exactly 150 points.
      Points must be within range -1 to 1.
      Round numbers to 2 decimal places to save space.`);

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        return NextResponse.json(parsed);

    } catch (error) {
        console.error("Gemini Shape Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate shape" }, { status: 500 });
    }
}
