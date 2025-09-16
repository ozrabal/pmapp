import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export function NewPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  // Extract code/token from URL and data attributes on component mount
  useEffect(() => {
    // First, check for error parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = new URLSearchParams(window.location.hash.substring(1));

    const errorCode = urlParams.get("error_code") || urlHash.get("error_code");
    const errorDesc = urlParams.get("error_description") || urlHash.get("error_description");

    if (errorCode === "otp_expired") {
      setError(errorDesc?.replace(/\+/g, " ") || "The password reset link has expired. Please generate a new link.");
      return;
    }

    // Check for authentication code/token in DOM data attributes (set by Astro)
    const formContainer = document.getElementById("password-reset-form");
    const dataCode = formContainer?.dataset.code;
    const dataToken = formContainer?.dataset.token;

    // Check URL parameters
    const urlCode = urlParams.get("code");
    const urlToken = urlParams.get("token");

    // Check hash parameters
    const hashToken = urlHash.get("access_token");

    // Set code and token with priority
    if (dataCode || urlCode) {
      setCode(dataCode || urlCode);
    }

    if (dataToken || urlToken || hashToken) {
      setToken(dataToken || urlToken || hashToken);
    }

    // If we don't have a code or token, show error
    if (!dataCode && !urlCode && !dataToken && !urlToken && !hashToken) {
      setError("Missing required password reset token. The link may be invalid or expired.");
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    if (!code && !token) {
      setError("Missing required authorization token.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(code ? { code } : {}),
          ...(token ? { token } : {}),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "An error occurred while changing the password");
        return;
      }

      setIsSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatic redirect to login page after successful password reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        window.location.href = "/auth/login";
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (!code && !token && !isSuccess) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "The password reset link is invalid or expired."}</AlertDescription>
        </Alert>
        <Button onClick={() => (window.location.href = "/auth/reset-password")} className="w-full">
          Try again
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your password has been changed. You will be redirected to the login page shortly...
          </AlertDescription>
        </Alert>
        <Button onClick={() => (window.location.href = "/auth/login")} className="w-full">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          aria-invalid={errors.confirmPassword ? "true" : "false"}
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Set new password"
        )}
      </Button>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </form>
  );
}
