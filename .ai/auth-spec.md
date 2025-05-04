# Specyfikacja systemu autentykacji dla Plan My App

## 1. Architektura interfejsu użytkownika

### 1.1 Struktura stron i komponentów

#### Nowe strony Astro
1. **Strona logowania** (`src/pages/auth/login.astro`)
   - Statyczna strona z formularzem logowania
   - Obsługa przekierowania po udanym logowaniu
   - Obsługa błędów logowania

2. **Strona rejestracji** (`src/pages/auth/register.astro`)
   - Statyczna strona z formularzem rejestracji
   - Obsługa walidacji danych wejściowych
   - Obsługa przekierowania po udanej rejestracji
   - Wyświetlanie informacji o konieczności aktywacji konta przez email

3. **Strona resetowania hasła** (`src/pages/auth/reset-password.astro`)
   - Formularz do wprowadzenia adresu email
   - Potwierdzenie wysłania linku resetowania hasła

4. **Strona ustawienia nowego hasła** (`src/pages/auth/new-password.astro`)
   - Formularz do ustawienia nowego hasła
   - Walidacja siły hasła
   - Obsługa błędów resetowania

5. **Strona aktywacji konta** (`src/pages/auth/activate.astro`)
   - Obsługa tokenu aktywacyjnego z URL
   - Potwierdzenie aktywacji konta
   - Przekierowanie do strony logowania

#### Nowe komponenty React
1. **Formularz logowania** (`src/components/auth/LoginForm.tsx`)
   - Pola formularza: email, hasło
   - Walidacja danych wejściowych
   - Obsługa błędów
   - Przycisk "Zapamiętaj mnie"
   - Link do resetowania hasła
   - Wykorzystanie react-hook-form i zod do walidacji

2. **Formularz rejestracji** (`src/components/auth/RegisterForm.tsx`)
   - Pola formularza: email, hasło, powtórz hasło, imię
   - Walidacja siły hasła
   - Walidacja powtórzonego hasła
   - Walidacja poprawności adresu email
   - Obsługa błędów
   - Wykorzystanie react-hook-form i zod do walidacji

3. **Formularz resetowania hasła** (`src/components/auth/ResetPasswordForm.tsx`)
   - Pole formularza: email
   - Walidacja adresu email
   - Obsługa stanu wysłanego maila

4. **Formularz ustawienia nowego hasła** (`src/components/auth/NewPasswordForm.tsx`)
   - Pola formularza: nowe hasło, powtórz hasło
   - Walidacja siły nowego hasła
   - Walidacja zgodności haseł
   - Obsługa błędów

5. **Przycisk wylogowania** (`src/components/auth/LogoutButton.tsx`)
   - Obsługa wylogowania użytkownika
   - Przekierowanie po wylogowaniu

#### Modyfikacja istniejących komponentów

1. **Layout** (`src/layouts/Layout.astro`)
   - Dodanie sprawdzania stanu sesji
   - Wyświetlanie odpowiedniego nagłówka dla zalogowanego/niezalogowanego użytkownika

2. **AppHeader** (`src/components/dashboard/AppHeader.astro`)
   - Dodanie przycisku wylogowania dla zalogowanego użytkownika
   - Kondycyjne wyświetlanie elementów w zależności od stanu logowania

### 1.2 Przepływ użytkownika

#### Rejestracja
1. Użytkownik wchodzi na stronę rejestracji
2. Wypełnia formularz danymi (email, hasło, imię)
3. System waliduje dane w czasie rzeczywistym:
   - Unikalność adresu email
   - Siłę hasła (min. 8 znaków, zawierające cyfry i litery)
4. Po poprawnej walidacji, użytkownik wysyła formularz
5. System tworzy konto w Supabase Auth
6. System tworzy profil w tabeli `profiles`
7. System wysyła email z linkiem aktywacyjnym
8. Użytkownik zostaje przekierowany na stronę z informacją o konieczności aktywacji konta

