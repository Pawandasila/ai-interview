"use client";

import { useUser } from "@/app/Provider";
import { supabase } from "@/services/supabaseClient";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/InterviewCard";

const ScheduleInterviewPage = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getInterviewList = async () => {
    setIsLoading(true);
    try {
      const { data: interviews, error } = await supabase
        .from("interviews")
        .select("* , interview-feedback(*)")
        .eq("userEmail", user?.email)
        .order("created_at", { ascending: false });

      console.log(interviews);

      if (error) {
        console.error("Error fetching interviews:", error);
      } else {
        setInterviewList(interviews || []);
      }
    } catch (err) {
      console.error("Exception when fetching interviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      getInterviewList();
    }
  }, [user]);

  return (
    <div>
      <div className="my-8 animate-fadeIn">
        <div className="flex justify-start items-center mb-5">
          <h2 className="font-bold text-2xl text-white">
            Interview Detail with candidates feedback
          </h2>
        </div>

        <div className="card-border w-full">
          <div className="card p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-200"></div>
              </div>
            ) : interviewList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-y-5 py-12">
                <div className="bg-dark-300 rounded-full p-4">
                  <Video className="h-10 w-10 text-primary-200" />
                </div>

                <h3 className="interview-text">
                  You don&apos;t have any interviews yet.
                </h3>

                <Link href="/create-interview">
                  <Button className="btn-primary mt-3 flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Create one now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviewList.map((interview) => (
                  <InterviewCard
                    key={interview.id || interview.interview_id}
                    interview={interview}
                    showView={"true"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewPage;
