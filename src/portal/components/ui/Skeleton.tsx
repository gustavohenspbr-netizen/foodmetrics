import React from "react";
import { cn } from "../../lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle";
}

export function Skeleton({ variant = "rect", className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-slate-200/60 dark:bg-slate-800/60 animate-pulse",
        variant === "text" && "h-4 rounded-md",
        variant === "rect" && "rounded-xl",
        variant === "circle" && "rounded-full",
        className
      )}
      {...rest}
    />
  );
}
