import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./_component/AppSidebar";
import WelcomeContainer from "./dashboard/_components/WelcomeContainer";

const DashboardProvider = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <div className="md:w-[83vw] w-[100vw] overflow-auto">
          <SidebarTrigger className="md:hidden p-2 m-2" />

          <main className="p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardProvider;
