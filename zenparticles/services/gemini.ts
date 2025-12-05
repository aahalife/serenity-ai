import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateShapePoints = async (prompt: string): Promise<[number, number, number][]> => {
  if (!ai) {
    console.error("API Key not found");
    // Return a random cloud fallback if no key
    return Array.from({ length: 200 }, () => [
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ]);
  }

  try {
    // Optimization: Request fewer points (150) to reduce token generation time significantly.
    // The client-side geometry shader will volumize these points with jitter to fill the 3000 particle count.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a 3D point cloud for: "${prompt}". 
      Return exactly 150 points.
      Points must be within range -1 to 1.
      Round numbers to 2 decimal places to save space.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }, // [x, y, z]
                description: "Point [x, y, z]"
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");
    
    const parsed = JSON.parse(jsonText);
    if (!parsed.points || !Array.isArray(parsed.points)) {
        throw new Error("Invalid format");
    }

    return parsed.points;

  } catch (error) {
    console.error("Gemini Shape Generation Error:", error);
    return [];
  }
};