#### Logowanie
1. Użytkownik wchodzi na stronę logowania
2. Wprowadza dane logowania (email, hasło)
3. System waliduje dane i próbuje zalogować użytkownika
4. W przypadku powodzenia, użytkownik zostaje przekierowany na stronę główną dashboardu
5. W przypadku niepowodzenia, wyświetlany jest odpowiedni komunikat błędu
6. System zapisuje informację o logowaniu w tabeli `user_sessions`

#### Odzyskiwanie hasła
1. Użytkownik wchodzi na stronę resetowania hasła
2. Wprowadza adres email powiązany z kontem
3. System wysyła email z linkiem do resetowania hasła
4. Użytkownik klika w link w emailu
5. System przekierowuje do strony ustawienia nowego hasła
6. Użytkownik wprowadza nowe hasło i je potwierdza
7. System waliduje siłę hasła
8. Po zatwierdzeniu, hasło jest aktualizowane w Supabase Auth
9. Użytkownik jest przekierowywany do strony logowania

#### Ochrona stron
1. Każda strona wymagająca autoryzacji sprawdza stan sesji
2. Jeśli użytkownik nie jest zalogowany, zostaje przekierowany na stronę logowania
3. Po zalogowaniu, użytkownik jest przekierowywany z powrotem na żądaną stronę

#### Wylogowanie
1. Użytkownik klika przycisk wylogowania
2. System kończy sesję w Supabase Auth
3. System aktualizuje rekord w tabeli `user_sessions`
4. Użytkownik zostaje przekierowany na stronę logowania

### 1.3 Walidacja i komunikaty błędów

#### Schemat walidacji dla rejestracji
```typescript
const registerSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "Imię jest wymagane"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});
```

#### Schemat walidacji dla logowania
```typescript
const loginSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
  rememberMe: z.boolean().optional(),
});
```

#### Schemat walidacji dla resetowania hasła
```typescript
const resetPasswordSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
});
```

#### Schemat walidacji dla ustawienia nowego hasła
```typescript
const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});
```

#### Komunikaty błędów
- Błędy walidacji formularzy (wyświetlane pod odpowiednimi polami)
- Błędy autoryzacji (niepoprawne dane logowania, konto nie istnieje, itp.)
- Błędy serwera (problemy z połączeniem, błędy API)
- Informacje o wymaganiach dotyczących hasła
- Komunikaty potwierdzające (wysłanie emaila aktywacyjnego, resetowanie hasła)

## 2. Logika backendowa

### 2.1 Struktura endpointów API

#### Endpoint rejestracji
- **Ścieżka**: `/api/auth/register`
- **Metoda**: POST
- **Payload**: 
```typescript
{
  email: string;
  password: string;
  firstName: string;
}
```
- **Odpowiedź pomyślna**: 201 Created
- **Odpowiedź błędu**: 400 Bad Request, 409 Conflict (email już istnieje), 500 Internal Server Error

#### Endpoint logowania
- **Ścieżka**: `/api/auth/login`
- **Metoda**: POST
- **Payload**: 
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean;
}
```
- **Odpowiedź pomyślna**: 200 OK z JWT
- **Odpowiedź błędu**: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### Endpoint wylogowania
- **Ścieżka**: `/api/auth/logout`
- **Metoda**: POST
- **Odpowiedź pomyślna**: 200 OK
- **Odpowiedź błędu**: 500 Internal Server Error

#### Endpoint resetowania hasła
- **Ścieżka**: `/api/auth/reset-password`
- **Metoda**: POST
- **Payload**: 
```typescript
{
  email: string;
}
```
- **Odpowiedź pomyślna**: 200 OK
- **Odpowiedź błędu**: 400 Bad Request, 404 Not Found, 500 Internal Server Error

#### Endpoint ustawienia nowego hasła
- **Ścieżka**: `/api/auth/new-password`
- **Metoda**: POST
- **Payload**: 
```typescript
{
  token: string;
  password: string;
}
```
- **Odpowiedź pomyślna**: 200 OK
- **Odpowiedź błędu**: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### Endpoint weryfikacji sesji
- **Ścieżka**: `/api/auth/session`
- **Metoda**: GET
- **Odpowiedź pomyślna**: 200 OK z danymi użytkownika
- **Odpowiedź błędu**: 401 Unauthorized

### 2.2 Schematy walidacji danych

#### Schemat rejestracji
```typescript
// src/lib/schemas/auth.schema.ts
export const registerUserSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
  firstName: z.string().min(1, "Imię jest wymagane"),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
