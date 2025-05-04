import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
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
      rememberMe: false,
    },
  });

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
        setError(result.error?.message || "Wystąpił błąd podczas logowania");
        return;
      }

      // Przekierowanie po udanym logowaniu
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/dashboard";
      window.location.href = redirectTo;
    } catch (err) {
      setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Adres e-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="adres@email.com"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Hasło</Label>
          <a href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
            Nie pamiętam hasła
          </a>
        </div>
        <Input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="rememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          {...register("rememberMe")}
        />
        <Label htmlFor="rememberMe" className="text-sm">
          Zapamiętaj mnie
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logowanie...
          </>
        ) : (
          "Zaloguj się"
        )}
      </Button>

      <p className="text-center text-sm">
        Nie masz jeszcze konta?{" "}
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Zarejestruj się
        </a>
      </p>
    </form>
  );
}
