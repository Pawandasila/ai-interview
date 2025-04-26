"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Timer, Mic, MicOff, Phone, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/app/Provider";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { extractAndParseJSON } from "@/utils/jsonParser";
import { useParams, useRouter } from "next/navigation";

const StartInterview = () => {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const { user } = useUser();
  const vapiRef = useRef(null);
  const audioContextRef = useRef(null); // Reference to keep track of AudioContext
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [conversation, setConversation] = useState([]);
  const callInitiatedRef = useRef(false);

  const { interviewId } = useParams();
  const router = useRouter();

  // Interview timer state
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Device control states
  const [micEnabled, setMicEnabled] = useState(true);

  // Initialize Vapi only once
  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
      setupEventListeners();
    }

    return () => {
      cleanupVapi();
    };
  }, []);

  const setupEventListeners = () => {
    if (!vapiRef.current) return;

    vapiRef.current.on("speech-start", () => {
      setIsSpeaking(true);
      setIsUserActive(false);
    });

    vapiRef.current.on("speech-end", () => {
      setIsSpeaking(false);
      setIsUserActive(true);
    });

    vapiRef.current.on("call-start", () => {
      setInterviewStarted(true);
      callInitiatedRef.current = true;
      // Store AudioContext reference when call starts
      if (vapiRef.current && vapiRef.current.audioContext) {
        audioContextRef.current = vapiRef.current.audioContext;
      }
      toast.success("Voice interview has started! All the best!");
    });

    vapiRef.current.on("call-end", async () => {
      setInterviewStarted(false);
      setInterviewEnded(true);
      callInitiatedRef.current = false;
      toast.success("Interview ended");

      // Save conversation data immediately upon call end
      saveConversationToDatabase();
    });

    vapiRef.current.on("error", (error) => {
      toast.error("There was an error with your interview connection.");
      console.error("Vapi error:", error);
    });

    // Capture conversation data
    vapiRef.current.on("message", (message) => {
      // Handle different possible message formats
      if (Array.isArray(message)) {
        setConversation(message);
      } else if (message && Array.isArray(message.conversation)) {
        setConversation(message.conversation);
      } else if (message && message.conversation && Array.isArray(message.conversation.messages)) {
        setConversation(message.conversation.messages);
      }
    });
  };

  // Function to save conversation data to database
  const saveConversationToDatabase = async () => {
    // Check if we have conversation data in state
    if (conversation && Array.isArray(conversation) && conversation.length > 0) {
      try {
        // Save to database
        const { error } = await supabase
          .from("interview-feedback")
          .upsert({
            interview_id: interviewId,
            userName: interviewInfo?.candidateName || "Unknown",
            userEmail: interviewInfo?.email || "unknown@example.com",
            feedback: conversation,
          });

        if (error) {
          toast.error("Failed to save interview data");
          console.error("Database error:", error);
        }
      } catch (error) {
        toast.error("Failed to save interview data");
        console.error("Error saving conversation:", error);
      }
    }
  };

  // Function to generate feedback
  const GenerateFeedback = async () => {
    let loadingToast = null;
  
    try {
      // Show loading toast
      loadingToast = toast.loading("Generating your interview feedback...");
  
      // Check if we have conversation data
      if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No conversation data available for feedback");
        return;
      }
  
      // Make the API call to your feedback endpoint
      const result = await axios.post("/api/ai-feedback", {
        conversation: conversation,
      });
  
      if (result.data && result.data.content) {
        const content = result.data.content;
        const jsonData = extractAndParseJSON(content);
  
        if (jsonData) {
          toast.dismiss(loadingToast);
          loadingToast = null;
  
          // Insert into Supabase
          const { error } = await supabase
            .from("interview-feedback")
            .update({ 
              ai_feedback: jsonData,
            })
            .eq('interview_id', interviewId);
            
          if (error) {
            toast.error("Error saving feedback");
            console.error("Database update error:", error);
          } else {
            toast.success("Feedback generated successfully!");
  
            // Update interview info with feedback
            setInterviewInfo((prev) => ({
              ...prev,
              feedback: jsonData,
            }));
            
            // Redirect to feedback page
            router.push(`/interview/${interviewId}/feedback`);
          }
        } else {
          toast.dismiss(loadingToast);
          toast.error("Could not parse feedback data");
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to generate feedback");
      }
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.error("Error generating feedback");
      console.error("Feedback generation error:", error);
    }
  };

  // Function to stop the interview
  const stopInterview = async () => {
    if (vapiRef.current) {
      try {
        if (callInitiatedRef.current) {
          vapiRef.current.stop();
          callInitiatedRef.current = false;
          setInterviewEnded(true);
          toast.success("Interview ended");

          // Explicitly save conversation when stopping
          await saveConversationToDatabase();
        }
      } catch (e) {
        console.error("Error stopping interview:", e);
        toast.error("Error stopping interview");
      }
    }
  };

  // Proper cleanup of AudioContext to prevent the "Cannot close a closed AudioContext" error
  const cleanupVapi = () => {
    if (vapiRef.current) {
      try {
        if (callInitiatedRef.current) {
          vapiRef.current.stop();
          callInitiatedRef.current = false;
        }
        
        // Only close the AudioContext if it exists and isn't already closed
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          try {
            audioContextRef.current.close();
          } catch (err) {
            console.warn("AudioContext already closed:", err);
          }
        }
        
        audioContextRef.current = null;
      } catch (e) {
        console.error("Cleanup error:", e);
      }
      vapiRef.current.removeAllListeners();
    }
  };

  // Start the interview when data is available
  useEffect(() => {
    if (
      interviewInfo?.QuestionList &&
      !interviewStarted &&
      vapiRef.current &&
      !callInitiatedRef.current &&
      !interviewEnded
    ) {
      const timer = setTimeout(() => {
        startCall();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [interviewInfo]);

  const startCall = () => {
    try {
      if (
        !vapiRef.current ||
        interviewStarted ||
        callInitiatedRef.current ||
        !interviewInfo?.QuestionList
      ) {
        return;
      }

      callInitiatedRef.current = true;

      const questionArray = JSON.parse(interviewInfo.QuestionList);
      const questionList = questionArray.map((q) => q.question).join(", ");

      // Add job duration info to the assistant's context
      let durationInfo = "";
      if (interviewInfo?.jobDuration) {
        durationInfo = `This interview is scheduled for ${interviewInfo.jobDuration}. You must complete the interview within this time limit.`;
      }

      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo?.candidateName}, how are you? Ready for your interview on ${interviewInfo?.jobPosition}?`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `
        You are an AI voice assistant conducting interviews.
        Your job is to ask candidates provided interview questions, assess their responses.
        ${durationInfo}
        Begin the conversation with a friendly introduction, setting a relaxed yet professional tone.
        Ask one question at a time and wait for the candidate's response before proceeding.
        Questions: ${questionList}
        If the candidate struggles, offer hints or rephrase the question without giving away the answer.
        Provide brief, encouraging feedback after each answer.
        Keep the conversation natural and engaging.
        End on a positive note.
        `.trim(),
            },
          ],
        },
      };

      vapiRef.current.start(assistantOptions);
    } catch (error) {
      console.error("Interview start error:", error);
      toast.error("Failed to start the interview. Please try again.");
      callInitiatedRef.current = false;
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    const newMicState = !micEnabled;
    setMicEnabled(newMicState);

    if (!newMicState && interviewStarted) {
      if (vapiRef.current && callInitiatedRef.current) {
        setTimeout(() => {
          vapiRef.current.send(
            "I notice your microphone is muted. Please unmute yourself so I can hear your responses."
          );
        }, 100);
      }
    }
  };

  // Format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && interviewStarted) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, interviewStarted]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupVapi();
    };
  }, []);

  if (!interviewInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-light-200">Loading interview data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
      {/* Header with timer and interview info */}
      <div className="p-3 md:p-4 border-b border-dark-100 bg-dark-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <h2 className="font-bold text-base md:text-lg text-light-100 truncate max-w-xs md:max-w-md">
            AI Interview: {interviewInfo.jobPosition}
          </h2>
          <p className="text-xs text-light-300">
            Duration: {interviewInfo.jobDuration || "Not specified"}
          </p>
        </div>
        <div className="flex gap-2 items-center bg-dark-200 py-1 px-3 rounded-full shrink-0">
          <Timer className="size-3 md:size-4 text-primary-200" />
          <span className="text-light-200 font-mono text-xs md:text-sm">{formatTime(time)}</span>
        </div>
      </div>

      {/* Main content area with padding that adjusts for the fixed bottom bar */}
      <div className="flex-grow p-3 md:p-6 flex flex-col pb-24 relative">
        {/* Post-Interview UI - Show when interview has ended */}
        {interviewEnded && (
          <div className="bg-dark-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-primary-200">
            <h2 className="text-lg md:text-xl font-semibold mb-2 text-light-100">
              Interview Completed
            </h2>
            <p className="text-sm md:text-base text-light-200 mb-3 md:mb-4">
              The interview has ended. You can now generate feedback.
            </p>
            <button
              onClick={GenerateFeedback}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm md:text-base transition-colors duration-200"
            >
              Generate Interview Feedback
            </button>
          </div>
        )}

        {/* Participants grid - responsive for mobile */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* AI Interviewer Box */}
          <div
            className={`bg-dark-200 rounded-lg border ${
              isSpeaking
                ? "border-blue-500 shadow-lg shadow-blue-500/20"
                : "border-dark-100"
            } overflow-hidden relative flex flex-col transition-all duration-300 h-40 md:h-auto`}
          >
            <div className="absolute top-2 left-2 bg-dark-300/80 text-light-200 text-xs py-1 px-2 rounded-md">
              AI Interviewer
            </div>

            {isSpeaking && (
              <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs py-1 px-2 rounded-md flex items-center animate-pulse">
                <span className="mr-1">●</span> Speaking
              </div>
            )}

            <div className="flex-grow flex items-center justify-center p-2">
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-20 h-20 md:w-28 md:h-28 bg-blue-700 rounded-full flex items-center justify-center ${
                    isSpeaking ? "ring-4 ring-blue-500 ring-opacity-50" : ""
                  }`}
                >
                  <Image
                    src="/robot.png"
                    alt="AI Interviewer"
                    width={100}
                    height={100}
                    className={`w-full h-full object-cover rounded-full border-2 border-blue-500 ${
                      isSpeaking ? "animate-pulse" : ""
                    }`}
                  />
                </div>
                <h3 className="mt-2 md:mt-3 text-light-100 font-medium text-sm md:text-base">
                  AI Interviewer
                </h3>
              </div>
            </div>
          </div>

          {/* Candidate Box */}
          <div
            className={`bg-dark-200 rounded-lg border ${
              isUserActive
                ? "border-green-500 shadow-lg shadow-green-500/20"
                : "border-dark-100"
            } overflow-hidden relative flex flex-col transition-all duration-300 h-40 md:h-auto`}
          >
            <div className="absolute top-2 left-2 bg-dark-300/80 text-light-200 text-xs py-1 px-2 rounded-md">
              Candidate
            </div>

            {isUserActive && (
              <div className="absolute top-2 right-2 bg-green-600/80 text-white text-xs py-1 px-2 rounded-md flex items-center animate-pulse">
                <span className="mr-1">●</span> Your Turn
              </div>
            )}

            {!micEnabled && (
              <div className="absolute top-2 right-2 md:top-10 md:right-2 bg-red-600/80 text-white text-xs py-1 px-2 rounded-md flex items-center">
                <MicOff className="size-3 mr-1" /> Muted
              </div>
            )}

            <div className="flex-grow flex items-center justify-center p-2">
              <div className="flex flex-col items-center">
                {user?.picture ? (
                  <div
                    className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center ${
                      isUserActive
                        ? "ring-4 ring-green-500 ring-opacity-50"
                        : ""
                    }`}
                  >
                    <Image
                      src={user.picture}
                      alt={interviewInfo?.candidateName || "Candidate"}
                      width={128}
                      height={128}
                      className={`w-full h-full object-cover rounded-full border-2 border-green-500 ${
                        !micEnabled ? "opacity-70" : ""
                      }`}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-20 h-20 md:w-28 md:h-28 bg-green-600 rounded-full flex items-center justify-center border-2 border-green-500 ${
                      isUserActive
                        ? "ring-4 ring-green-500 ring-opacity-50"
                        : ""
                    } ${!micEnabled ? "opacity-70" : ""}`}
                  >
                    <span className="text-xl md:text-2xl font-bold text-dark-100">
                      {interviewInfo?.candidateName?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <h3 className="mt-2 md:mt-3 text-light-100 font-medium text-sm md:text-base truncate max-w-full px-2">
                  {interviewInfo?.candidateName || "Candidate"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Controls bar - fixed at bottom with improved mobile styling */}
        <div className="fixed bottom-0 left-0 right-0 bg-dark-300 border-t border-dark-100 py-3 px-4 z-10">
          <div className="max-w-screen-xl mx-auto flex justify-center items-center gap-3 md:gap-4">
            {/* Mic toggle */}
            <button
              onClick={toggleMicrophone}
              className={`${
                micEnabled
                  ? "bg-dark-200 hover:bg-dark-100"
                  : "bg-red-600 hover:bg-red-700"
              } p-3 md:p-4 rounded-full transition-colors duration-200`}
              aria-label="Toggle microphone"
            >
              {micEnabled ? (
                <Mic className="size-5 md:size-6" />
              ) : (
                <MicOff className="size-5 md:size-6" />
              )}
            </button>

            {/* End call button */}
            <button
              className="bg-red-600 hover:bg-red-700 p-3 md:p-4 rounded-full transition-colors duration-200"
              onClick={stopInterview}
              aria-label="End interview"
            >
              <Phone className="size-5 md:size-6 rotate-135" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartInterview;