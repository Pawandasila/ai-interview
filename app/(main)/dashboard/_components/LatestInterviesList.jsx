"use client";

import { Button } from "@/components/ui/button";
import { Camera, Video } from "lucide-react";
import React, { useState } from "react";

const LatestInterviewsList = () => {
  const [interviewList, setInterviewList] = useState([]);

  return (
    <div className="my-8">
      <h2 className="font-bold text-2xl text-white mb-5">Previously Created Interviews</h2>
      
      <div className="card-border w-full">
        <div className="card p-6">
          {interviewList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-y-5 py-12">
              <div className="bg-dark-300 rounded-full p-4">
                <Video className="h-10 w-10 text-primary-200" />
              </div>
              
              <h3 className="interview-text">You don&apos;t have any interviews yet.</h3>
              
              <Button className="btn-primary mt-3">
                Create one now
              </Button>
            </div>
          ) : (
            <div className="interviews-section">
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestInterviewsList;