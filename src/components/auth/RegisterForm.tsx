import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Wprowadź poprawny adres email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Imię jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "Wystąpił błąd podczas rejestracji");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Konto zostało utworzone. Sprawdź swoją skrzynkę email, aby aktywować konto.
          </AlertDescription>
        </Alert>
        <Button onClick={() => (window.location.href = "/auth/login")} className="w-full">
          Przejdź do logowania
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
        <Label htmlFor="firstName">Imię</Label>
        <Input
          id="firstName"
          type="text"
          {...register("firstName")}
          aria-invalid={errors.firstName ? "true" : "false"}
        />
        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
      </div>

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
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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
            Rejestracja...
          </>
        ) : (
          "Zarejestruj się"
        )}
      </Button>

      <p className="text-center text-sm">
        Masz już konto?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Zaloguj się
        </a>
      </p>
    </form>
  );
}
