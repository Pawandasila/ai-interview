import { FeedbackPrompt } from "@/services/Contexts"
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  const { conversation } = await req.json();

  if (!conversation) {
    return NextResponse.json(
      { message: "Missing conversation data" },
      { status: 400 }
    );
  }

  const final_prompt = FeedbackPrompt.replace(
    `{{conversation}}`,
    JSON.stringify(conversation)
  );

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-27b-it:free",
      messages: [{ role: "user", content: final_prompt }],
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { message: "Something went wrong with AI processing" },
      { status: 500 }
    );
  }
}
