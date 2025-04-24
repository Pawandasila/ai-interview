"use client";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import FormContainer from "./_components/FormContainer";
import QuestionList from "./_components/QuestionList";
import InteviewLink from "./_components/InterviewLink";
import { supabase } from "@/services/supabaseClient"
import { useUser } from "@/app/Provider";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDescription: "",
    jobDuration: "",
    jobType: [],
  });
  
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [interviewId, setInterviewId] = useState();
  
  const { user, loading } = useUser();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };
  
  const handleSubmit = async () => {
    if (!questions || questions.length === 0) {
      toast?.error("No questions to submit. Please generate questions first.");
      return;
    }

    const interviewId = uuidv4();
    setInterviewId(interviewId)
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("interviews")
        .insert([{ 
          jobPosition: formData.jobPosition,
          jobDescription: formData.jobDescription,
          jobDuration: formData.jobDuration,
          jobType: formData.jobType,
          QuestionList: JSON.stringify(questions),
          userEmail: user?.email || null,
          interview_id: interviewId
        }])
        .select();
        
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      toast?.success("Interview created successfully!");
      setStep(step+1);

    } catch (error) {
      console.error("Error submitting interview:", error);
      toast?.error("Failed to create interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
      case 2:
      case 3:
      case 4:
        return (
          <FormContainer
            onHandleInputChange={handleInputChange}
            formData={formData}
            step={step}
            setStep={setStep}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        );
  
      case 5:
        return (
          <QuestionList
            formData={formData}
            onPrevStep={handlePrevStep}
            onSubmit={handleSubmit}
            setQuestions={setQuestions}
            questions={questions}
          />
        );
  
      case 6:
        return (
          <InteviewLink interviewId={interviewId} formData={formData}/>
        );
  
      default:
        return (
          <div className="text-white p-6">
            <p>Invalid step: {step}</p>
          </div>
        );
    }
  };
  

  return (
    <div className="mt-10 px-4 sm:px-10 md:px-24">
      <div className="flex gap-5 items-center mb-6">
        <ArrowLeft
          onClick={() => router.back()}
          className="cursor-pointer size-6 text-light-100"
        />
        <h2 className="font-bold text-xl md:text-2xl text-light-100">
          Create new Interview {step >= 1 ? `- Step ${step} of 6` : ""}
        </h2>
      </div>

      {/* <InteviewLink interviewId={interviewId} /> */}

      <Progress value={step * 20} className="my-5 h-1.5 bg-dark-200" />

      {renderStepContent()}

    </div>
  );
};

export default Page;