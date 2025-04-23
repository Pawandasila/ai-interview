"use client"

import { PhoneCall, VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CreateOptions = () => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mx-auto ">
      <div className="border border-gray-700 rounded-lg p-6 card-cta transition-colors duration-200 cursor-pointer shadow-md" onClick={()=> router.push('/dashboard/create-interview')}>
        <div className="flex flex-col items-start">
          <div className="bg-blue-900/40 rounded-lg p-2 mb-4">
            <VideoIcon className="text-blue-400 h-6 w-6" />
          </div>
          <h2 className="font-bold text-lg text-white mb-2">
            Create a new Interview
          </h2>
          <p className="text-gray-300 text-sm">
            Create AI Interview and schedule its candidates
          </p>
        </div>
      </div>

      <div className="border border-gray-700 rounded-lg p-6 card-cta transition-colors duration-200 cursor-pointer shadow-md">
        <div className="flex flex-col items-start">
          <div className="bg-green-900/40 rounded-lg p-2 mb-4">
            <PhoneCall className="text-green-400 h-6 w-6" />
          </div>
          <h2 className="font-bold text-lg text-white mb-2">
            Create Phone Call Screening
          </h2>
          <p className="text-gray-300 text-sm">
            Schedule phone call screening with candidates
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateOptions;