```

#### Schemat logowania
```typescript
// src/lib/schemas/auth.schema.ts
export const loginUserSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
  rememberMe: z.boolean().optional(),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
```

#### Schemat resetowania hasła
```typescript
// src/lib/schemas/auth.schema.ts
export const resetPasswordSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
```

#### Schemat ustawienia nowego hasła
```typescript
// src/lib/schemas/auth.schema.ts
export const newPasswordSchema = z.object({
  token: z.string().min(1, "Token jest wymagany"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
});

export type NewPasswordDto = z.infer<typeof newPasswordSchema>;
```

### 2.3 Obsługa wyjątków

#### Klasy błędów
```typescript
// src/lib/services/errors/auth.errors.ts
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor() {
    super("Ten adres email jest już używany", "email_exists");
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Nieprawidłowy email lub hasło", "invalid_credentials");
    this.name = "InvalidCredentialsError";
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super("Użytkownik nie został znaleziony", "user_not_found");
    this.name = "UserNotFoundError";
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super("Token wygasł", "token_expired");
    this.name = "TokenExpiredError";
  }
}
```

#### Centralna obsługa błędów
```typescript
// src/lib/services/error.service.ts
import { AuthError } from "./errors/auth.errors";

export function handleApiError(error: unknown): Response {
  if (error instanceof AuthError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
        },
      }),
      {
        status: getStatusCodeForAuthError(error),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Obsługa innych typów błędów...
  console.error("Unexpected error:", error);
  
  return new Response(
    JSON.stringify({
      error: {
        code: "internal_server_error",
        message: "Wystąpił nieoczekiwany błąd",
      },
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

function getStatusCodeForAuthError(error: AuthError): number {
  switch (error.name) {
    case "EmailAlreadyExistsError":
      return 409; // Conflict
    case "InvalidCredentialsError":
      return 401; // Unauthorized
    case "UserNotFoundError":
      return 404; // Not Found
    case "TokenExpiredError":
      return 401; // Unauthorized
    default:
      return 400; // Bad Request
  }
}
```

### 2.4 Aktualizacja renderowania stron server-side

#### Middleware do ochrony stron
```typescript
// src/middleware/auth.middleware.ts
import { defineMiddleware } from "astro:middleware";

// Lista ścieżek wymagających autoryzacji
const protectedPaths = [
  "/dashboard",
  "/projects",
];

// Lista ścieżek dostępnych tylko dla niezalogowanych użytkowników
const publicOnlyPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/new-password",
];

export const onRequest = defineMiddleware(async ({ locals, url, cookies, redirect }, next) => {
  // Sprawdzanie sesji
  const { data: { session } } = await locals.supabase.auth.getSession();
  
  const isAuthenticated = !!session;
  const path = url.pathname;
  
  // Przekierowanie niezalogowanych użytkowników z chronionych stron
  if (!isAuthenticated && protectedPaths.some(p => path.startsWith(p))) {
    return redirect("/auth/login?redirect=" + encodeURIComponent(url.pathname));
  }
  
  // Przekierowanie zalogowanych użytkowników ze stron tylko dla niezalogowanych
  if (isAuthenticated && publicOnlyPaths.some(p => path.startsWith(p))) {
    return redirect("/dashboard");
  }
  
  // Dodanie informacji o użytkowniku do kontekstu
  locals.user = session?.user || null;
  
  return next();
});
```

## 3. System autentykacji

### 3.1 Integracja z Supabase Auth

#### Serwis autentykacji
```typescript
// src/lib/services/auth.service.ts
import type { SupabaseClient } from "@/db/supabase.client";
import type { LoginUserDto, RegisterUserDto, ResetPasswordDto, NewPasswordDto } from "../schemas/auth.schema";
import { EmailAlreadyExistsError, InvalidCredentialsError, UserNotFoundError, TokenExpiredError } from "./errors/auth.errors";

export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}
  
  /**
   * Rejestracja nowego użytkownika
   */
  async register(data: RegisterUserDto): Promise<void> {
    // 1. Rejestracja użytkownika w Supabase Auth
    const { error: signUpError, data: signUpData } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${new URL(import.meta.env.SITE_URL || "http://localhost:3000").origin}/auth/callback`,
      },
    });
    
    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        throw new EmailAlreadyExistsError();
      }
      throw signUpError;
    }
    
    // 2. Utworzenie profilu użytkownika
    const { error: profileError } = await this.supabase.from("profiles").insert({
      id: signUpData.user!.id,
      first_name: data.firstName,
      timezone: "UTC",
    });
    
    if (profileError) {
      // Rollback - usunięcie użytkownika auth, jeśli nie udało się utworzyć profilu
      await this.supabase.auth.admin.deleteUser(signUpData.user!.id);
      throw profileError;
    }
  }
  
  /**
   * Logowanie użytkownika
   */
  async login(data: LoginUserDto): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) {
      throw new InvalidCredentialsError();
    }
    
    // Zapisanie sesji użytkownika
    const { data: sessionData } = await this.supabase.auth.getSession();
    if (sessionData?.session) {
      await this.supabase.from("user_sessions").insert({
        user_id: sessionData.session.user.id,
        is_active: true,
      });
    }
  }
  
  /**
   * Wylogowanie użytkownika
   */
  async logout(userId: string): Promise<void> {
    // Zakończenie aktywnych sesji użytkownika
    await this.supabase.from("user_sessions").update({
      is_active: false,
      end_time: new Date().toISOString(),
    }).eq("user_id", userId).eq("is_active", true);
    
    // Wylogowanie z Supabase Auth
    await this.supabase.auth.signOut();
  }
  
  /**
   * Wysyłanie linku resetowania hasła
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    // Sprawdzenie czy użytkownik istnieje
    const { data: user } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .single();
    
    if (!user) {
      throw new UserNotFoundError();
    }
    
    // Wysłanie emaila resetującego hasło
    const { error } = await this.supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${new URL(import.meta.env.SITE_URL || "http://localhost:3000").origin}/auth/new-password`,
    });
    
    if (error) {
      throw error;
    }
  }
  
  /**
   * Ustawienie nowego hasła
   */
  async setNewPassword(data: NewPasswordDto): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: data.password,
    });
    
    if (error) {
      if (error.message.includes("expired")) {
        throw new TokenExpiredError();
      }
      throw error;
    }
  }
  
  /**
   * Potwierdzenie adresu email
   */
  async confirmEmail(token: string): Promise<void> {
    const { error } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });
    
    if (error) {
      if (error.message.includes("expired")) {
        throw new TokenExpiredError();
      }
      throw error;
    }
  }
  
  /**
   * Pobranie danych zalogowanego użytkownika
   */
  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }
    
    return data.user;
  }
}
```

### 3.2 Implementacja endpointów API

#### Endpoint rejestracji
```typescript
// src/pages/api/auth/register.ts
import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/services/auth.service";
import { registerUserSchema } from "../../../lib/schemas/auth.schema";
import { handleApiError } from "../../../lib/services/error.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Walidacja danych wejściowych
    const body = await request.json();
    const result = registerUserSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: "Nieprawidłowe dane wejściowe",
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Rejestracja użytkownika
    const authService = new AuthService(locals.supabase);
    await authService.register(result.data);
    
    return new Response(
      JSON.stringify({
        message: "Konto zostało utworzone. Sprawdź swoją skrzynkę email, aby aktywować konto.",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### Endpoint logowania
```typescript
// src/pages/api/auth/login.ts
import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/services/auth.service";
import { loginUserSchema } from "../../../lib/schemas/auth.schema";
import { handleApiError } from "../../../lib/services/error.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Walidacja danych wejściowych
    const body = await request.json();
    const result = loginUserSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: "Nieprawidłowe dane logowania",
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Logowanie użytkownika
    const authService = new AuthService(locals.supabase);
    await authService.login(result.data);
    
    // Pobieranie danych zalogowanego użytkownika
    const { data: { session } } = await locals.supabase.auth.getSession();
    
    return new Response(
      JSON.stringify({
        message: "Zalogowano pomyślnie",
        user: session?.user || null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### Endpoint wylogowania
```typescript
// src/pages/api/auth/logout.ts
import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/services/auth.service";
import { handleApiError } from "../../../lib/services/error.service";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    const { data: { session } } = await locals.supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({
          message: "Użytkownik nie jest zalogowany",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    const authService = new AuthService(locals.supabase);
    await authService.logout(session.user.id);
    
    return new Response(
      JSON.stringify({
        message: "Wylogowano pomyślnie",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### Endpoint resetowania hasła
```typescript
// src/pages/api/auth/reset-password.ts
import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/services/auth.service";
import { resetPasswordSchema } from "../../../lib/schemas/auth.schema";
import { handleApiError } from "../../../lib/services/error.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Walidacja danych wejściowych
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: "Nieprawidłowe dane wejściowe",
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Resetowanie hasła
    const authService = new AuthService(locals.supabase);
    await authService.resetPassword(result.data);
    
    return new Response(
      JSON.stringify({
        message: "Link do resetowania hasła został wysłany na podany adres email",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### Endpoint ustawienia nowego hasła
```typescript
// src/pages/api/auth/new-password.ts
import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/services/auth.service";
import { newPasswordSchema } from "../../../lib/schemas/auth.schema";
import { handleApiError } from "../../../lib/services/error.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Walidacja danych wejściowych
    const body = await request.json();
    const result = newPasswordSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: "Nieprawidłowe dane wejściowe",
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Ustawienie nowego hasła
    const authService = new AuthService(locals.supabase);
    await authService.setNewPassword(result.data);
    
    return new Response(
      JSON.stringify({
        message: "Hasło zostało zmienione pomyślnie",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### Endpoint weryfikacji sesji
```typescript
// src/pages/api/auth/session.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { data: { session } } = await locals.supabase.auth.getSession();
  
  if (!session) {
    return new Response(
      JSON.stringify({
        user: null,
        authenticated: false,
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  
  return new Response(
    JSON.stringify({
      user: session.user,
      authenticated: true,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
```

### 3.3 Implementacja formularzy React

#### Komponent formularza logowania
```tsx
// src/components/auth/LoginForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
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
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Hasło</Label>
          <a
            href="/auth/reset-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Nie pamiętam hasła
          </a>
        </div>
        <Input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
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
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </Button>
      
      <p className="text-center text-sm">
        Nie masz jeszcze konta?{" "}
        <a
          href="/auth/register"
          className="text-blue-600 hover:underline"
        >
          Zarejestruj się
        </a>
      </p>
    </form>
  );
}
```

#### Komponent formularza rejestracji
```tsx
// src/components/auth/RegisterForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const registerSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "Imię jest wymagane"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
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
          <AlertDescription>
            Konto zostało utworzone. Sprawdź swoją skrzynkę email, aby aktywować konto.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => window.location.href = "/auth/login"}
          className="w-full"
        >
          Przejdź do logowania
        </Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
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
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message}</p>
        )}
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
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          aria-invalid={errors.confirmPassword ? "true" : "false"}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Rejestracja..." : "Zarejestruj się"}
      </Button>
      
      <p className="text-center text-sm">
        Masz już konto?{" "}
        <a
          href="/auth/login"
          className="text-blue-600 hover:underline"
        >
          Zaloguj się
        </a>
      </p>
    </form>
  );
}
```

### 3.4 Implementacja stron Astro

#### Strona logowania
```astro
<!-- src/pages/auth/login.astro -->
---
import Layout from "../../layouts/Layout.astro";
import { LoginForm } from "../../components/auth/LoginForm";

// Sprawdzenie sesji, redirect jeśli użytkownik jest już zalogowany
const { data: { session } } = await Astro.locals.supabase.auth.getSession();

if (session) {
  return Astro.redirect("/dashboard");
}
---

<Layout title="Logowanie">
  <div class="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold">Logowanie</h1>
        <p class="mt-2 text-sm text-gray-600">
          Zaloguj się do swojego konta, aby kontynuować
        </p>
      </div>

      <div class="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <LoginForm client:load />
      </div>
    </div>
  </div>
</Layout>
```

#### Strona rejestracji
```astro
<!-- src/pages/auth/register.astro -->
---
import Layout from "../../layouts/Layout.astro";
import { RegisterForm } from "../../components/auth/RegisterForm";

// Sprawdzenie sesji, redirect jeśli użytkownik jest już zalogowany
const { data: { session } } = await Astro.locals.supabase.auth.getSession();

if (session) {
  return Astro.redirect("/dashboard");
}
---

<Layout title="Rejestracja">
  <div class="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold">Utwórz konto</h1>
        <p class="mt-2 text-sm text-gray-600">
          Zarejestruj się, aby rozpocząć korzystanie z aplikacji
        </p>
      </div>

      <div class="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <RegisterForm client:load />
      </div>
    </div>
  </div>
</Layout>
```

## 4. Integracja i funkcjonowanie całości

### 4.1 Integracja z istniejącym kodem

Istniejące strony i komponenty wymagające autoryzacji zostaną zaktualizowane w celu sprawdzania stanu sesji i kierowania użytkowników do odpowiednich widoków. Dzięki middleware, niezalogowani użytkownicy będą przekierowywani do strony logowania.

#### Modyfikacja AppHeader.astro
- Dodanie przycisku wylogowania
- Dodanie wyświetlania imienia zalogowanego użytkownika
- Kondycyjne wyświetlanie elementów menu

#### Modyfikacja stron dashboard
- Dodanie sprawdzania sesji
- Przekierowanie na stronę logowania w przypadku braku sesji

### 4.2 Przepływ danych

1. **Rejestracja**:
   - Frontend: Formularz rejestracyjny -> Walidacja -> API request
   - Backend: Walidacja -> Supabase Auth signUp -> utworzenie profilu -> odpowiedź
   - Frontend: Wyświetlenie potwierdzenia lub błędu

2. **Aktywacja konta**:
   - Email z linkiem -> kliknięcie przez użytkownika
   - Supabase Auth przetwarzanie tokenu
   - Przekierowanie do strony logowania

3. **Logowanie**:
   - Frontend: Formularz logowania -> Walidacja -> API request
   - Backend: Walidacja -> Supabase Auth signInWithPassword -> utworzenie sesji -> odpowiedź
   - Frontend: Zapisanie JWT w przeglądarce i przekierowanie

4. **Autoryzacja stron**:
   - Middleware sprawdza token JWT
   - Sprawdzenie polityk RLS w Supabase
   - Dostęp do zasobów lub przekierowanie

5. **Wylogowanie**:
   - Frontend: Kliknięcie przycisku wylogowania -> API request
   - Backend: Zakończenie sesji w Supabase Auth -> odpowiedź
   - Frontend: Usunięcie JWT i przekierowanie do strony logowania

### 4.3 Bezpieczeństwo

1. **Ochrona danych**:
   - Hasła są hashowane przez Supabase Auth
   - Dane profilu są chronione przez polityki RLS
   - Wszystkie zapytania wymagają ważnego tokenu JWT

2. **Polityki RLS**:
   - Użytkownicy mogą czytać tylko swój profil
   - Użytkownicy mogą modyfikować tylko swój profil
   - Użytkownicy mogą tworzyć i zarządzać tylko swoimi projektami

3. **Walidacja**:
   - Wszystkie dane wejściowe są walidowane przez schematy zod
   - Implementacja limitu prób logowania (przez Supabase Auth)

### 4.4 Uwagi końcowe

- Implementacja spełnia wszystkie wymagania z US-001, US-002 i US-003
- System wykorzystuje Row Level Security (RLS) Supabase dla ochrony danych
- Obsługa błędów jest zorganizowana i spójna
- Komunikaty dla użytkowników są przyjazne i informacyjne
- Formularze korzystają z dynamicznej walidacji