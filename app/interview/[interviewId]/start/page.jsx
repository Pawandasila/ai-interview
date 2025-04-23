"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import {
  Timer,
  Mic,
  MicOff,
  Phone,
  MoreVertical,
  VolumeX,
  Volume2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useUser } from "@/app/Provider";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

const StartInterview = () => {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const { user, loading } = useUser();
  const vapiRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [muteWarningShown, setMuteWarningShown] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(100);
  const [conversation , setConversation] = useState()
  const inactivityTimerRef = useRef(null);
  const callInitiatedRef = useRef(false);

  // Initialize Vapi only once
  useEffect(() => {
    // Only create new instance if one doesn't exist
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
      
      // Setting up event listeners
      setupEventListeners();
    }
    
    return () => {
      cleanupVapi();
    };
  }, []);

  // Setup all event listeners for Vapi
  const setupEventListeners = () => {
    if (!vapiRef.current) return;
    
    vapiRef.current.on("speech-start", () => {
      console.log("Assistant speech has started.");
      setIsSpeaking(true);
      setIsUserActive(false);
    });
    
    vapiRef.current.on("speech-end", () => {
      console.log("Assistant speech has ended.");
      setIsSpeaking(false);
      setIsUserActive(true);
      // Start inactivity timer when it's the user's turn
      startInactivityTimer();
    });
    
    vapiRef.current.on("call-start", () => {
      console.log("Call has started.");
      setInterviewStarted(true);
      callInitiatedRef.current = true;
      toast.success("Voice interview has started! All the best!");
    });
    
    vapiRef.current.on("call-end", () => {
      console.log("Call has ended.");
      setInterviewStarted(false);
      callInitiatedRef.current = false;
      toast.success("Interview ended");
      clearInactivityTimer();
    });
    
    vapiRef.current.on("error", (error) => {
      console.error("Vapi error:", error);
      toast.error("There was an error with your interview connection.");
    });
    
    vapiRef.current.on("transcription", (transcript) => {
      if (transcript.text.trim().length > 0) {
        resetInactivityTimer();
      }
    });

    // vapiRef.on("message", (message) => {
    //     console.log(message);
    //     setConversation(message?.conversation)
    //   });
      
  };

  const GenerateFeedback = ()=>{
     
  }

  // Cleanup function for Vapi
  const cleanupVapi = () => {
    if (vapiRef.current) {
      // Stop any ongoing call
      try {
        if (callInitiatedRef.current) {
          vapiRef.current.stop();
          callInitiatedRef.current = false;
        }
      } catch (e) {
        console.error("Error stopping Vapi:", e);
      }
      
      // Remove all event listeners
      vapiRef.current.removeAllListeners();
    }
    clearInactivityTimer();
  };

  // Start the interview when data is available
  useEffect(() => {
    if (interviewInfo?.QuestionList && !interviewStarted && vapiRef.current && !callInitiatedRef.current) {
      // Add a small delay to ensure any previous instances are fully cleaned up
      const timer = setTimeout(() => {
        startCall();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [interviewInfo, interviewStarted]);

  const startCall = () => {
    try {
      if (!vapiRef.current || interviewStarted || callInitiatedRef.current || !interviewInfo?.QuestionList) {
        return;
      }

      callInitiatedRef.current = true;

      const questionArray = JSON.parse(interviewInfo.QuestionList);
      
      // Now we can use .map on the parsed array
      const questionList = questionArray.map((q) => q.question).join(", ");
      
      console.log("Processed question list:", questionList);
      
      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage:
          "Hi " +
          interviewInfo?.candidateName +
          ", how are you? Ready for your interview on " +
          interviewInfo?.jobPosition +
          "?",
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
        Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
        "Hey there! Welcome to your ${interviewInfo.jobPosition} interview, Let's get started with a few questions!"
        Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
        Questions:${questionList}
        If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
        "Need a hint? Think about how React tracks component updates!"
        Provide brief, encouraging feedback after each answer. Example:
        "Nice! That's a solid answer."
        "Hmm, not quite! Want to try again?"
        Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
        If you notice that the candidate hasn't responded for a while (there's silence), gently prompt them: "Are you still thinking about the question? Would you like me to repeat it or provide a hint?"
        If you detect that the candidate has muted their microphone, say: "I notice your microphone is muted. Please unmute yourself so we can continue with the interview."
        After 5-7 questions, wrap up the interview smoothly by summarizing their performance. Example:
        "That was great! You handled some tough questions well. Keep sharpening your skills!"
        End on a positive note:
        "Thanks for chatting! Hope to see you crushing projects soon!"
        Key Guidelines:
        ✅ Be friendly, engaging, and witty
        ✅ Keep responses short and natural, like a real conversation
        ✅ Adapt based on the candidate's confidence level
        ✅ Pay attention to extended silences and offer help if needed
        ✅ Ensure the interview remains focused on the job position
              `.trim(),
            },
          ],
        },
      };
      
      vapiRef.current.start(assistantOptions);
      
    } catch (error) {
      console.error("Error parsing QuestionList or starting call:", error);
      toast.error("Failed to start the interview. Please try again.");
      callInitiatedRef.current = false;
    }
  };

  
  const startInactivityTimer = () => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      if (isUserActive && !isSpeaking) {
        showUserWarning("You've been quiet for a while. Would you like me to repeat the question?");
        // Trigger AI to ask if user needs the question repeated
        if (vapiRef.current && callInitiatedRef.current) {
          vapiRef.current.send("I notice you've been quiet. Would you like me to repeat the question or provide more clarification?");
        }
      }
    }, 15000); // 15 seconds of silence
  };

  const resetInactivityTimer = () => {
    clearInactivityTimer();
    if (isUserActive) {
      startInactivityTimer();
    }
  };

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const showUserWarning = (message) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => {
      setShowWarning(false);
    }, 5000);
  };

  // Interview timer state
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Device control states
  const [micEnabled, setMicEnabled] = useState(true);

  // Handle microphone toggle
  const toggleMicrophone = () => {
    const newMicState = !micEnabled;
    setMicEnabled(newMicState);
    
    if (!newMicState && interviewStarted && !muteWarningShown) {

      if (vapiRef.current && callInitiatedRef.current) {
        setTimeout(() => {
          vapiRef.current.send("I notice your microphone is muted. For a proper interview experience, please unmute yourself so I can hear your responses.");
        }, 100);
        setMuteWarningShown(true);
        showUserWarning("Please don't mute yourself during the interview");
      }
    } else if (newMicState) {
      setMuteWarningShown(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setAudioVolume(newVolume);
    // If vapi has a volume control method, you would use it here
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
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const stopInterview = () => {
    if (vapiRef.current && callInitiatedRef.current) {
      vapiRef.current.stop();
      callInitiatedRef.current = false;
    }
    setInterviewStarted(false);
  };

  // Various assistant messages can come back (like function calls, transcripts, etc)


  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupVapi();
    };
  }, []);

  if (!interviewInfo) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-transparent rounded-full"></div>
      <span className="ml-2 text-light-200">Loading interview data...</span>
    </div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header with timer and interview info */}
      <div className="p-3 sm:p-4 lg:px-8 border-b border-dark-100 bg-dark-300 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="font-bold text-base sm:text-lg text-light-100">
            AI Interview: {interviewInfo.jobPosition}
          </h2>
          <p className="text-xs text-light-300">Duration: {interviewInfo.jobDuration || "Not specified"}</p>
        </div>
        <div className="flex gap-2 items-center bg-dark-200 py-1 px-3 rounded-full">
          <Timer className="size-4 text-primary-200" />
          <span className="text-light-200 font-mono">{formatTime(time)}</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow p-3 sm:p-6 lg:px-12 xl:px-24 flex flex-col relative">
        {/* Warning message */}
        {showWarning && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-max z-10 bg-yellow-900/80 text-yellow-100 px-4 py-2 rounded-md flex items-center animate-bounce">
            <AlertCircle className="size-4 mr-2" />
            <span>{warningMessage}</span>
          </div>
        )}

        {/* Participants grid */}
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-16 sm:mb-8">
          {/* AI Interviewer Video Box */}
          <div className={`bg-dark-200 rounded-lg border ${isSpeaking ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-dark-100'} overflow-hidden relative flex flex-col transition-all duration-300`}>
            <div className="absolute top-2 left-2 bg-dark-300/80 backdrop-blur-sm text-light-200 text-xs py-1 px-2 rounded-md">
              AI Interviewer
            </div>

            {isSpeaking && (
              <div className="absolute top-2 right-2 bg-blue-600/80 text-white text-xs py-1 px-2 rounded-md flex items-center animate-pulse">
                <span className="mr-1">●</span> Speaking
              </div>
            )}

            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-blue-700 rounded-full flex items-center justify-center ${isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`}>
                  <Image
                    src="/robot.png"
                    alt="AI Interviewer"
                    width={100}
                    height={100}
                    className={`w-full h-full object-cover rounded-full border-2 border-blue-500 ${isSpeaking ? 'animate-pulse' : ''}`}
                  />
                  {isSpeaking && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-3 bg-blue-400 rounded-full animate-soundwave"></div>
                        <div className="w-1 h-5 bg-blue-400 rounded-full animate-soundwave animation-delay-200"></div>
                        <div className="w-1 h-7 bg-blue-400 rounded-full animate-soundwave animation-delay-150"></div>
                        <div className="w-1 h-4 bg-blue-400 rounded-full animate-soundwave animation-delay-300"></div>
                        <div className="w-1 h-2 bg-blue-400 rounded-full animate-soundwave animation-delay-100"></div>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-light-100 font-medium">Mrs. Chintu</h3>
                <p className="text-xs text-primary-200">AI Interviewer</p>
              </div>
            </div>
          </div>

          {/* Candidate Video Box */}
          <div className={`bg-dark-200 rounded-lg border ${isUserActive ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-dark-100'} overflow-hidden relative flex flex-col transition-all duration-300`}>
            <div className="absolute top-2 left-2 bg-dark-300/80 backdrop-blur-sm text-light-200 text-xs py-1 px-2 rounded-md">
              Candidate
            </div>

            {isUserActive && (
              <div className="absolute top-2 right-2 bg-green-600/80 text-white text-xs py-1 px-2 rounded-md flex items-center animate-pulse">
                <span className="mr-1">●</span> Your Turn
              </div>
            )}

            {!micEnabled && (
              <div className="absolute top-10 right-2 bg-red-600/80 text-white text-xs py-1 px-2 rounded-md flex items-center">
                <MicOff className="size-3 mr-1" /> Muted
              </div>
            )}

            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center">
                {user?.picture ? (
                  <div className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center ${isUserActive ? 'ring-4 ring-green-500 ring-opacity-50' : ''}`}>
                    <Image
                      src={user.picture}
                      alt={interviewInfo?.candidateName || "Candidate"}
                      width={128}
                      height={128}
                      className={`w-full h-full object-cover rounded-full border-2 border-green-500 ${!micEnabled ? 'opacity-70' : ''}`}
                    />
                    {isUserActive && micEnabled && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-1">
                          <div className="w-1 h-2 bg-green-400 rounded-full animate-soundwave"></div>
                          <div className="w-1 h-4 bg-green-400 rounded-full animate-soundwave animation-delay-200"></div>
                          <div className="w-1 h-3 bg-green-400 rounded-full animate-soundwave animation-delay-150"></div>
                          <div className="w-1 h-5 bg-green-400 rounded-full animate-soundwave animation-delay-300"></div>
                          <div className="w-1 h-3 bg-green-400 rounded-full animate-soundwave animation-delay-100"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-green-600 rounded-full flex items-center justify-center border-2 border-green-500 ${isUserActive ? 'ring-4 ring-green-500 ring-opacity-50' : ''} ${!micEnabled ? 'opacity-70' : ''}`}>
                    <span className="text-2xl font-bold text-dark-100">
                      {interviewInfo?.candidateName?.[0]?.toUpperCase() || "?"}
                    </span>
                    {isUserActive && micEnabled && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-1">
                          <div className="w-1 h-2 bg-green-400 rounded-full animate-soundwave"></div>
                          <div className="w-1 h-4 bg-green-400 rounded-full animate-soundwave animation-delay-200"></div>
                          <div className="w-1 h-3 bg-green-400 rounded-full animate-soundwave animation-delay-150"></div>
                          <div className="w-1 h-5 bg-green-400 rounded-full animate-soundwave animation-delay-300"></div>
                          <div className="w-1 h-3 bg-green-400 rounded-full animate-soundwave animation-delay-100"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <h3 className="mt-3 text-light-100 font-medium">
                  {interviewInfo?.candidateName || "Connecting..."}
                </h3>
                <p className="text-xs text-green-400">You</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative bg-dark-300 sm:bg-transparent border-t border-dark-100 sm:border-0 py-3 px-4 sm:py-2">
          <div className="flex justify-center sm:justify-center items-center gap-2 sm:gap-4">
            {/* Mic toggle */}
            <button
              onClick={toggleMicrophone}
              className={`${
                micEnabled
                  ? "bg-dark-200 hover:bg-dark-100"
                  : "bg-red-600 hover:bg-red-700"
              } 
                p-3 sm:p-4 rounded-full transition-colors duration-200 relative`}
            >
              {micEnabled ? (
                <Mic className="size-5 sm:size-6" />
              ) : (
                <MicOff className="size-5 sm:size-6" />
              )}
              {!micEnabled && interviewStarted && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>

            {/* Volume slider - only on desktop */}
            <div className="hidden sm:flex items-center bg-dark-200 rounded-full px-3 py-2 gap-2">
              {audioVolume === 0 ? (
                <VolumeX className="size-4 text-light-300" />
              ) : (
                <Volume2 className="size-4 text-light-300" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-dark-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* End call button */}
            <button
              className="bg-red-600 hover:bg-red-700 p-3 sm:p-4 rounded-full transition-colors duration-200"
              onClick={stopInterview}
            >
              <Phone className="size-5 sm:size-6 rotate-135" />
            </button>

            {/* Mobile-only menu button */}
            <button className="sm:hidden absolute right-4 bg-dark-200 hover:bg-dark-100 p-3 rounded-full transition-colors duration-200">
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add this to your global CSS or in a style tag */}
      <style jsx>{`
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        .animate-soundwave {
          animation: soundwave 1s infinite;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default StartInterview;