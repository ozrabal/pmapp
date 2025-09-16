import React from "react";
import { Button } from "@/components/ui/button";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationButtonProps {
  message?: string;
  type?: NotificationType;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function NotificationButton({
  message = "To jest przykładowe powiadomienie",
  type = "success",
  children = "Pokaż powiadomienie",
  variant = "default",
  size = "default",
  className,
}: NotificationButtonProps) {
  const handleClick = () => {
    // Use custom event to communicate with the NotificationProvider
    document.dispatchEvent(
      new CustomEvent("toast", {
        detail: {
          message,
          type,
        },
      })
    );
  };

  return (
    <Button onClick={handleClick} variant={variant} size={size} className={className}>
      {children}
    </Button>
  );
}
