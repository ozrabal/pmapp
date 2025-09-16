import React from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import type { LoadingSkeletonProps } from "./types";

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, className }) => {
  // Description panel skeleton
  if (type === "descriptions") {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // Assumptions panel skeleton
  if (type === "assumptions") {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="space-y-3">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-1" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-64 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-56 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Functional blocks panel skeleton
  if (type === "functionalBlocks") {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="space-y-3">
          <Skeleton className="h-6 w-64 mb-3" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 mb-3" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  // Schedule panel skeleton
  if (type === "schedule") {
    return (
      <div className={cn("space-y-6", className)}>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-8">
          <div className="relative pl-14">
            <Skeleton className="absolute left-0 h-10 w-10 rounded-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="relative pl-14">
            <Skeleton className="absolute left-0 h-10 w-10 rounded-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="relative pl-14">
            <Skeleton className="absolute left-0 h-10 w-10 rounded-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Default generic skeleton
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
};
