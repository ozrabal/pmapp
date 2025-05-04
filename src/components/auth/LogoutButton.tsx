import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

export function LogoutButton({ className = "", variant = "ghost", size = "sm" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Logout failed");
        return;
      }

      // Redirect to login page after logout
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      aria-label="Wyloguj się"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span>Wyloguj</span>
    </Button>
  );
}
