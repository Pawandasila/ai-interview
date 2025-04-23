"use client";

import React, { useState, useEffect } from "react";
import InterviewHeader from "./_components/Header";
import { InterviewDataContext } from "@/context/InterviewDataContext";

const InterviewLayout = ({ children }) => {
  const [interviewInfo, setInterviewInfoState] = useState();

  useEffect(() => {
    const storedInfo = localStorage.getItem("interviewInfo");
    if (storedInfo) {
      setInterviewInfoState(JSON.parse(storedInfo));
    }
  }, []);

  const setInterviewInfo = (info) => {
    setInterviewInfoState(info);
    localStorage.setItem("interviewInfo", JSON.stringify(info));
  };

  return (
    <InterviewDataContext.Provider value={{ interviewInfo, setInterviewInfo }}>
      <div className="h-full">
        <InterviewHeader />
        {children}
      </div>
    </InterviewDataContext.Provider>
  );
};

export default InterviewLayout;
