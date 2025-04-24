"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarOptions } from "@/services/Contexts"
import { PlusIcon, MenuIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function AppSidebar() {
  const path = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        isMobileOpen &&
        !event.target.closest(".sidebar-container")
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileOpen]);

  return (
    <>

      {/* Sidebar */}
      <div
        className={`sidebar-container ${
          isMobile
            ? "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out"
            : "relative"
        } ${isMobile && !isMobileOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        <Sidebar className="bg-black text-gray-100 h-screen border-r border-gray-800">
          <SidebarHeader className="flex flex-col items-center justify-center mt-5 p-4">
            <div className="flex items-center justify-center w-full mb-4">
              <Image
                src="/logo.jpg"
                width={100}
                height={50}
                alt="Logo"
                className="w-[50px] rounded-md"
              />
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
              <PlusIcon className="mr-2" size={16} />
              <span>Create Interview</span>
            </Button>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarMenu className="list-none p-0">
                {SidebarOptions.map((option, index) => {
                  const isActive = path === option.path;
                  return (
                    <SidebarMenuItem key={index} className="my-1 list-none">
                      <SidebarMenuButton asChild className={`${isActive ? 'bg-indigo-500' : 'bg-indigo-600'}}`}>
                        <Link
                          href={option.path}
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            isActive
                              ? "bg-indigo-400/60 hover:bg-indigo-600 text-blue1700"
                              : "text-gray-300 hover:bg-indigo-800 hover:text-white"
                          }`}
                          onClick={() => isMobile && setIsMobileOpen(false)}
                        >
                          <option.icon
                            className={`mr-3 ${
                              isActive ? "text-whiblue-700te" : "text-gray-400"
                            }`}
                            size={18}
                          />
                          <span className="text-sm font-medium">
                            {option.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 mt-auto">
            {/* Footer content if needed */}
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
}
