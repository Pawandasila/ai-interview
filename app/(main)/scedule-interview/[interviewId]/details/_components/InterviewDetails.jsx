"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const InterviewDetail = ({ interviewData }) => {
  const [activeTab, setActiveTab] = useState("jobDetails");
  const router = useRouter();

  // Early return with nicer loading state using shadcn Card
  if (!interviewData || Object.keys(interviewData).length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-500 border-t-blue-500"></div>
              <p className="text-lg font-medium">
                Loading interview details...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely destructure data with fallbacks
  const {
    id,
    created_at,
    jobPosition = "Untitled Position",
    jobDescription = "No description provided",
    jobDuration = "Not specified",
    jobType = "[]",
    QuestionList = "[]",
  } = interviewData;

  // Use bracket notation to access the property with a dash
  const interviewFeedback = interviewData["interview-feedback"] || [];

  // Parse JSON strings with error handling
  let parsedJobType = [];
  try {
    parsedJobType =
      typeof jobType === "string"
        ? JSON.parse(jobType)
        : Array.isArray(jobType)
        ? jobType
        : [];
  } catch (e) {
    console.error("Error parsing jobType:", e);
  }

  let parsedQuestionList = [];
  try {
    parsedQuestionList =
      typeof QuestionList === "string"
        ? JSON.parse(QuestionList)
        : Array.isArray(QuestionList)
        ? QuestionList
        : [];
  } catch (e) {
    console.error("Error parsing QuestionList:", e);
  }

  const formattedDate = created_at
    ? format(new Date(created_at), "MMM d, yyyy h:mm a")
    : "N/A";

  // Safely check for feedback data
  const safeInterviewFeedback = Array.isArray(interviewFeedback)
    ? interviewFeedback
    : [];
  const completedCandidates = safeInterviewFeedback.filter(
    (feedback) => feedback && feedback.ai_feedback
  ).length;
  const pendingCandidates = safeInterviewFeedback.length - completedCandidates;

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        {jobPosition} - Details
      </h1>

      <Tabs
        defaultValue="jobDetails"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 gap-3 mb-8 bg-gray-800/50 rounded-lg p-1">
          <TabsTrigger
            value="jobDetails"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600"
          >
            Job Details
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600"
          >
            Questions ({parsedQuestionList.length})
          </TabsTrigger>
          <TabsTrigger
            value="candidates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600"
          >
            Candidates ({safeInterviewFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobDetails">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-100">
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Position</p>
                        <p className="font-medium text-gray-100">
                          {jobPosition}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Description</p>
                        <p className="text-gray-200">{jobDescription}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Duration</p>
                        <p className="text-gray-200">{jobDuration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Created On</p>
                        <p className="text-gray-200">{formattedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-100">
                      Interview Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parsedJobType.length > 0 ? (
                        parsedJobType.map((type, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-blue-300"
                          >
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400">
                          No types specified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-100">
                      Candidates Status
                    </h3>
                    <div className="flex gap-4">
                      <Card className="bg-gradient-to-r from-green-900/40 to-green-800/40 border-green-600/30 w-1/2">
                        <CardContent className="pt-4">
                          <p className="text-sm text-green-300">Completed</p>
                          <p className="text-2xl font-bold text-green-200">
                            {completedCandidates}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 border-amber-600/30 w-1/2">
                        <CardContent className="pt-4">
                          <p className="text-sm text-amber-300">Pending</p>
                          <p className="text-2xl font-bold text-amber-200">
                            {pendingCandidates}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-100">
                Interview Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parsedQuestionList.length > 0 ? (
                <div className="space-y-4">
                  {parsedQuestionList.map((q, index) => (
                    <Card
                      key={index}
                      className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <span className="mr-3 text-gray-400 font-medium">
                              {index + 1}.
                            </span>
                            <p className="text-gray-200">{q.question}</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 border-none">
                            {q.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  No questions available for this interview.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-100">Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              {safeInterviewFeedback.length === 0 ? (
                <p className="text-gray-400">
                  No candidates have attempted this interview yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-800/50">
                      <TableRow className="border-gray-700 hover:bg-transparent">
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Score</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeInterviewFeedback.map((candidate, index) => {
                        const candidateDate =
                          candidate && candidate.created_at
                            ? format(
                                new Date(candidate.created_at),
                                "MMM d, yyyy"
                              )
                            : "N/A";
                        const hasCompletedFeedback = Boolean(
                          candidate && candidate.ai_feedback
                        );

                        let score = null;
                        if (
                          hasCompletedFeedback &&
                          candidate.ai_feedback &&
                          candidate.ai_feedback.feedback &&
                          candidate.ai_feedback.feedback.rating
                        ) {
                          const ratings = Object.values(
                            candidate.ai_feedback.feedback.rating
                          );
                          if (ratings.length > 0) {
                            score =
                              ratings.reduce((sum, val) => sum + val, 0) /
                              ratings.length;
                          }
                        }

                        return (
                          <TableRow
                            key={index}
                            className="border-gray-700 hover:bg-gray-800/30"
                          >
                            <TableCell className="text-gray-200">
                              {(candidate && candidate.userName) || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-200">
                              {(candidate && candidate.userEmail) || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-200">
                              {candidateDate}
                            </TableCell>
                            <TableCell>
                              {hasCompletedFeedback ? (
                                <Badge className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 border-none">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/50 text-amber-300"
                                >
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {hasCompletedFeedback && score !== null ? (
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-100 mr-3">
                                    {score.toFixed(1)}/10
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  Awaiting completion
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                                <Link href={`/interview/${interviewData.interview_id}/feedback`}>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                                
                              >
                                View Report
                              </Button>
                              </Link>

                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewDetail;
