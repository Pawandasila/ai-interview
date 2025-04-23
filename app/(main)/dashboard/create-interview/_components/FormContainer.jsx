import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InterviewTypes } from "@/services/Contexts";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

const FormContainer = ({
  onHandleInputChange,
  formData,
  step,
  onNextStep,
  onPrevStep,
  setStep,
}) => {
  const handleTypeSelection = (title) => {
    const prevTypes = formData.jobType || [];

    if (prevTypes.includes(title)) {
      onHandleInputChange(
        "jobType",
        prevTypes.filter((t) => t !== title)
      );
    } else {
      // Add new type
      onHandleInputChange("jobType", [...prevTypes, title]);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.jobPosition && formData.jobPosition.trim() !== "";
      case 2:
        return formData.jobDescription && formData.jobDescription.trim() !== "";
      case 3:
        return formData.jobDuration && formData.jobDuration.trim() !== "";
      case 4:
        return formData.jobType && formData.jobType.length> 0 ;
      default:
        return false;
    }
  };

  return (
    <div className="dark-gradient rounded-2xl p-6 shadow-lg w-full max-w-4xl mx-auto mb-12">
      <form className="form space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Step 1: Job Position */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-light-100">
              Job Details
            </h3>
            <div className="space-y-2">
              <Label
                htmlFor="jobPosition"
                className="text-sm font-medium label"
              >
                Job Position
              </Label>
              <Input
                id="jobPosition"
                value={formData.jobPosition || ""}
                onChange={(e) =>
                  onHandleInputChange("jobPosition", e.target.value)
                }
                placeholder="e.g Full stack developer"
                className="input"
              />
            </div>
          </div>
        )}

        {/* Step 2: Job Description */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-light-100">
              Job Description
            </h3>
            <div className="space-y-2">
              <Label
                htmlFor="jobDescription"
                className="text-sm font-medium label"
              >
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription || ""}
                onChange={(e) =>
                  onHandleInputChange("jobDescription", e.target.value)
                }
                placeholder="Enter job description here..."
                className="textarea min-h-32 md:min-h-40"
              />
            </div>
          </div>
        )}

        {/* Step 3: Interview Settings - Changed to Job Duration */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-light-100">
              Job Duration
            </h3>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium label">
                Contract Duration
              </Label>
              <Select
                value={formData.jobDuration || ""}
                onValueChange={(value) =>
                  onHandleInputChange("jobDuration", value)
                }
              >
                <SelectTrigger
                  id="duration"
                  className="!bg-dark-200 !rounded-full !min-h-12 !px-5"
                >
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent className="!bg-dark-300 !text-light-100 !border-light-600">
                  <SelectItem value="5 min">5 min</SelectItem>
                  <SelectItem value="15 min">15 min</SelectItem>
                  <SelectItem value="20 min">20 min</SelectItem>
                  <SelectItem value="30 min">30 min</SelectItem>
                  <SelectItem value="45 min">45 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 4: Job Type (replacing Interview Type) */}
        {step === 4 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium label">Job Type</Label>
            <div className="flex flex-wrap gap-3">
              {InterviewTypes.map((type, index) => (
                <div
                  key={index}
                  onClick={() => handleTypeSelection(type.title)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all duration-200 ${
                    formData.jobType?.includes(type.title)
                      ? "bg-primary-200 text-dark-100 border-primary-200"
                      : "border-light-600 text-light-100 hover:bg-dark-200"
                  }`}
                >
                  {type.icon && <type.icon className="size-4" />}
                  <span className="text-sm font-medium whitespace-nowrap">
                    {type.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 animate-fadeIn">
          {step > 1 ? (
            <Button
              type="button"
              onClick={onPrevStep}
              className="w-full sm:w-auto btn-secondary flex items-center gap-2 px-6 py-2.5"
            >
              <ArrowLeft className="size-4" />
              Previous
            </Button>
          ) : (
            <div className="w-full sm:w-auto"></div>
          )}

          <Button
            type="button"
            onClick={() => (step === 4 ? onNextStep() : setStep(step + 1))}
            disabled={!isStepValid()}
            className={`w-full sm:w-auto btn-primary flex items-center gap-2 px-6 py-2.5 ${
              !isStepValid() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {step === 4 ? "Generate Questions" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormContainer;
