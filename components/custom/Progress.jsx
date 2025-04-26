// components/custom/CustomProgress.jsx
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // Assumes you're using the shadcn/ui utility

const CustomProgress = ({ value, className, indicatorClassName, ...props }) => {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full bg-gray-700", className)}>
      <div 
        className={cn("h-full transition-all", indicatorClassName)} 
        style={{ width: `${value}%` }}
        {...props}
      />
    </div>
  );
};

export {CustomProgress} ;