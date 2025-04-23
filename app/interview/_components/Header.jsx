"use client";
import Image from "next/image";
import React, { useContext } from "react";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { User } from "lucide-react";

const InterviewHeader = () => {
  const { interviewInfo } = useContext(InterviewDataContext);
  
  return (
    <div className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-dark-400 to-dark-300 border-b border-dark-100 rounded-t-lg shadow-md">
      {/* Logo with subtle hover effect */}
      <div className="transition-transform duration-300 hover:scale-105">
        <Image
          src="/logo.jpg"
          alt="Voice.AI Logo"
          width={145}
          height={50}
          className="w-[120px] sm:w-[145px] h-auto rounded shadow-sm"
          priority
        />
      </div>
      
      {/* Middle section - can be used for interview title/timer */}
      <div className="hidden md:flex flex-col items-center">
        {interviewInfo?.jobPosition && (
          <h2 className="text-primary-100 font-medium">
            {interviewInfo.jobPosition} Interview
          </h2>
        )}
        {interviewInfo?.jobDuration && (
          <p className="text-sm text-primary-200">
            {interviewInfo.jobDuration}
          </p>
        )}
      </div>
      
      {/* Candidate info with visual improvements */}
      {interviewInfo?.candidateName ? (
        <div className="flex items-center gap-3 bg-dark-200 py-2 px-4 rounded-full shadow-inner">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2 hidden sm:block">
            <User className="text-dark-100 size-4" />
          </div>
          <div className="">
            <p className="text-xs text-light-400">Candidate</p>
            <p className="font-medium text-light-100">{interviewInfo.candidateName}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-light-400 bg-dark-200 py-2 px-4 rounded-full opacity-75">
          <User className="size-4" />
          <span className="text-sm">Not connected</span>
        </div>
      )}
    </div>
  );
};

export default InterviewHeader;