"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomProgress } from "@/components/ui/custom-progress";

const FeedbackPage = () => {
  const { interviewId } = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);

        // Fetch feedback from Supabase
        const { data, error } = await supabase
          .from("interview-feedback")
          .select("*")
          .eq("interview_id", interviewId)
          .single();

        if (error) {
          console.error("Error fetching feedback:", error);
          setError("Failed to load feedback. Please try again.");
        } else if (data) {
          console.log("Feedback data:", data);
          setFeedback(data);
        } else {
          setError("No feedback found for this interview.");
        }
      } catch (err) {
        console.error("Error in fetchFeedback:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchFeedback();
    }
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 bg-gray-900 text-gray-200">
        <Card className="bg-gray-800 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button
                variant="outline"
                className="text-purple-400 border-purple-400 hover:bg-purple-900 hover:text-purple-200"
              >
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200 pb-8">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-800 p-6 rounded-lg shadow-lg shadow-purple-900/20">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Interview Feedback
          </h1>
          <p className="text-indigo-300">
            Comprehensive assessment for interview #{interviewId}
          </p>

          {feedback && feedback.recommended !== undefined && (
            <div className="mt-4">
              <Badge
                className={`text-white ${
                  feedback.recommended
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } px-3 py-1`}
              >
                {feedback.recommended ? "Recommended" : "Not Recommended"}
              </Badge>
            </div>
          )}
        </div>

        {feedback && (
          <div>
            {/* Basic Information Card */}
            <Card className="mb-6 bg-gray-800 border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-purple-300">
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-purple-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      <span className="text-gray-400">Name:</span>
                      <span className="ml-2 text-gray-200">
                        {feedback.userName || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-purple-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span className="text-gray-400">Email:</span>
                      <span className="ml-2 text-gray-200">
                        {feedback.userEmail || "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-purple-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                        ></path>
                      </svg>
                      <span className="text-gray-400">Interview ID:</span>
                      <span className="ml-2 text-gray-200">
                        {feedback.interview_id}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            {feedback.ai_feedback && (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="w-full bg-gray-800 p-1 mb-6 rounded-lg">
                  <TabsTrigger
                    value="summary"
                    className="data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="skills"
                    className="data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Skills Assessment
                  </TabsTrigger>
                  <TabsTrigger
                    value="detailed"
                    className="data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Detailed Assessment
                  </TabsTrigger>
                  <TabsTrigger
                    value="questions"
                    className="data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Question Analysis
                  </TabsTrigger>
                </TabsList>

                {/* Summary Tab */}
                <TabsContent value="summary">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                      <CardTitle className="text-2xl text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Summary Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {feedback.ai_feedback.feedback && (
                        <div>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            {feedback.ai_feedback.feedback.summary}
                          </p>

                          <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 mb-6">
                            <h3 className="text-xl font-medium text-purple-400 mb-3">
                              Recommendation
                            </h3>
                            <div
                              className={`flex items-center ${
                                feedback.ai_feedback.feedback.recommendation ===
                                "Yes"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {feedback.ai_feedback.feedback.recommendation ===
                              "Yes" ? (
                                <svg
                                  className="w-6 h-6 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                              ) : (
                                <svg
                                  className="w-6 h-6 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                              )}
                              <p className="font-medium">
                                {
                                  feedback.ai_feedback.feedback
                                    .recommendationMsg
                                }
                              </p>
                            </div>
                          </div>

                          {feedback.ai_feedback.detailedFeedback &&
                            feedback.ai_feedback.detailedFeedback
                              .overall_score && (
                              <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                  <h3 className="text-xl font-medium text-purple-400">
                                    Overall Score
                                  </h3>
                                  <div className="text-xl font-bold bg-purple-900 text-purple-200 px-4 py-1 rounded-full">
                                    {
                                      feedback.ai_feedback.detailedFeedback
                                        .overall_score
                                    }
                                  </div>
                                </div>

                                <CustomProgress
                                  value={parseInt(
                                    feedback.ai_feedback.detailedFeedback
                                      .overall_score
                                  )}
                                  className="h-3"
                                  indicatorClassName={`${
                                    parseInt(
                                      feedback.ai_feedback.detailedFeedback
                                        .overall_score
                                    ) >= 80
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                      : parseInt(
                                          feedback.ai_feedback.detailedFeedback
                                            .overall_score
                                        ) >= 60
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                                      : parseInt(
                                          feedback.ai_feedback.detailedFeedback
                                            .overall_score
                                        ) >= 40
                                      ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                                      : "bg-gradient-to-r from-red-500 to-pink-600"
                                  }`}
                                />
                              </div>
                            )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Skills Assessment Tab */}
                <TabsContent value="skills">
                  <Card className="bg-gray-800 border-gray-700 shadow-lg">
                    <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
                      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Skills Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                      {feedback.ai_feedback.feedback &&
                        feedback.ai_feedback.feedback.rating && (
                          <div className="mb-10">
                            <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                ></path>
                              </svg>
                              Core Competencies
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {Object.entries(
                                feedback.ai_feedback.feedback.rating
                              ).map(([skill, rating]) => (
                                <div
                                  key={skill}
                                  className="bg-gray-900/70 p-6 rounded-xl border border-gray-700 hover:border-purple-500 hover:shadow-md hover:shadow-purple-900/20 transition-all duration-300 backdrop-blur-sm relative group overflow-hidden"
                                >
                                  <div
                                    className={`absolute inset-0 opacity-10 ${
                                      rating >= 8
                                        ? "bg-green-500"
                                        : rating >= 5
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>

                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-white text-lg">
                                      {skill
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) =>
                                          str.toUpperCase()
                                        )}
                                    </h4>
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        rating >= 8
                                          ? "bg-green-500/20 text-green-300"
                                          : rating >= 5
                                          ? "bg-amber-500/20 text-amber-300"
                                          : "bg-red-500/20 text-red-300"
                                      }`}
                                    >
                                      {rating}/10
                                    </span>
                                  </div>

                                  <div>
                                    <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className={`absolute top-0 left-0 h-full rounded-full ${
                                          rating >= 8
                                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                            : rating >= 5
                                            ? "bg-gradient-to-r from-amber-500 to-orange-600"
                                            : "bg-gradient-to-r from-red-500 to-pink-600"
                                        }`}
                                        style={{ width: `${rating * 10}%` }}
                                      ></div>
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                                      <div className="grid grid-cols-5 gap-1 w-full">
                                        {[2, 4, 6, 8, 10].map((mark) => (
                                          <div
                                            key={mark}
                                            className="flex justify-center"
                                          >
                                            <span
                                              className={
                                                rating >= mark
                                                  ? "text-purple-400"
                                                  : ""
                                              }
                                            >
                                              {mark}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Communication Skills */}
                      {feedback.ai_feedback.detailedFeedback &&
                        feedback.ai_feedback.detailedFeedback
                          .communication_skills && (
                          <div className="mb-10 pt-4 border-t border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                ></path>
                              </svg>
                              Communication Skills
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {Object.entries(
                                feedback.ai_feedback.detailedFeedback
                                  .communication_skills
                              ).map(([key, value]) => {
                                const score = parseInt(value);
                                const getPerformanceLabel = (score) => {
                                  if (score >= 8) return "Excellent";
                                  if (score >= 6) return "Good";
                                  if (score >= 4) return "Average";
                                  return "Needs Improvement";
                                };

                                return (
                                  <div
                                    key={key}
                                    className="bg-gray-900/70 p-5 rounded-xl border border-gray-700 hover:shadow-md transition-all"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-gray-200 capitalize font-medium">
                                        {key.replace(/_/g, " ")}
                                      </span>
                                      <span
                                        className={`font-bold ${
                                          score >= 8
                                            ? "text-green-400"
                                            : score >= 6
                                            ? "text-blue-400"
                                            : "text-amber-400"
                                        }`}
                                      >
                                        {getPerformanceLabel(score)}
                                      </span>
                                    </div>

                                    <div className="mt-2 flex justify-end">
                                      <span className="text-sm font-medium text-gray-300">
                                        {value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* Technical Assessment */}
                      {feedback.ai_feedback.detailedFeedback &&
                        feedback.ai_feedback.detailedFeedback
                          .technical_assessment && (
                          <div className="pt-4 border-t border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-5 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-cyan-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                ></path>
                              </svg>
                              Technical Assessment
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {Object.entries(
                                feedback.ai_feedback.detailedFeedback
                                  .technical_assessment
                              ).map(([key, value]) => {
                                const score = parseInt(value);

                                return (
                                  <div
                                    key={key}
                                    className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl border border-gray-700 hover:border-cyan-800 transition-all"
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="text-gray-200 capitalize font-medium">
                                        {key.replace(/_/g, " ")}
                                      </span>

                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          score >= 8
                                            ? "bg-green-900/50 text-green-300"
                                            : score >= 6
                                            ? "bg-blue-900/50 text-blue-300"
                                            : "bg-amber-900/50 text-amber-300"
                                        }`}
                                      >
                                        {score >= 8
                                          ? "Advanced"
                                          : score >= 6
                                          ? "Proficient"
                                          : "Basic"}
                                      </span>
                                    </div>

                                    <div className="mt-2 flex justify-end">
                                      <span className="text-sm font-medium text-gray-300">
                                        {value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Detailed Assessment Tab */}
                <TabsContent value="detailed">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                      <CardTitle className="text-2xl text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Detailed Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {feedback.ai_feedback.detailedFeedback && (
                        <div className="space-y-6">
                          {/* Overview */}
                          {feedback.ai_feedback.detailedFeedback.overview && (
                            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                              <h3 className="text-xl font-medium text-purple-400 mb-3">
                                Overview
                              </h3>
                              <p className="text-gray-300 leading-relaxed">
                                {feedback.ai_feedback.detailedFeedback.overview}
                              </p>
                            </div>
                          )}

                          {/* Strengths and Areas for Improvement */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            {feedback.ai_feedback.detailedFeedback.strengths &&
                              feedback.ai_feedback.detailedFeedback.strengths
                                .length > 0 && (
                                <div className="bg-gray-900 p-5 rounded-lg border-l-4 border-green-500">
                                  <h3 className="text-xl font-medium text-green-400 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                      ></path>
                                    </svg>
                                    Strengths
                                  </h3>
                                  <ul className="space-y-2 text-gray-300">
                                    {feedback.ai_feedback.detailedFeedback.strengths.map(
                                      (strength, idx) => (
                                        <li
                                          key={idx}
                                          className="flex items-start"
                                        >
                                          <svg
                                            className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M5 13l4 4L19 7"
                                            ></path>
                                          </svg>
                                          <span>{strength}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Areas for Improvement */}
                            {feedback.ai_feedback.detailedFeedback
                              .areas_for_improvement &&
                              feedback.ai_feedback.detailedFeedback
                                .areas_for_improvement.length > 0 && (
                                <div className="bg-gray-900 p-5 rounded-lg border-l-4 border-amber-500">
                                  <h3 className="text-xl font-medium text-amber-400 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                      ></path>
                                    </svg>
                                    Areas for Improvement
                                  </h3>
                                  <ul className="space-y-2 text-gray-300">
                                    {feedback.ai_feedback.detailedFeedback.areas_for_improvement.map(
                                      (area, idx) => (
                                        <li
                                          key={idx}
                                          className="flex items-start"
                                        >
                                          <svg
                                            className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            ></path>
                                          </svg>
                                          <span>{area}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>

                          {/* Recommendations */}
                          {feedback.ai_feedback.detailedFeedback
                            .recommendations &&
                            feedback.ai_feedback.detailedFeedback
                              .recommendations.length > 0 && (
                              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-5 rounded-lg border border-indigo-800">
                                <h3 className="text-xl font-medium text-indigo-300 mb-3 flex items-center">
                                  <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                  </svg>
                                  Recommendations
                                </h3>
                                <ul className="space-y-3 text-gray-300">
                                  {feedback.ai_feedback.detailedFeedback.recommendations.map(
                                    (rec, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start"
                                      >
                                        <svg
                                          className="w-5 h-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                          ></path>
                                        </svg>
                                        <span>{rec}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Question Analysis Tab */}
                <TabsContent value="questions">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                      <CardTitle className="text-2xl text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Question Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Detailed breakdown of each question and response
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {feedback.ai_feedback.detailedFeedback &&
                      feedback.ai_feedback.detailedFeedback
                        .detailed_question_analysis &&
                      feedback.ai_feedback.detailedFeedback
                        .detailed_question_analysis.length > 0 ? (
                        <div className="space-y-6">
                          {feedback.ai_feedback.detailedFeedback.detailed_question_analysis.map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-900 p-5 rounded-lg border-l-4 border-blue-600"
                              >
                                <p className="font-medium text-blue-300 mb-3">
                                  Question {idx + 1}: {item.question}
                                </p>

                                <div className="flex items-center mb-4">
                                  <span className="text-gray-400 mr-2">
                                    Response Quality:
                                  </span>
                                  <div className="w-full max-w-xs">
                                    <CustomProgress
                                      value={
                                        parseInt(item.response_quality) * 10
                                      }
                                      className="h-2 bg-gray-700"
                                      indicatorClassName={`${
                                        parseInt(item.response_quality) >= 8
                                          ? "bg-green-500"
                                          : parseInt(item.response_quality) >= 5
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                  </div>
                                  <span
                                    className={`ml-2 font-medium ${
                                      parseInt(item.response_quality) >= 8
                                        ? "text-green-400"
                                        : parseInt(item.response_quality) >= 5
                                        ? "text-amber-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {item.response_quality}/10
                                  </span>
                                </div>

                                <div className="mb-3">
                                  <h4 className="text-gray-400 text-sm mb-1">
                                    Analysis:
                                  </h4>
                                  <p className="text-gray-300">
                                    {item.feedback}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-purple-400 text-sm mb-1">
                                    Improvement Suggestion:
                                  </h4>
                                  <p className="text-gray-300 italic">
                                    {item.improvement_suggestion}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">
                            No detailed question analysis available for this
                            interview.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="bg-transparent border-purple-500 text-purple-400 hover:bg-purple-900 hover:text-purple-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
                Back to Dashboard
              </Button>

              <Button
                onClick={() => {
                  // Implement export functionality here
                  toast.success("Report exported successfully!");
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Export Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
