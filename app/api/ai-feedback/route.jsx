import { NextResponse } from "next/server";
import OpenAI from "openai";
import { extractAndParseJSON } from "@/utils/jsonParser";

// Define the feedback prompt directly
const FeedbackPrompt = `
{
  "feedback": {
    "rating": {
      "technicalSkills": [1-10 score],
      "problemSolving": [1-10 score],
      "communication": [1-10 score],
      "experience": [1-10 score],
      "cultureAlignment": [1-10 score],
      "learningAptitude": [1-10 score]
    },
    "summary": "A concise 3-5 sentence summary evaluating the candidate's overall performance, highlighting key strengths and critical weaknesses",
    "recommendation": "Yes" or "No",
    "recommendationMsg": "Clear explanation for your recommendation decision, including specific factors that influenced it"
  },
  "detailedFeedback": {
    "overview": "A paragraph providing holistic analysis of the candidate's performance, including technical capability, communication skills, and problem-solving approach",
    "strengths": [
      "Specific strength with supporting evidence from the interview",
      "Another distinct strength with example",
      "Third strength with concrete example from conversation"
    ],
    "areas_for_improvement": [
      "Critical area for improvement with specific example and suggestion",
      "Second improvement area with clear evidence and actionable advice",
      "Third improvement area with specific recommendation"
    ],
    "communication_skills": {
      "clarity": "Evaluation with specific examples of how well concepts were explained",
      "technical_vocabulary": "Assessment of domain-specific language usage and accuracy",
      "active_listening": "Analysis of how well the candidate understood and addressed questions",
      "questioning": "Evaluation of the quality of questions the candidate asked"
    },
    "technical_assessment": {
      "core_knowledge": "Evaluation of fundamental knowledge in their claimed expertise areas",
      "depth_of_understanding": "Analysis of their deeper understanding beyond surface-level answers",
      "practical_application": "Assessment of their ability to apply knowledge to real scenarios"
    },
    "detailed_question_analysis": [
      {
        "question": "Exact question asked during interview",
        "response_quality": "Rating from 1-10",
        "feedback": "Specific, actionable feedback on what was good/bad about this response",
        "improvement_suggestion": "Specific advice on how to improve this answer"
      }
    ],
    "overall_score": "Score from 1-100 reflecting comprehensive evaluation",
    "recommendations": [
      "Specific, actionable career development recommendation",
      "Learning resource suggestion related to improvement areas",
      "Practical advice for future interviews based on performance"
    ]
  }
}

Rate the candidate rigorously but fairly, using specific evidence from the conversation to support each evaluation point. Be honest about weaknesses while acknowledging strengths.
`;

export async function POST(req) {
  const { conversation } = await req.json();

  if (!conversation) {
    return NextResponse.json(
      { message: "Missing conversation data" },
      { status: 400 }
    );
  }

  // Format the conversation data for better analysis
  const formattedConversation = Array.isArray(conversation) 
    ? conversation
    : (conversation.messages || []);

  // Create a more restrictive prompt for better JSON outputs
  const final_prompt = 
    FeedbackPrompt.replace(`{{conversation}}`, JSON.stringify(formattedConversation)) +
    "\n\nIMPORTANT: Return ONLY valid JSON without code blocks, markdown formatting, or any explanation text. The response must be a complete, properly formatted JSON object that can be parsed directly.";

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-27b-it:free",
      messages: [
        {
          role: "system",
          content: "You are an interview feedback assistant. Your responses must be in valid, parseable JSON format only. No markdown, no explanations, no code blocks - just the raw JSON object."
        },
        { role: "user", content: final_prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Get the response content
    const responseContent = completion.choices[0].message.content;
    // Use the enhanced utility function to extract and parse JSON
    const parsedJson = extractAndParseJSON(responseContent);

    if (parsedJson) {
     
      if (!parsedJson.feedback || !parsedJson.detailedFeedback) {
        // Add missing sections if needed
        if (!parsedJson.feedback) {
          parsedJson.feedback = {
            rating: {
              technicalSkills: 5,
              communication: 5,
              problemSolving: 5,
              experience: 5
            },
            summary: "Interview feedback unavailable",
            recommendation: "No",
            recommendationMsg: "Unable to generate a recommendation"
          };
        }
        
        if (!parsedJson.detailedFeedback) {
          parsedJson.detailedFeedback = {
            overview: "Detailed feedback unavailable",
            strengths: ["Unable to determine strengths"],
            areas_for_improvement: ["Unable to determine areas for improvement"],
            overall_score: "N/A"
          };
        }
      }
      
      // Return the cleaned and validated JSON
      return NextResponse.json({
        content: JSON.stringify(parsedJson, null, 2),
      });
    } else {
      
      const defaultFeedback = {
        feedback: {
          rating: {
            technicalSkills: 5,
            communication: 5,
            problemSolving: 5,
            experience: 5
          },
          summary: "Unable to process interview feedback",
          recommendation: "No",
          recommendationMsg: "Could not generate a recommendation due to processing error"
        },
        detailedFeedback: {
          overview: "Processing error occurred",
          strengths: ["Unable to determine strengths"],
          areas_for_improvement: ["Unable to determine areas for improvement"],
          overall_score: "N/A"
        }
      };
      
      return NextResponse.json({
        content: JSON.stringify(defaultFeedback, null, 2),
        error: "Could not parse as valid JSON"
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong with AI processing",
        error: error.message
      },
      { status: 500 }
    );
  }
}