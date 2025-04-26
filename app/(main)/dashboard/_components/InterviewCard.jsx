"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Clock,
  Copy,
  Users,
  Calendar,
  Check,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const InterviewCard = ({ interview, showView }) => {
  console.log(interview);
  if (!interview) return null;
  const [copied, setCopied] = useState(false);

  // Safely parse job types from string to array
  let jobTypes = [];
  try {
    if (interview.jobType) {
      if (
        interview.jobType.startsWith("[") &&
        interview.jobType.endsWith("]")
      ) {
        jobTypes = JSON.parse(interview.jobType);
      } else {
        jobTypes = [interview.jobType];
      }
    }
  } catch (error) {
    console.error("Error parsing jobType:", error);
    jobTypes = interview.jobType ? [interview.jobType] : [];
  }

  // Safely parse QuestionList
  let questionCount = 0;
  try {
    if (interview.QuestionList && typeof interview.QuestionList === "string") {
      const questions = JSON.parse(interview.QuestionList);
      questionCount = Array.isArray(questions) ? questions.length : 0;
    }
  } catch (error) {
    console.error("Error parsing QuestionList:", error);
  }

  // Format creation date if available
  let timeAgo = "";
  try {
    if (interview.created_at) {
      const createdDate = new Date(interview.created_at);
      timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
  }

  // Get feedback count - safely accessing the interview-feedback array
  const feedbackCount = interview["interview-feedback"]
    ? interview["interview-feedback"].length
    : 0;

  const copy = async (interviewId) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_HOST_URL}/${interviewId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);

      // After 2 seconds, reset back to false
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const sendEmail = (interview) => {
    const recipient = interview.userEmail || "";
    const subject = encodeURIComponent(
      `Interview Invitation: ${interview.jobPosition || "Interview"}`
    );

    const interviewLink = `${process.env.NEXT_PUBLIC_HOST_URL}/${interview.interview_id}`;

    const body = encodeURIComponent(
      `Hello,\n\nYou have been invited to an interview for the position of ${interview.jobPosition}.\n\nPlease access your interview here: ${interviewLink}\n\nBest regards,\nYour Company`
    );

    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Open the user's default mail app
    window.open(mailtoLink, "_blank");
  };

  const viewDetail = () => {
    window.location.href = `/scedule-interview/${interview.interview_id}/details`;
  }

  return (
    <div className="dark-gradient rounded-xl overflow-hidden border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-indigo-500/50 h-full flex flex-col">
      {/* Card Header Section */}
      <div className="p-5 flex flex-col gap-2">
        {/* Top row with date and question count */}
        <div className="flex justify-between items-center text-sm mb-1">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Calendar className="h-3.5 w-3.5" />
            <span>{timeAgo}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <Users className="h-3.5 w-3.5 text-indigo-300" />
            <span className="text-slate-200">{questionCount} Questions</span>
          </div>
        </div>

        {/* Job Position - can expand to multiple lines */}
        <h3 className="text-xl font-bold text-white">
          {interview.jobPosition || "Untitled Interview"}
        </h3>

        {/* Type badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Duration badge */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <Clock className="h-3.5 w-3.5 text-indigo-300" />
            <span className="text-slate-200">
              {interview.jobDuration || "N/A"}
            </span>
          </div>

          {/* Job type badges */}
          {jobTypes.map((type, index) => (
            <div
              key={index}
              className="bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700"
            >
              <span className="text-slate-200">{type}</span>
            </div>
          ))}
        </div>
        {feedbackCount > 0 && (
          <Badge className="ml-2 badge bg-transparent text-green-500 mt-4">
            {feedbackCount} Candidate{feedbackCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="mt-auto p-5 pt-4 border-t border-slate-700/50 bg-slate-800/30">
        {!showView ? (
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-indigo-400 text-slate-200"
              size="sm"
              onClick={() => copy(interview.interview_id)}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 mr-2 text-indigo-300" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>

            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border-0"
              size="sm"
              onClick={() => sendEmail(interview)}
            >
              Send
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <Button
              variant={"outline"}
              onClick={() => viewDetail()}
              className={"w-full flex items-center justify-center"}
            >
              <span className="flex items-center gap-2">
                View Details
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCard;
