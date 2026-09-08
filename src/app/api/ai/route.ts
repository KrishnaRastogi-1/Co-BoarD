import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    width: { type: Type.NUMBER },
    height: { type: Type.NUMBER },
    elements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: {
            type: Type.STRING,
            enum: [
              "rectangle",
              "ellipse",
              "diamond",
              "arrow",
              "line",
              "text",
              "freedraw",
            ],
          },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          width: { type: Type.NUMBER },
          height: { type: Type.NUMBER },
          text: { type: Type.STRING },
          fontSize: { type: Type.NUMBER },
          fontFamily: { type: Type.NUMBER },
          strokeColor: { type: Type.STRING },
          backgroundColor: { type: Type.STRING },
          strokeWidth: { type: Type.NUMBER },
          roughness: { type: Type.NUMBER },
          opacity: { type: Type.NUMBER },
          fillStyle: {
            type: Type.STRING,
            enum: ["solid", "hachure", "cross-hatch"],
          },
          points: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
            },
          },
        },
        required: ["id", "type", "x", "y"],
      },
    },
  },
  required: ["elements"],
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, tool, systemPrompt } = await request.json();

    if (
      typeof prompt !== "string" ||
      typeof tool !== "string" ||
      typeof systemPrompt !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing or invalid request data.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const finalPrompt = `${systemPrompt}

User request:
${prompt}

CANVAS GENERATION RULES:
Create a professional ${tool}.
Return a single JSON object matching the provided schema.

Every element must have a unique id, type, x, and y.
Add width and height where appropriate.
Use hex colors, consistent spacing, and avoid overlaps.
Use arrows for relationships.
Do not include Markdown or explanatory text.`;
    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    console.log("Gemini response received");

    if (!response.text) {
      throw new Error("The AI returned an empty response.");
    }

    const diagramResult = JSON.parse(response.text);

    return NextResponse.json({
      success: true,
      diagramResult,
    });
  } catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  console.error("AI generation error message:", message);
  console.error("AI generation error full:", error);

  return NextResponse.json(
    {
      success: false,
      message: message || "Unknown server error",
    },
    { status: 500 },
  );
}
}