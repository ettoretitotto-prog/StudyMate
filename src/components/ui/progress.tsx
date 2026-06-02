import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value, ...props }, ref) => {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      ref={ref}
      className={cn("h-3 w-full overflow-hidden rounded-md bg-muted", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      {...props}
    >
      <div
        className="h-full rounded-md bg-gradient-to-r from-secondary via-primary to-accent transition-all duration-500 ease-out animate-pulseBar"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
