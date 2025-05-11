import React from "react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 mb-4 relative">
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-neutral-200"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-neutral-600 font-medium">{message}</p>
    </div>
  );
}
