import { QUESTION_PROMPT } from "@/services/Contexts"
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  const { jobPosition, jobDescription, jobDuration, jobType } =
    await req.json();

  const FINAL_PROMPT = QUESTION_PROMPT.replace("{jobPosition}", jobPosition)
    .replace("{jobDescription}", jobDescription)
    .replace("{jobDuration}", jobDuration)
    .replace("{jobType}", jobType);

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-27b-it:free",
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.log("something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 400 }
    );
  }
}
