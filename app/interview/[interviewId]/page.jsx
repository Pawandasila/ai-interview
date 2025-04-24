"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/services/supabaseClient"
import { useParams, useRouter } from "next/navigation";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import {
  Clock,
  Info,
  Mic,
  Check,
  XCircle,
  AlertTriangle,
  Loader2Icon,
} from "lucide-react";

const Interview = () => {
  const { interviewId } = useParams();
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const [interviewData, setInterviewData] = useState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [micStatus, setMicStatus] = useState("untested");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // For feedback messages
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  // For microphone preview
  const [showMicPreview, setShowMicPreview] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  // For active streams
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  const handleJoin = async () => {
    if (!name.trim()) {
      setFeedbackMessage("Please enter your full name to continue.");
      setFeedbackType("error");
      return;
    }
    
    if (micStatus === "untested") {
      setFeedbackMessage(
        "Please test your microphone before joining. Click on the microphone icon to test."
      );
      setFeedbackType("warning");
      return;
    }
    
    // Set loading state to true
    setIsLoading(true);
    
    try {
      let { data: interviews, error } = await supabase
        .from("interviews")
        .select("*")
        .eq('interview_id', interviewId);
      
      if (error) throw error;
      
      if (interviews && interviews.length > 0) {
        const fullInterviewData = interviews[0];
        console.log(fullInterviewData);
        
        // Update both local state and context
        setInterviewData(fullInterviewData);
        setInterviewInfo({
          ...fullInterviewData,
          email : email,
          candidateName: name
        });
        
        setFeedbackMessage(`Welcome, ${name}! Connecting to your interview...`);
        setFeedbackType("success");
        
        
        setTimeout(() => {
          router.push('/interview/'+interviewId+'/start');
        }, 1500);
        
      } else {
        setIsLoading(false);
        setFeedbackMessage(`No interview found with ID: ${interviewId}`);
        setFeedbackType("error");
      }
    } catch (err) {
      console.error("Error joining interview:", err);
      setFeedbackMessage(`Failed to join interview: ${err.message || "Unknown error"}`);
      setFeedbackType("error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      getInterviewDetail();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [interviewId]); 

  const getInterviewDetail = async () => {
    try {
      let { data: interviews, error } = await supabase
        .from("interviews")
        .select("jobPosition, jobDuration")
        .eq("interview_id", interviewId);

      if (error) throw error;
      if (interviews && interviews.length > 0) {
        const interviewDetails = interviews[0];
        setInterviewData(interviewDetails);
      } else {
        setFeedbackMessage("We couldn't find the requested interview.");
        setFeedbackType("error");
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
      setFeedbackMessage("Failed to load interview details. Please try again.");
      setFeedbackType("error");
    }
  };

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage("");
        setFeedbackType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const stopAllMediaStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setShowMicPreview(false);
  };

  const testMic = async () => {
    try {
      // First stop any existing streams
      stopAllMediaStreams();

      setMicStatus("testing");
      // Request only audio, no video
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio analyzer for level visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Function to visualize audio levels
      const visualizeMic = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }

        // Calculate average level (0-100)
        const avg = sum / bufferLength;
        const level = Math.min(100, Math.max(0, avg * 1.5)); // Scale for better visualization
        setMicLevel(level);

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(visualizeMic);
      };

      // Start visualization
      visualizeMic();
      setShowMicPreview(true);

      // Update status
      setMicStatus("success");
      setFeedbackMessage(
        "Microphone is working! Try speaking to see the levels."
      );
      setFeedbackType("success");

      setTimeout(() => {
        setShowMicPreview(false);
        stopAllMediaStreams();
      }, 10000);
    } catch (err) {
      console.error("Microphone test failed:", err);

      // Handle permission denied
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setMicStatus("denied");
        setFeedbackMessage(
          "Microphone access denied. Please enable microphone access in your browser settings."
        );
        setFeedbackType("error");
      } else {
        // Handle other errors
        setMicStatus("error");
        setFeedbackMessage(
          "Microphone error: " +
            (err.message ||
              "We couldn't access your microphone. Please check your device.")
        );
        setFeedbackType("error");
      }
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case "success":
        return <Check className="size-4 text-green-500" />;
      case "error":
      case "denied":
        return <XCircle className="size-4 text-red-500" />;
      case "testing":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
        );
      default:
        return <AlertTriangle className="size-4 text-yellow-500" />;
    }
  };

  return (
    <div className="dark-gradient pattern min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        {/* Main card */}
        <div className="card-border w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row card min-h-[550px]">
            {/* Left column - Image */}
            <div className="lg:w-5/12 blue-gradient-dark rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none p-8 flex flex-col items-center justify-center border-r border-[#4B4D4F33]">
              <Image
                src="/interview_image.png"
                alt="interview"
                width={500}
                height={500}
                className="w-[350px] mb-6"
              />
              <div className="text-center">
                <h2 className="font-bold text-2xl text-primary-100 mb-2">
                  {interviewInfo?.jobPosition || interviewData?.jobPosition || "Job"} Interview
                </h2>
                <div className="flex items-center justify-center gap-2 text-primary-200">
                  <Clock className="size-4" />
                  <span className="font-medium">
                    {interviewInfo?.jobDuration || interviewData?.jobDuration || "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column - Form & Info */}
            <div className="lg:w-7/12 p-8 flex flex-col">
              <h3 className="text-light-100 text-xl font-semibold mb-6">
                Get ready for your voice interview
              </h3>

              {/* Name input */}
              <div className="form mb-4">
                <Input
                  className="input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form mb-4">
                <Input
                  className="input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Feedback message */}
              {feedbackMessage && (
                <div
                  className={`p-3 mb-4 rounded-md ${
                    feedbackType === "error"
                      ? "bg-red-900/30 text-red-200 border border-red-700"
                      : feedbackType === "warning"
                      ? "bg-yellow-900/30 text-yellow-200 border border-yellow-700"
                      : "bg-green-900/30 text-green-200 border border-green-700"
                  }`}
                >
                  <p>{feedbackMessage}</p>
                </div>
              )}

              {/* Mic Preview */}
              {showMicPreview && (
                <div className="mb-4 p-4 bg-dark-300 rounded-lg border border-dark-100">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-light-100 font-medium">
                      Microphone Test
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopAllMediaStreams}
                    >
                      Close
                    </Button>
                  </div>

                  <div className="p-2">
                    <p className="text-sm text-light-300 mb-2">
                      Speak to test your microphone:
                    </p>
                    <div className="h-8 bg-dark-200 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-100"
                        style={{ width: `${micLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guidelines */}
              <div className="bg-dark-200 rounded-xl p-5 mb-8 border border-input flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#FF9D4D] rounded-full p-2">
                    <Info className="size-5 text-dark-100" />
                  </div>
                  <h3 className="text-light-100 text-lg font-medium">
                    Before you begin
                  </h3>
                </div>

                <ul className="space-y-4 list-none">
                  <li className="flex items-start gap-3">
                    <div className="bg-[#FFD166] rounded-full p-1.5 mt-0.5">
                      <Check className="size-3 text-dark-100" />
                    </div>
                    <span className="text-light-100">
                      Ensure a stable internet connection to avoid disruptions.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#FF6B6B] rounded-full p-1.5 mt-0.5">
                      <Check className="size-3 text-dark-100" />
                    </div>
                    <span className="text-light-100">
                      Test your microphone below. Grant browser permissions when prompted.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#9381FF] rounded-full p-1.5 mt-0.5">
                      <Check className="size-3 text-dark-100" />
                    </div>
                    <span className="text-light-100">
                      Choose a quiet environment for the best audio experience.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#4CC9F0] rounded-full p-1.5 mt-0.5">
                      <Check className="size-3 text-dark-100" />
                    </div>
                    <span className="text-light-100">
                      Keep your resume or job-related documents nearby.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={testMic}
                        disabled={micStatus === "testing"}
                        className="bg-dark-200 rounded-full p-3 hover:bg-dark-300 transition-colors relative group disabled:opacity-50"
                      >
                        <Mic className="size-5 text-[#50D8D7]" />
                        {micStatus !== "untested" && (
                          <span className="absolute -top-1 -right-1">
                            {getStatusIndicator(micStatus)}
                          </span>
                        )}
                        <span className="invisible group-hover:visible absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-dark-100 text-light-100 text-xs rounded whitespace-nowrap">
                          Test microphone
                        </span>
                      </button>
                      <span className="text-xs text-light-400">
                        {micStatus === "success" && "Mic working"}
                        {micStatus === "denied" && "Access denied"}
                        {micStatus === "error" && "Mic error"}
                        {micStatus === "testing" && "Testing..."}
                        {micStatus === "untested" && "Test mic"}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm text-light-400">
                    {micStatus === "success" 
                      ? "Microphone ready!"
                      : "Please test your microphone"}
                  </span>
                </div>

                {/* Join button */}
                <Button
                  className="btn-primary min-h-12 w-full text-base"
                  onClick={handleJoin}
                  disabled={isLoading}
                >
                  <Mic className="size-4" />
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full border-b-2 border-white mr-2">
                        <Loader2Icon className="size-4"/>
                      </div>
                    </>
                  ) : (
                    "Join Voice Interview Now"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center mt-6 text-light-400 text-sm">
          © 2025 Voice.AI — AI Powered Interview Platform
        </div>
      </div>
    </div>
  );
};

export default Interview;