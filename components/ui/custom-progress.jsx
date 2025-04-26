"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CustomProgress component - A customizable progress bar with animation
 * 
 * @param {Object} props
 * @param {number} props.value - The current value of the progress (0-100)
 * @param {string} props.className - Additional classes for the container
 * @param {string} props.indicatorClassName - Additional classes for the indicator
 * @param {string} props.max - The maximum value (default: 100)
 * @param {boolean} props.showValue - Whether to show the value as text
 * @param {string} props.valuePrefix - Prefix for the displayed value
 * @param {string} props.valueSuffix - Suffix for the displayed value
 */
const CustomProgress = ({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  showValue = false,
  valuePrefix = "",
  valueSuffix = "",
  ...props
}) => {
  // Calculate the percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Determine color based on percentage
  const getDefaultColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-gray-700",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "h-full transition-all",
            getDefaultColor(),
            indicatorClassName
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      {showValue && (
        <div className="absolute right-0 top-0 -mt-6 text-sm font-medium text-gray-300">
          {valuePrefix}{value}{valueSuffix}
        </div>
      )}
    </div>
  );
};

export { CustomProgress };