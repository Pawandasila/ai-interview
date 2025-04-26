"use client";

import React, { useState } from "react";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { extractAndParseJSON } from "@/utils/jsonParser";

const TestFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Sample conversation for testing
  const sampleConversation = {
    messages: [
      {
        role: "assistant",
        content: "Hi, I'm your interviewer today. How are you doing?",
      },
      {
        role: "user",
        content: "I'm doing well, thank you. I'm excited for this interview.",
      },
      {
        role: "assistant",
        content: "Great! Let's start with a question about your experience with React.",
      },
      {
        role: "user",
        content: "I've been working with React for about 3 years now. I've built several production applications using React, Redux, and React Router.",
      },
    ],
  };

  const testFeedbackGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the feedback API
      const response = await axios.post("/api/ai-feedback", {
        conversation: sampleConversation,
      });

      setResult(response.data);
      console.log("Raw API response:", response.data);

      // Try to parse the content as JSON
      if (response.data && response.data.content) {
        try {
          const content = response.data.content;
          console.log("Content to parse:", content);
          
          // Use the utility function to extract and parse JSON
          const jsonData = extractAndParseJSON(content);

          if (jsonData) {
            // Test inserting into Supabase
            const { data, error } = await supabase
              .from("interview-feedback")
              .upsert({
                userName: "Test User",
                userEmail: "test@example.com",
                interview_id: "test-" + Date.now(),
                feedback: jsonData,
                recommended: jsonData.feedback?.recommendation === "Yes" || false,
              })
              .select();

            if (error) {
              console.error("Supabase error:", error);
              setError("Supabase error: " + JSON.stringify(error));
            } else {
              console.log("Successfully inserted into Supabase:", data);
              toast.success("Successfully inserted feedback into Supabase!");
              setResult({
                ...response.data,
                parsedJson: jsonData,
                supabaseResult: data,
              });
            }
          } else {
            setError("Could not extract valid JSON from the response");
          }
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          setError("JSON parsing error: " + parseError.message);
        }
      } else {
        setError("No content in API response");
      }
    } catch (apiError) {
      console.error("API error:", apiError);
      setError("API error: " + apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Feedback Generation</h1>
      
      <button
        onClick={testFeedbackGeneration}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {loading ? "Testing..." : "Test Feedback Generation"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestFeedback;