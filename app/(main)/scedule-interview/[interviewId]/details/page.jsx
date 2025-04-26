"use client";

import { useUser } from "@/app/Provider";
import { supabase } from "@/services/supabaseClient";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import InterviewDetail from "./_components/InterviewDetails";

const InterviewDetailPage = () => {
  const { interviewId } = useParams();
  const { user } = useUser();
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getInterviewDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.email) {
        console.log("User email not available yet");
        setLoading(false);
        return;
      }
      
      const { data: interviews, error: fetchError } = await supabase
        .from("interviews")
        .select("*,interview-feedback(*)")
        .eq('userEmail', user.email)
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: false });
      
      console.log("Fetched interview data:", interviews);
      
      if (fetchError) {
        console.error("Error fetching interviews:", fetchError);
        setError(fetchError.message);
      } else if (interviews && interviews.length > 0) {
        // Set the first interview as the interview data (assuming interview_id is unique)
        setInterviewData(interviews[0]);
      } else {
        console.log("No interview found with ID:", interviewId);
        setInterviewData(null);
      }
    } catch (err) {
      console.error("Exception when fetching interviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId && user) {
      getInterviewDetail();
    }
  }, [interviewId, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-800 dark:text-gray-200">
        <div className="text-red-500 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  
  return <InterviewDetail interviewData={interviewData} />;
};

export default InterviewDetailPage;
