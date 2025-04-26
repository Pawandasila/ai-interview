import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowLeft, CheckCircle, Loader2Icon, Tag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const QuestionList = ({ onPrevStep, formData, onSubmit, questions, setQuestions }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [hasGenerated, setHasGenerated] = useState(false);

    
  
    useEffect(() => {
      if (
        formData && 
        Object.keys(formData).length !== 0 && 
        !hasGenerated
      ) {
        GenerateQuestion();
      }
    }, [formData]);
    
  
    const GenerateQuestion = async () => {
      console.log(formData)
      setLoading(true);
      setError(null);
      if (hasGenerated) return;
      try {
        const response = await axios.post("/api/ai-model", {
          ...formData,
        });
    
        const rawContent = response.data.content;
        
        // First check if there's valid content before proceeding
        if (!rawContent) {
          throw new Error("Empty response received");
        }
        
        let parsedQuestions;
        try {
          // Try direct parsing first in case it's already JSON
          parsedQuestions = JSON.parse(rawContent);
        } catch (parseError) {
          // If direct parsing fails, try to extract JSON from markdown code blocks
          const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch && jsonMatch[1]) {
            parsedQuestions = JSON.parse(jsonMatch[1].trim());
          } else {
            // If no code blocks found, look for anything that might be JSON
            const possibleJson = rawContent.match(/\{[\s\S]*\}/);
            if (possibleJson) {
              parsedQuestions = JSON.parse(possibleJson[0]);
            } else {
              throw new Error("Could not find valid JSON in the response");
            }
          }
        }
        
        // Validate the parsed structure
        if (parsedQuestions && parsedQuestions.interviewQuestions) {
          setQuestions(parsedQuestions.interviewQuestions);
          setHasGenerated(true);
          toast.success("Questions Generated Successfully");
        } else {
          throw new Error("Response doesn't contain expected interview questions format");
        }
      } catch (error) {
        console.error("Error while generating AI response", error);
        // Only show toast on error, not on success
        toast.error("Failed to generate questions");
        setError("Failed to generate questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    const handleSubmitQuestions = async () => {
      setSubmitting(true);
      try {
        await onSubmit();
      } catch (error) {
        console.error("Error submitting questions:", error);
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="flex flex-col gap-6 bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        {(submitting) && (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2Icon className="animate-spin w-8 h-8 text-blue-400" />
            <p className="text-white text-sm">Submitting Interview...</p>
          </div>
        </div>
      )}

      <div className="text-2xl font-bold text-white mb-2">
        Interview Questions
      </div>

      {loading ? (
        <div className="p-8 rounded-xl border border-gray-700 shadow-md bg-gray-800 flex flex-col gap-5 items-center justify-center text-center transition-all duration-300">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-900/30 rounded-full">
            <Loader2Icon className="animate-spin text-blue-400 w-8 h-8" />
          </div>
          <div className="text-xl font-semibold text-gray-100">
            Generating Interview Questions
          </div>
          <p className="text-gray-400 max-w-md">
            Our AI is drafting personalized questions based on your job position
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-red-700 shadow-md bg-red-900/20 text-center">
          <p className="text-red-400">{error}</p>
          <Button 
            onClick={GenerateQuestion} 
            className="mt-4 bg-red-600 hover:bg-red-500 text-white"
          >
            Try Again
          </Button>
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-700 p-6 bg-gray-800 hover:bg-gray-750 transition-all duration-200 shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center text-blue-400 font-semibold text-lg w-6">
                  {index + 1}.
                </div>

                <div className="flex-1">
                  <h2 className="text-[18px] text-white mb-2">
                    {item.question}
                  </h2>
                  <div className="flex items-center text-sm text-gray-400 mt-3">
                    <Tag className="w-4 h-4 mr-1" />
                    <span className="bg-gray-700 px-2 py-1 rounded-md">
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-600/20 rounded-full p-2 text-blue-400 flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-700 p-8 flex flex-col items-center justify-center min-h-64 bg-gray-800/50">
          <div className="text-gray-400 mb-2">No questions generated yet</div>
          <p className="text-gray-500 text-sm text-center">
            Complete the previous steps and questions will appear here
          </p>
          <Button
            onClick={GenerateQuestion}
            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white"
          >
            Generate Questions
          </Button>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button
          type="button"
          onClick={onPrevStep}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          disabled={loading || submitting || questions.length === 0}

        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

       <Button
          type="button"
          onClick={handleSubmitQuestions}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-md"
          disabled={loading || submitting || questions.length === 0}
        >
          {submitting ? (
            <>
              <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Interview"
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuestionList;