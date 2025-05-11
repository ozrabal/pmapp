import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema for login form validation
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirect?: string;
}

export function LoginForm({ redirect = "/dashboard" }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loginSuccess, setLoginSuccess] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "An error occurred during login");
        setIsLoading(false);
        return;
      }

      // Mark login as successful to trigger redirect in useEffect
      setLoginSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  // Handle navigation as a side effect
  React.useEffect(() => {
    if (loginSuccess) {
      // After successful login, redirect
      window.location.href = redirect;
    }
  }, [loginSuccess, redirect]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="login-form">
      {error && (
        <Alert variant="destructive" data-testid="login-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
          data-testid="email-input"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/auth/reset-password" className="text-xs text-muted-foreground hover:text-primary">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          autoComplete="current-password"
          aria-invalid={errors.password ? "true" : "false"}
          data-testid="password-input"
        />
        {errors.password && (
          <p className="text-sm text-red-500" data-testid="password-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-submit">
        {isLoading ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
