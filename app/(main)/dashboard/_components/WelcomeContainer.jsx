"use client";
import { useUser } from "@/app/Provider";
import Image from "next/image";
import React from "react";

const WelcomeContainer = () => {
  const { user, loading } = useUser();

  if (loading) return (
    <div className="w-full mx-auto card rounded-xl">
      <div className="flex-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-200"></div>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="w-full max-w-4xl mx-auto card rounded-xl p-6">
      <div className="text-center">
        <p className="text-light-100">No user found</p>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto card rounded-xl p-6 sm:p-8">
      {/* User welcome section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inline-flex w-full h-full animate-ping rounded-full bg-primary-200 opacity-20"></div>
          <Image 
            src={user?.picture}
            alt="User avatar"
            height={80}
            width={80}
            className="rounded-full border-2 border-primary-200 relative z-10"
          />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            Welcome, {user?.name.charAt(0).toUpperCase() + user?.name.slice(1).toLowerCase()}
          </h2>
          <p className="text-light-100 text-lg">Let's make hiring smarter today</p>
        </div>
      </div>


      {/* System status indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-gradient-to-r from-dark-300/80 to-dark-200/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <div className="h-3 w-3 rounded-full bg-success-100 pulse-animation"></div>
          <p className="text-white">System is ready for your interviews</p>
        </div>
        <p className="text-primary-200 italic">Start creating an interview to explore our AI-powered platform</p>
      </div>
    </div>
  );
};

export default WelcomeContainer;