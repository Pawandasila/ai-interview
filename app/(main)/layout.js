import React from "react";
import DashboardProvider from "./Provider";

const DashboardLayouts = ({ children }) => {
  return (
    <div className=" flex flex-col h-screen w-full ">
      <DashboardProvider>

        <div className=" w-full">{children}</div>
      </DashboardProvider>
    </div>
  );
};

export default DashboardLayouts;
