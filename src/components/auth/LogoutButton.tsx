import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  redirectTo?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  redirectTo = "/auth/login",
  variant = "ghost",
  size = "default",
  className = "",
  children = "Wyloguj się",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Server-side redirect after successful logout
        window.location.href = redirectTo;
      } else {
        console.error("Logout failed:", await response.json());
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Wylogowywanie..." : children}
    </Button>
  );
}
